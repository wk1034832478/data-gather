import { Task } from '../Task';
import { Browser, Page } from 'puppeteer';
import * as wrapper from 'node-mysql-wrapper';
import { RedisDB } from '../../plugins/db/Redis';
import Logger from '../../lib/logger/Logger';
import { browserStartup, PageCube } from '../../plugins/browser/BrowserStartup';
import * as $ from 'jquery';
import { QICHACHA } from './QichachaURL';
import Sleep from '../../lib/sleep/sleep';
import { businessRisks } from './reptile/BusinessRisks';
import { knowledgeAssets } from './reptile/KnowledgeAssets';
import { reportInfo } from './reptile/ReportInfo';
import { lawsuit } from './reptile/Lawsuit';
import { businessStatus } from './reptile/BusinessStatus';
import { basicInfo } from './reptile/BasicInfo';
import { Company } from './entity/Company';
import { mysqlStorage } from './persist/MysqlStorage';
import { ShareHolder } from './entity/ShareHolder';
import { Invoice } from './entity/Invoice';
import { ChangeRecord } from './entity/ChangeRecord';
import { parser } from '../qichacha/parser/Parser';
/**
 * 企查查任务
 */
export class QichachaTask extends Task {
    title = '企查查任务';
    companyNames: string[];
    pageCube: PageCube;
    constructor(private browser: Browser, private mysqldb: wrapper.Database, private redisDB: RedisDB) {
        super();
    }
    /**
     * 
     */
    async init() {
        Logger.log(this, `任务正在初始化`);
        // 首先获取redis当中所有的公司名
        this.companyNames = await this.redisDB.keys('*');
        Logger.log(this, `获取公司名,数量为${this.companyNames.length}`);
        this.pageCube = await browserStartup.getFreeTab();
        this.signal = this.SIGNAL_RUNNING;
    }

    async start() {
        Logger.log(this, `启动任务`);
        for (let i = 0; i < this.companyNames.length; i++) {
            if (this.signal === this.SIGNAL_END) {
                Logger.log(this, '搜索任务终止！');
                break;
            }
            while (true) {
                try {
                    await this.searchByName(this.pageCube.page, this.companyNames[i]);
                    await Sleep.sleep(2000);
                    break;
                } catch (e) {
                    Logger.log(this, `搜索出错：${e}，准备重新搜索`);
                    await Sleep.sleep(2000);
                }
            }
        }
    }

    async stop() {
        Logger.log(this, '企查查任务终止');
    }

    /**
     * 根据名称在企查查里面搜索信息
     */
    async searchByName(page: Page, name: string) {
        Logger.log(this, `开始搜索【${name}】`);
        await page.bringToFront();
        page.goto(QICHACHA);
        await Sleep.sleep(2000);
        Logger.log(this, `正在输入搜索关键字-【${name}】`);
        const searchKey = await page.waitForSelector('#searchkey');
        await searchKey.type(name, { delay: 500 });
        await Sleep.sleep(2000);
        Logger.log(this, `点击搜索按钮！`);
        await page.keyboard.press('Enter', { delay: 500 });
        await page.waitForSelector('#countOld  span');
        const count = +(await page.$eval('#countOld  span', obj => {
            return obj.innerHTML;
        }));
        await Sleep.sleep(2000);
        Logger.log(this, `查找到${count}条记录`);
        if (count === 0) {
            return;
        }
        // await page.waitForSelector( '#searchlist' ); // 当出现了这个选择器的内容时，说明搜索结果出来了,如果没有出来，可能是网络问题，也可能是不存在相关数据列表
        Logger.log(this, `判断是否含有【${name}】信息`);
        const href = await this.hasInfo(page, name);
        Logger.log(this, `结果${href}`);
        if (href) { //
            await Sleep.sleep(1000);
            Logger.log(this, `进入公司的详情页面`);
            await page.goto(QICHACHA + href); // 公司的详情页面
            await this.parseInfo(page);
        }
    }

    async hasInfo(page: Page, name: string) {
        return await page.evaluate((name) => {
            let titles = $('a.ma_h1');
            for (let i = 0; i < titles.length; i++) {
                const em = titles[i].querySelector('em>em');
                if (em && em.innerHTML === name) {
                    return titles[i].getAttribute('href');
                }
                return null;
            }
        }, name);
    }

    async parseInfo(page: Page) {
        let info: Company = await page.evaluate(() => {
            const map = {
                '公司名': $('#company-top h1').text(),
                '曾用名': $($('.nstatus.text-warning.tooltip-br').attr('data-original-title')).text(),
                '电话': $('.cdes:contains("电话")+span.cvlu').text(),
                '官网': $('.cdes:contains("官网")+span.cvlu').text(),
                '邮箱': $('.cdes:contains("邮箱")+span.cvlu').text(),
                '地址': $('.cdes:contains("地址")+span.cvlu').text(),
                '在业状态': $('.nstatus.text-success-lt.m-l-xs').text(),
                'ceo': $('.seo.font-20').text(),
                '注册资本': $('#Cominfo .ntable .tb:contains("注册资本")+td').text(),
                '实缴资本': $('#Cominfo .ntable .tb:contains("实缴资本")+td').text(),
                '经营状态': $('#Cominfo .ntable .tb:contains("经营状态")+td').text(),
                '成立日期': $('#Cominfo .ntable .tb:contains("成立日期")+td').text(),
                '统一社会信用代码': $('#Cominfo .ntable .tb:contains("统一社会信用代码")+td').text(),
                '纳税人识别号': $('#Cominfo .ntable .tb:contains("纳税人识别号")+td').text(),
                '注册号': $('#Cominfo .ntable .tb:contains("注册号")+td').text(),
                '组织机构代码': $('#Cominfo .ntable .tb:contains("组织机构代码")+td').text(),
                '公司类型': $('#Cominfo .ntable .tb:contains("公司类型")+td').text(),
                '所属行业': $('#Cominfo .ntable .tb:contains("所属行业")+td').text(),
                '核准日期': $('#Cominfo .ntable .tb:contains("核准日期")+td').text(),
                '登记机关': $('#Cominfo .ntable .tb:contains("登记机关")+td').text(),
                '所属地区': $('#Cominfo .ntable .tb:contains("所属地区")+td').text(),
                '英文名': $('#Cominfo .ntable .tb:contains("英文名")+td').text(),
                '参保人数': $('#Cominfo .ntable .tb:contains("参保人数")+td').text(),
                '人员规模': $('#Cominfo .ntable .tb:contains("人员规模")+td').text(),
                '营业期限': $('#Cominfo .ntable .tb:contains("营业期限")+td').text(),
                '企业地址': $('#Cominfo .ntable .tb:contains("企业地址")+td').text(),
                '经营范围': $('#Cominfo .ntable .tb:contains("经营范围")+td').text(),
                '投资总数': $('#touzilist .tcaption .tbadge').text(),
            };
            return map;
        });
        try {
            let company: Company = await mysqlStorage.storeCompany(info);
            info = company;
            Logger.log(this, `公司信息存储成功-${company.公司名}`);
        } catch (e) {
            Logger.log(this, `公司信息存储失败-${e}`);
            return;
        }
        Logger.log(this, '开始调用企查查子组件爬取信息');
        await this.getBasicInfo(page, info);
        await this.getBusinessRisk(page, info);
        await this.getBusinessStatus(page, info);
        await this.getKnowledgeAsset(page, info);
        await this.getLawsuit(page, info);
        await this.getReportInfo(page, info);
        Logger.log(this, '信息获取完成！准备装入数据库');
    }
    async getBasicInfo(page: Page, comapny: Company) {
        Logger.log(this, `开始获取企业基本信息`);
        try {
            const shareholders: ShareHolder[] = await basicInfo.getShareHolder(page);
            for (let i = 0; i < shareholders.length; i++) {
                const shareholder = shareholders[i];
                shareholder.company_id = comapny.id;
                mysqlStorage.storeShareHolder(shareholder);
            }
        } catch (e) {
            Logger.log(this, `股东信息获取失败或信息不存在！`);
        }
        try {
            const invoice: Invoice = await basicInfo.getTax(page);
            invoice.company_id = comapny.id;
            mysqlStorage.storeObject(invoice, 'invoice', { '税号': invoice.税号 });
        } catch (e) {
            Logger.log(this, `发票信息获取失败或信息不存在！`);
        }
        try {
            const changeRecord: string[] = await basicInfo.getChange(page);
            const changeRecords: ChangeRecord[] = parser.parseStringArray(changeRecord);
            Logger.log(this, `测试：${changeRecords[0].变更前}`);
            for( let i = 0; i < changeRecords.length; i++) {
                changeRecords[i].company_id = comapny.id;
                mysqlStorage.storeObjectOrReturn( changeRecords[i], 'change_record', { 
                'company_id': changeRecords[i].company_id, '变更项目': changeRecords[i].变更项目,'变更前': changeRecords[i].变更前,'变更后': changeRecords[i].变更后 } );
            }
        } catch (e) {
            Logger.log(this, `变更记录信息获取失败或信息不存在！${e}`);
        }
        try {
            await basicInfo.getMainMember(page);
        } catch (e) {
            Logger.log(this, `主要成员信息获取失败或信息不存在！`);
        }
        try {
            await basicInfo.getSubcom(page);
        } catch (e) {
            Logger.log(this, `分支机构信息获取失败或信息不存在！`);
        }
        try {
            await basicInfo.getTouZiInfo(page);
        } catch (e) {
            Logger.log(this, `投资信息获取失败或信息不存在！`);
        }
    }

    async getBusinessRisk(page: Page, comapny: Company) {
        Logger.log(this, `开始获取商业风险信息`);
        try {
            await businessRisks.getPenaltylist(page);
        } catch (e) {
            Logger.log(this, `股权出质信息获取失败或信息不存在！`);
        }
        try {
            await businessRisks.getPledgeList(page);
        } catch (e) {
            Logger.log(this, `工商行政处罚信息获取失败或信息不存在！`);
        }
        try {
            await businessRisks.getXinYongZhongGuoPledgeList(page);
        } catch (e) {
            Logger.log(this, `信用中国处罚信息获取失败或信息不存在！`);
        }
    }

    async getBusinessStatus(page: Page, comapny: Company) {
        try {
            await businessStatus.getCaiWuZongLan(page);
        } catch (e) {
            Logger.log(this, `财务总览信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getJinChuKouXinYong(page);
        } catch (e) {
            Logger.log(this, `进出口信用信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getLandpublist(page);
        } catch (e) {
            Logger.log(this, `地块信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getLandpurchaselist(page);
        } catch (e) {
            Logger.log(this, `购地信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getProductList(page);
        } catch (e) {
            Logger.log(this, `产品列表信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getRongZiXinXi(page);
        } catch (e) {
            Logger.log(this, `融资信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getSpotCheckList(page);
        } catch (e) {
            Logger.log(this, `抽查检查信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getSuiWuXinYong(page);
        } catch (e) {
            Logger.log(this, `税务信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getTelecomlist(page);
        } catch (e) {
            Logger.log(this, `电信信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getWeChatPublic(page);
        } catch (e) {
            Logger.log(this, `微信公众号信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getXingZhengXuKeOfGongShang(page);
        } catch (e) {
            Logger.log(this, `工商局行政许可信息获取失败或信息不存在！`);
        }
        try {
            await businessStatus.getXingZhengXuKeOfXinYongZhongGuo(page);
        } catch (e) {
            Logger.log(this, `信用中国行政许可信息获取失败或信息不存在！`);
        }
    }

    async getKnowledgeAsset(page: Page, comapny: Company) {
        try {
            await knowledgeAssets.getRjzzqlist(page);
        } catch (e) {
            Logger.log(this, `软件著作权信息获取失败或信息不存在！`);
        }
        try {
            await knowledgeAssets.getShangBiao(page);
        } catch (e) {
            Logger.log(this, `商标信息获取失败或信息不存在！`);
        }
        try {
            await knowledgeAssets.getWebsiteList(page);
        } catch (e) {
            Logger.log(this, `网站信息获取失败或信息不存在！`);
        }
        try {
            await knowledgeAssets.getZhengshuList(page);
        } catch (e) {
            Logger.log(this, `证书信息获取失败或信息不存在！`);
        }
        try {
            await knowledgeAssets.getZhuanli(page);
        } catch (e) {
            Logger.log(this, `专利信息获取失败或信息不存在！`);
        }
        try {
            await knowledgeAssets.getZZQList(page);
        } catch (e) {
            Logger.log(this, `作品著作权信息获取失败或信息不存在！`);
        }
    }

    async getLawsuit(page: Page, comapny: Company) {
        try {
            await lawsuit.getFaYuanGongGao(page);
        } catch (e) {
            Logger.log(this, `法院公告信息获取失败或信息不存在！`);
        }
        try {
            await lawsuit.getLawsuit(page);
        } catch (e) {
            Logger.log(this, `被执行人信息获取失败或信息不存在！`);
        }
        try {
            await lawsuit.getNoticelist(page);
        } catch (e) {
            Logger.log(this, `开庭公告信息获取失败或信息不存在！`);
        }
        try {
            await lawsuit.getWenshuList(page);
        } catch (e) {
            Logger.log(this, `裁判文书信息获取失败或信息不存在！`);
        }
    }

    async getReportInfo(page: Page, comapny: Company) {
        try {
            const report = await reportInfo.getInfo(page);
        } catch (e) {
            Logger.log(this, `企业年报信息获取失败或信息不存在！`);
        }
    }
}
