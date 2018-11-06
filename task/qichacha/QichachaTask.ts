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
import { MainMember } from './entity/MainMember';
import { Subcom } from './entity/Subcom';
import { Touzi } from './entity/Touzi';
import { parser } from '../qichacha/parser/Parser';
import { Penalty } from './entity/Penalty';
import { XinYongZhongGuoPenalty } from './entity/XinYongZhongGuoPenalty';
import { Pledge } from './entity/Pledge';
import { Caiwu } from './entity/Caiwu';
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
        let info = await page.evaluate(() => {
            const map = {
                '公司名': $('#company-top h1').text().trim(),
                '曾用名': $($('.nstatus.text-warning.tooltip-br').attr('data-original-title')).text().trim(),
                '电话': $('.cdes:contains("电话")+span.cvlu').text().trim(),
                '官网': $('.cdes:contains("官网")+span.cvlu').text().trim(),
                '邮箱': $('.cdes:contains("邮箱")+span.cvlu').text().trim(),
                '地址': $('.cdes:contains("地址")+span.cvlu').text().trim(),
                '在业状态': $('.nstatus.text-success-lt.m-l-xs').text().trim(),
                'ceo': $('.seo.font-20').text().trim(),
                '注册资本': $('#Cominfo .ntable .tb:contains("注册资本")+td').text().trim(),
                '实缴资本': $('#Cominfo .ntable .tb:contains("实缴资本")+td').text().trim(),
                '经营状态': $('#Cominfo .ntable .tb:contains("经营状态")+td').text().trim(),
                '成立日期': $('#Cominfo .ntable .tb:contains("成立日期")+td').text().trim(),
                '统一社会信用代码': $('#Cominfo .ntable .tb:contains("统一社会信用代码")+td').text().trim(),
                '纳税人识别号': $('#Cominfo .ntable .tb:contains("纳税人识别号")+td').text().trim(),
                '注册号': $('#Cominfo .ntable .tb:contains("注册号")+td').text().trim(),
                '组织机构代码': $('#Cominfo .ntable .tb:contains("组织机构代码")+td').text().trim(),
                '公司类型': $('#Cominfo .ntable .tb:contains("公司类型")+td').text().trim(),
                '所属行业': $('#Cominfo .ntable .tb:contains("所属行业")+td').text().trim(),
                '核准日期': $('#Cominfo .ntable .tb:contains("核准日期")+td').text().trim(),
                '登记机关': $('#Cominfo .ntable .tb:contains("登记机关")+td').text().trim(),
                '所属地区': $('#Cominfo .ntable .tb:contains("所属地区")+td').text().trim(),
                '英文名': $('#Cominfo .ntable .tb:contains("英文名")+td').text().trim(),
                '参保人数': $('#Cominfo .ntable .tb:contains("参保人数")+td').text().trim(),
                '人员规模': $('#Cominfo .ntable .tb:contains("人员规模")+td').text().trim(),
                '营业期限': $('#Cominfo .ntable .tb:contains("营业期限")+td').text().trim(),
                '企业地址': $('#Cominfo .ntable .tb:contains("企业地址")+td').text().trim(),
                '经营范围': $('#Cominfo .ntable .tb:contains("经营范围")+td').text().trim(),
                '投资总数': $('#touzilist .tcaption .tbadge').text().trim(),
            };
            return map;
        });
        Logger.log(this, '开始调用企查查子组件爬取信息');
        let company: any = [];
        const outBasicInfo = await this.getBasicInfo(page );
        const outBusinessRisk = await this.getBusinessRisk(page );
        const outBusinessStatus = await this.getBusinessStatus(page );
        const outKnowledgeAsset = await this.getKnowledgeAsset(page );
        const outLawsuit = await this.getLawsuit(page );
        const outReportInfo = await this.getReportInfo(page );
        company[ '企业' ] = info;
        company[ '基本信息' ] = outBasicInfo;
        company[ '商业风险信息' ] = outBusinessRisk;
        company[ '经营状况信息' ] = outBusinessStatus;
        company[ '知识产权信息' ] = outKnowledgeAsset;
        company[ '法律诉讼信息' ] = outLawsuit;
        company[ '企业年报信息' ] = outReportInfo;
        Logger.log(this, '信息获取完成！开始将信息装入到数据库当中。');
        await mysqlStorage.storeCompanyInfoOfAll( company );
    }
    // 获取基本信息
    async getBasicInfo(page: Page ) {
        Logger.log(this, `开始获取企业基本信息`);
        let outBasicInfo: any= [];
        try {
            const shareholders: ShareHolder[] = await basicInfo.getShareHolder(page);
            outBasicInfo[ '股东信息' ] = shareholders;
        } catch (e) {
            Logger.log(this, `股东信息获取失败或信息不存在！${ e }`);
        }
        try {
            const invoice: Invoice = await basicInfo.getTax(page);
            outBasicInfo[ '发票信息' ] = invoice;
        } catch (e) {
            Logger.log(this, `发票信息获取失败或信息不存在！${ e }`);
        }
        try {
            const changeRecordStr: string[] = await basicInfo.getChange(page);
            const changeRecords: ChangeRecord[] = parser.parseStringArray(changeRecordStr);
            outBasicInfo[ '变更记录' ] = changeRecords;
        } catch (e) {
            Logger.log(this, `变更记录信息获取失败或信息不存在！${ e }`);
        }
        try {
            const mainMemberStr: string[] = await basicInfo.getMainMember(page);
            const mainMembers: MainMember[] = parser.parseStringArray(mainMemberStr);
            outBasicInfo[ '主要成员' ] = mainMembers;
        } catch (e) {
            Logger.log(this, `主要成员信息获取失败或信息不存在！${ e }`);
        }
        try {
            const subcomStr: string = await basicInfo.getSubcom(page);
            const subcoms = parser.parseStringOfValueToArray(subcomStr);
            outBasicInfo[ '分支机构' ] = subcoms;
        } catch (e) {
            Logger.log(this, `分支机构信息获取失败或信息不存在！${ e }`);
        }
        try {
            const touziStrs = await basicInfo.getTouZiInfo(page);
            const touzis: Touzi[] = parser.parseStringArray(touziStrs);
            outBasicInfo[ '投资信息' ] = touzis;
        } catch (e) {
            Logger.log(this, `投资信息获取失败或信息不存在！${ e }`);
        }
        return outBasicInfo;
    }

    async getBusinessRisk(page: Page ) {
        Logger.log(this, `开始获取商业风险信息`);
        let outBusinessRisk: any= [];
        try {
            const penaltyStrs = await businessRisks.getPenaltylist(page);
            const penalties: Penalty[] = parser.parseStringArray(penaltyStrs);
            outBusinessRisk[ '工商局行政处罚' ] = penalties;
        } catch (e) {
            Logger.log(this, `工商行政处罚信息获取失败或信息不存在！${ e }`);
        }
        try {
            const pledgeStrs = await businessRisks.getPledgeList(page);
            const pledges: Pledge[] = parser.parseStringArray(pledgeStrs);
            outBusinessRisk[ '股权出质' ] = pledges;
        } catch (e) {
            Logger.log(this, `股权出质信息获取失败或信息不存在！${ e }`);
        }
        try {
            const penalties = await businessRisks.getXinYongZhongGuoPenaltyList(page);
            const xyzhpenalties: XinYongZhongGuoPenalty[] = parser.parseStringArray(penalties);
            outBusinessRisk[ '信用中国处罚行政' ] = xyzhpenalties;
        } catch (e) {
            Logger.log(this, `信用中国处罚信息获取失败或信息不存在！${ e }`);
        }
        return outBusinessRisk;
    }

    async getBusinessStatus(page: Page ) {
        Logger.log( this, `开始获取经营状况` );
        let outBusinessStatus: any = [];
        try {
            const caiwuStr = await businessStatus.getCaiWuZongLan(page);
            const caiwu: Caiwu = parser.parseStringArray([caiwuStr])[0];
            outBusinessStatus[ '财务总览' ] = caiwu;
        } catch (e) {
            Logger.log(this, `财务总览信息获取失败或信息不存在！${ e }`);
        }
        try {
            const jinchukouStr = await businessStatus.getJinChuKouXinYong(page);
            const jinchukou = parser.parseStringArray( jinchukouStr );
            outBusinessStatus[ '进出口信用' ] = jinchukou;
        } catch (e) {
            Logger.log(this, `进出口信用信息获取失败或信息不存在！${ e }`);
        }
        try {
            const langPublistStr = await businessStatus.getLandpublist(page);
            const langPublist = parser.parseStringArray( langPublistStr );
            outBusinessStatus[ '地块公示' ] = langPublist;
        } catch (e) {
            Logger.log(this, `地块信息获取失败或信息不存在！${ e }`);
        }
        try {
            const langPurchaseListStr =  await businessStatus.getLandpurchaselist(page);
            const langPurchaseList = parser.parseStringArray( langPurchaseListStr );
            outBusinessStatus[ '购地信息' ] = langPurchaseList;
        } catch (e) {
            Logger.log(this, `购地信息获取失败或信息不存在！${ e }`);
        }
        try {
            const chanpinStr = await businessStatus.getProductList(page);
            const chanpin = parser.parseStringArray( chanpinStr );
            outBusinessStatus[ '产品列表' ] = chanpin;
        } catch (e) {
            Logger.log(this, `产品列表信息获取失败或信息不存在！${ e }`);
        }
        try {
            const rongziStr = await businessStatus.getRongZiXinXi(page);
            const rongzi = parser.parseStringArray( rongziStr );
            outBusinessStatus[ '融资信息' ] = rongzi;
        } catch (e) {
            Logger.log(this, `融资信息获取失败或信息不存在！${ e }`);
        }
        try {
            const spotCheckListStr = await businessStatus.getSpotCheckList(page);
            const spotCheckList = parser.parseStringArray( spotCheckListStr );
            outBusinessStatus[ '抽查检查' ] = spotCheckList;
        } catch (e) {
            Logger.log(this, `抽查检查信息获取失败或信息不存在！${ e }`);
        }
        try {
            const suiwuXinYongStr = await businessStatus.getSuiWuXinYong(page);
            const suiwuXinYong = parser.parseStringArray( suiwuXinYongStr );
            outBusinessStatus[ '税务信用' ] = suiwuXinYong;
        } catch (e) {
            Logger.log(this, `税务信用获取失败或信息不存在！${e}`);
        }
        try {
            const telecomListStr = await businessStatus.getTelecomlist(page);
            const telecomList = parser.parseStringArray( telecomListStr );
            outBusinessStatus[ '电信许可' ] = telecomList;
        } catch (e) {
            Logger.log(this, `电信信息获取失败或信息不存在！${ e }`);
        }
        try {
            const wechatPublicStr = await businessStatus.getWeChatPublic(page);
            const wechatPublic = parser.parseStringArray( wechatPublicStr );
            outBusinessStatus[ '微信公众号' ] = wechatPublic;
        } catch (e) {
            Logger.log(this, `微信公众号信息获取失败或信息不存在！${ e }`);
        }
        try {
            const xingzhengxukeOfGongShangStr = await businessStatus.getXingZhengXuKeOfGongShang(page);
            const xingzhengxukeOfGongShang = parser.parseStringArray( xingzhengxukeOfGongShangStr );
            outBusinessStatus[ '工商局行政许可' ] = xingzhengxukeOfGongShang;
        } catch (e) {
            Logger.log(this, `工商局行政许可信息获取失败或信息不存在！${ e }`);
        }
        try {
            const XinYongZhongGuoStr = await businessStatus.getXingZhengXuKeOfXinYongZhongGuo(page);
            const XinYongZhongGuo = parser.parseStringArray( XinYongZhongGuoStr );
            outBusinessStatus[ '信用中国行政许可' ] = XinYongZhongGuo;
        } catch (e) {
            Logger.log(this, `信用中国行政许可信息获取失败或信息不存在！${ e }`);
        }
        return outBusinessStatus;
    }

    async getKnowledgeAsset(page: Page ) {
        Logger.log(this, '开始获取知识产权信息');
        let outKnowledgeAsset: any = [];
        try {
            const rjzzqListStr = await knowledgeAssets.getRjzzqlist(page);
            const rjzzqList = parser.parseStringArray( rjzzqListStr );
            outKnowledgeAsset[ '软件著作权信息' ] = rjzzqList;
        } catch (e) {
            Logger.log(this, `软件著作权信息获取失败或信息不存在！${ e }`);
        }
        try {
            const shangbiaoStr = await knowledgeAssets.getShangBiao(page);
            const shangbiao = parser.parseStringArray( shangbiaoStr );
            outKnowledgeAsset[ '商标信息' ] = shangbiao;
        } catch (e) {
            Logger.log(this, `商标信息获取失败或信息不存在！${ e }`);
        }
        try {
            const websiteListStr = await knowledgeAssets.getWebsiteList(page);
            const shangbiao = parser.parseStringArray( websiteListStr );
            outKnowledgeAsset[ '网站信息' ] = shangbiao;
        } catch (e) {
            Logger.log(this, `网站信息获取失败或信息不存在！${ e }`);
        }
        try {
            const zhengshuListStr = await knowledgeAssets.getZhengshuList(page);
            const zhengshuList = parser.parseStringArray( zhengshuListStr );
            outKnowledgeAsset[ '证书信息' ] = zhengshuList;
        } catch (e) {
            Logger.log(this, `证书信息获取失败或信息不存在！${ e }`);
        }
        try {
            const zhuanliStr = await knowledgeAssets.getZhuanli(page);
            const zhuanli = parser.parseStringArray( zhuanliStr );
            outKnowledgeAsset[ '专利信息' ] = zhuanli;
        } catch (e) {
            Logger.log(this, `专利信息获取失败或信息不存在！${ e }`);
        }
        try {
            const zzqStr = await knowledgeAssets.getZZQList(page);
            const zzq = parser.parseStringArray( zzqStr );
            outKnowledgeAsset[ '作品著作权' ] = zzq;
        } catch (e) {
            Logger.log(this, `作品著作权信息获取失败或信息不存在！${ e }`);
        }
        return outKnowledgeAsset;
    }

    async getLawsuit(page: Page ) {
        Logger.log(this, '开始获取法律诉讼信息');
        let outLawsuitInfo: any = [];
        try {
            const fayuanGongGaoStr = await lawsuit.getFaYuanGongGao(page);
            const fayuanGongGao = parser.parseStringArray( fayuanGongGaoStr );
            outLawsuitInfo[ '法院公告' ] = fayuanGongGao;
        } catch (e) {
            Logger.log(this, `法院公告信息获取失败或信息不存在！${ e }`);
        }
        try {
            const beizhixingrenXinXiStr = await lawsuit.getLawsuit(page);
            const beizhixingrenXinXi = parser.parseStringArray( beizhixingrenXinXiStr );
            outLawsuitInfo[ '被执行人信息' ] = beizhixingrenXinXi;
        } catch (e) {
            Logger.log(this, `被执行人信息获取失败或信息不存在！${ e }`);
        }
        try {
            const noticeListStr = await lawsuit.getNoticelist(page);
            const noticeList = parser.parseStringArray( noticeListStr );
            outLawsuitInfo[ '开庭公告信息' ] = noticeList;
        } catch (e) {
            Logger.log(this, `开庭公告信息获取失败或信息不存在！${ e }`);
        }
        try {
            const caipanwenshuStr = await lawsuit.getWenshuList(page);
            const caipanwenshu = parser.parseStringArray( caipanwenshuStr );
            outLawsuitInfo[ '裁判文书信息' ] = caipanwenshu;
        } catch (e) {
            Logger.log(this, `裁判文书信息获取失败或信息不存在！${ e }`);
        }
        return outLawsuitInfo;
    }

    async getReportInfo(page: Page) {
        try {
            const report = await reportInfo.getInfo(page);
            return report;
        } catch (e) {
            Logger.log(this, `企业年报信息获取失败或信息不存在！${ e }`);
            return null;
        }
    }
}
