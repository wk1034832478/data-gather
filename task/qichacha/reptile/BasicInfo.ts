
import { Page } from 'puppeteer';
import { common } from './Common';
export class BasicInfo {
    // 获取 股东信息
    async getShareHolder( page: Page ) {
        return await page.evaluate( () => {
            // 获取股东信息
            const socks = [];
            const sockTrs = $('#Sockinfo .ntable.ntable-odd tr');
            if (sockTrs.length > 0) { // 存在股东信息
                const headers = sockTrs[0].querySelectorAll('th');
                for (let i = 1; i < sockTrs.length; i++) {
                    const tr = sockTrs[i];
                    const tds = tr.querySelectorAll('td');
                    let 序号, 股东, 持股比例, 认缴出资额, 认缴出资日期;
                    for (let j = 0; j < tds.length; j++) {
                        const td = tds[j];
                        if (headers[j].innerText.indexOf('序号') !== -1) { 序号 = td.innerText; }
                        if (headers[j].innerText.indexOf('股东') !== -1) { 股东 = ( $( td ).find('a').get(0).innerText ); }
                        if (headers[j].innerText.indexOf('持股比例') !== -1) { 持股比例 = td.innerText; }
                        if (headers[j].innerText.indexOf('认缴出资额') !== -1) { 认缴出资额 = td.innerText; }
                        if (headers[j].innerText.indexOf('认缴出资日期') !== -1) { 认缴出资日期 = td.innerText; }
                    }
                    socks.push({ 序号: 序号, 股东: 股东, 持股比例: 持股比例, 认缴出资额: 认缴出资额, 认缴出资日期: 认缴出资日期 });
                }
            }
            return socks;
        });
    }

    // 获取 发票信息
    async getTax( page: Page ) {
        return await page.evaluate( () => {
            // 获取 发票信息
            const 发票 = {
                '名称':$( `#fapiao-title .m-t-md.TaxView p:contains('名称')` ).find('span').text(),
                '税号':$( `#fapiao-title .m-t-md.TaxView p:contains('税号')` ).find('span').text(),
                '地址':$( `#fapiao-title .m-t-md.TaxView p:contains('地址')` ).find('span').text(),
                '电话':$( `#fapiao-title .m-t-md.TaxView p:contains('电话')` ).find('span').text(),
                '开户银行':$( `#fapiao-title .m-t-md.TaxView p:contains('开户银行')` ).find('span').text(),
                '银行账户':$( `#fapiao-title .m-t-md.TaxView p:contains('银行账户')` ).find('span').text(),
            };
            return 发票;
        })
    }

    /**
         * 获取主要的成员
         */
    async getMainMember(page: Page) {
        return await common.getTableHasHeaderInfo('主要成员', page, '#base_title', '#Mainmember', '#Mainmember tr',
            ['序号', '姓名', '职务']);
    }

    /**
     * 
     * @param page 获取投资信息
     */
    async getTouZiInfo(page: Page) {
        return await common.getTableHasHeaderInfo('投资信息', page, '#base_title', '#touzilist', '#touzilist tr',
            ['被投资企业名称', '被投资法定代表人', '注册资本', '出资比例', '成立日期', '状态']);
    }

    // 获取分支机构
    async getSubcom(page: Page) {
        return await common.getTableNoHeaderInfo('分支机构', page, '#base_title', '#Subcom',
            [], '#Subcom td.tb');
    }


    // 获取变更信息
    async getChange(page: Page) {
        return await common.getTableHasHeaderInfo('变更记录', page, '#base_title', '#Changelist','#Changelist tr',
            ['序号', '变更日期', '变更项目', '变更前', '变更后']);
    }
}
export const basicInfo = new BasicInfo();
