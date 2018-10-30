
import { Page } from 'puppeteer';
import Logger from '../../../lib/logger/Logger';
import Sleep from '../../../lib/sleep/sleep';
import { COLUMN_DEMILITER, ROW_DEMILITER } from '../../../lib/str/Delimiter';
export class Common {
    title = '企查查公共组件';
    /**
    * 判断列表是否含有下一页
    * @param page 
    * @param selectorHeader 
    */
    async nextList(page: Page, selectorHeader: string) {
        const nextPage = +(await page.$$eval(`${selectorHeader} .pagination li a`, as => {
            for (let i = 0; i < as.length; i++) {
                if ('&gt;' === as[i].innerHTML.trim()) {
                    return i
                }
            }
            return -1;
        }));
        if (nextPage === -1) {
            return false;
        }
        Logger.log(this, `下一页信息：${nextPage}`);
        const nextA = await page.$(`${selectorHeader} .pagination li:nth-child(${nextPage + 1}) a`);
        if (nextA) {
            // 判断投资列表是否有下一页
            Logger.log(this, `进入下一页！`);
            await nextA.click(); // 点击该链接将间接导致导航(跳转)
            await Sleep.sleep(2000);
            return true;
        }
        await Sleep.sleep(2000);
        return false;
    }
    /**
     * 获取列表中需要弹出模态框的信息，每一行，都需要弹出模态框才能抓取信息，返回的是列表数据
     */
    async getListOfModal(page: Page, title: string, triggerBtnSelector: string, listSelector: string, openModalContent: string, closeModalSelector: string, columns: string[], columnsSelector: string) {
        Logger.log(this, `${title}`);
        const run = await page.$(triggerBtnSelector);
        if (!run) {
            return;
        }
        await run.click();
        await page.waitForSelector(listSelector, { timeout: 5000} ); // 行政许可列表
        let list: any[] = [];
        let index;
        while (true) {
            index = 1;
            while (true) {
                Logger.log(this, `打开【${title}】模态框`);
                let signal: number = +(await page.evaluate((index, listSelector, openModalContent) => {
                    const trs = $(listSelector + ' tr');
                    if (index === trs.length) {
                        return 0;
                    }
                    const headers = trs[0].querySelectorAll('th'); // 表格的头信息
                    for (let i = index; i < trs.length; i++) {
                        const tds = trs[i].querySelectorAll('td');
                        if (!tds || tds.length === 0) { return -1; } // 必须跳出循环，否则可能会因为空行导致出现重复的信息
                        for (let j = 0; j < tds.length; j++) {
                            if (headers[j].innerText.indexOf(openModalContent) !== -1) {
                                $(tds[j]).children('a').click(); // 打开模态框
                                return index;
                            }
                        }
                    }
                }, index, listSelector, openModalContent));
                if (signal === 0) {
                    break;
                } else if ( signal === -1 ) { // 空行
                    Logger.log(this, `网页表格出现空行`);
                    index++;
                    continue;
                }
                await Sleep.sleep(1500);
                // 从模块框获取数据
                let obj;
                if (columns && columns.length > 0) {
                    obj = await this.getDataFromModalByColumns(page, columns, columnsSelector);
                } else {
                    obj = await this.getDataFromModal(page, columnsSelector);
                }
                await Sleep.sleep(1500);
                Logger.log(this, `关闭【${title}】模态框`);
                await page.evaluate((closeModalSelector) => {
                    $(closeModalSelector).click() // 关闭模态框
                }, closeModalSelector);
                await Sleep.sleep(1500);
                list.push(obj);
                index++;
            }
            Logger.log(this, `当前 【${title}】 列表长度为:${list.length}}`);
            if (!(await common.nextList(page, listSelector))) {
                break;
            }
        }
        return list;
    }
    // 获取模态框里面的数据，当不提供字段列表时
    async getDataFromModal(page: Page, columnsSelector: string) {
        const obj: string[] = await page.evaluate((columnsSelector) => {
            let obj = [];
            const tds2 = $(columnsSelector);
            for (let i = 0; i < tds2.length; i++) {
                const td = tds2[i];
                // 判断是否有图片
                let nextTd = $(td).next();
                let img = nextTd.find('img');
                if (img && img.length > 0) { // 存在img
                    obj.push( td.innerText + '=' +img.attr('src'));
                    continue;
                }
                obj.push(td.innerText + '=' + nextTd.text());
                continue;
            }
            return obj;
        }, columnsSelector);

        const obj2 = new Map<any, any>();
        for (let i = 0; i < obj.length; i++) {
            const kv = obj[i].split('=');
            Logger.log(this, `${kv[0]} = ${kv[1]}`);
            obj2.set(kv[0], kv[1]);
        }
        return obj2;
    }
    // 获取模态框里面的数据，当提供字段列表时
    async getDataFromModalByColumns(page: Page, columns: string[], columnsSelector: string) {
        const obj = await page.evaluate((columns, columnsSelector) => {
            let obj = [];
            const tds2 = $(columnsSelector);
            for (let i = 0; i < tds2.length; i++) {
                const td = tds2[i];
                for (let j = 0; j < columns.length; j++) {
                    if (td.innerText.indexOf(columns[j]) !== -1) {
                        // 判断是否有图片
                        let nextTd = $(td).next();
                        let img = nextTd.find('img');
                        if ( img && img.length > 0 ) { // 存在img
                            obj.push(img.attr('src'));
                            break;
                        }
                        obj.push(nextTd.text());
                        break;
                    }
                }
            }
            return obj;
        }, columns, columnsSelector);
        const obj2 = new Map<any, any>();
        for (let i = 0; i < obj.length; i++) {
            Logger.log(this, `${columns[i]}: ${obj[i]}`);
            obj2.set(columns[i], obj[i]);
        }
        return obj2;
    }
    // 获取无头信息的企业基本信息
    async getTableNoHeaderInfo(title: string, page: Page, startupSelector: string, listSelector: string, columns: string[], columnSelectors: string): Promise<string> {
        Logger.log(this, `开始获取无头表格信息-${title}`);
        let obj: string = '';
        const run = await page.$(startupSelector);
        if (!run) {
            return;
        }
        await run.click();
        await page.waitForSelector(listSelector,  { timeout: 5000} ); // 行政许可列表
        while (true) {
            obj += await page.evaluate((columns: string[], columnSelectors: string, COLUMN_DEMILITER: string) => {
                const tds = $(columnSelectors);
                let obj = '';
                for (let i = 0; i < tds.length; i++) {
                    const td = tds[i];
                    if ( !columns || columns.length === 0) {
                        obj += td.innerText + '=' + $(td).next().text() + COLUMN_DEMILITER;
                    } else {
                        for (let j = 0; j < columns.length; j++) {
                            if (td.innerText.indexOf(columns[j]) !== -1) {
                                obj += columns[j] + '=' + $(td).next().text() + COLUMN_DEMILITER;
                                break;
                            }
                        }
                    }
                }
                return obj;
            }, columns, columnSelectors, COLUMN_DEMILITER);
            if (!(await common.nextList(page, listSelector))) {
                break;
            }
        }
        Logger.log(this, `获取的信息：${obj}`);
        return obj;
    }

    /**
     * 获取表格有头信息的表格
     */
    async getTableHasHeaderInfo(title: string, page: Page, startupSelector: string, listTableSelector: string, listSelector: string, columns: string[]): Promise<string[]> {
        Logger.log(this, `${title}`);
        const startup = await page.$(startupSelector);
        if (!startup) {
            return;
        }
        await startup.click();
        await page.waitForSelector(listSelector,  { timeout: 5000} );
        let list: any[] = [];
        while (true) {
            const list2 = await page.evaluate((listSelector, columns, COLUMN_DEMILITER, ROW_DEMILITER) => {
                let list = [];
                const trs = $(listSelector);
                const headers = trs[0].querySelectorAll('th'); // 表格的头信息
                for (let i = 1; i < trs.length; i++) {
                    let obj = '';
                    const tds = trs[i].querySelectorAll('td');
                    if (!tds || tds.length === 0) { continue; }
                    for (let j = 0; j < tds.length; j++) {
                        for (let k = 0; k < columns.length; k++) {
                            if (headers[j].innerText.indexOf(columns[k]) !== -1) { 
                                // 获取其中的图片，并且必须是最后一张，防止网站隐藏
                                let imgs = $( tds[j] ).find( 'img' );
                                if ( imgs && imgs.length > 0) {
                                    obj += columns[k] + '=' + imgs.get( imgs.length - 1 ).getAttribute( 'src')  + COLUMN_DEMILITER;
                                    break;
                                }
                                obj += columns[k] + '=' + tds[j].innerText + COLUMN_DEMILITER;
                                break;
                            }
                        }
                    }
                    obj += ROW_DEMILITER;
                    list.push(obj);
                }
                return list;
            }, listSelector, columns, COLUMN_DEMILITER, ROW_DEMILITER);
            Logger.log(this, `本地获取:${list}`);
            list = [...list, list2];
            if (!(await common.nextList(page, listTableSelector))) {
                break;
            }
        }
        Logger.log(this, `获取的有头表格信息：${list}`);
        return list;
    }
}
export const common = new Common();