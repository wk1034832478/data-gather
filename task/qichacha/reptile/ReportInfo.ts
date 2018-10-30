import { Page } from "puppeteer";
import Logger from '../../../lib/logger/Logger';
import * as $ from 'jquery';
import { common } from './Common'; 
export class ReportInfo {
    title = '企查查-年份报告';
    async getInfo( page: Page) {
        Logger.log(this, `正在点击年份报告按钮！`);
        await page.click( '#report_title' );
        // 首先获取所有报告的年份 
        await page.waitForSelector( '.panel.pos-rlt.b-a.report_info #myTab' );
        let as = await page.$$( '.panel.pos-rlt.b-a.report_info #myTab li a' );
        const report = new Map<any, any>();
        for ( let i = 0; i < as.length; i++) {
            let a = as[i];
            const year = await page.evaluate( (a) => { return $( a ).children('span').text() }, a );
            await a.click();
            const rp = await this.getInfoByTCaption( page, i );
            report.set( year, rp ); // 键是年份 值是数据信息
            Logger.log(this, `获取企查查年份报告信息完成，报告年份:${year}`);
        }
        return report;
    }
    // 获得表格的头信息
    async getInfoByTCaption( page: Page ,tabId: number) {
        Logger.log(this, `获取表格头信息`);
        const hs = await page.$$( `.panel.pos-rlt.b-a.report_info .tab-pane:nth-child(${tabId+1}) .tcaption h3` );
        let map = new Map();
        for ( let i = 0; i < hs.length; i++) {
            const h = hs[i];
            const hText: string = await page.evaluate( (h) => { return $(h).text(); }, h);
            Logger.log(this, `表格头信息：${hText}`);
            if ( hText ) {
                const listSelector = `.panel.pos-rlt.b-a.report_info .tab-pane:nth-child(${tabId+1}) .ntable:nth-child(${(i+1)*2+1})`;
                if( hText.indexOf( '企业基本信息' ) !== -1) { map.set( '企业基本信息', ( await this.getBasicInfo(page, listSelector )) ); }
                if( hText.indexOf( '企业资产状况信息' ) !== -1) { map.set('企业资产状况信息', await this.getAssetsInfo(page, listSelector) ); }
                if( hText.indexOf( '社保信息' ) !== -1) { map.set('社保信息', await this.getSocialInsurance(page, listSelector) ); }
                if( hText.indexOf( '股东（发起人）出资信息' ) !== -1) { map.set('股东（发起人）出资信息', await this.getShareholderAssetsInfo(page, listSelector) ); }
                if( hText.indexOf( '网站或网店信息' ) !== -1) { map.set('网站或网店信息', await this.getWebsiteInfo(page, listSelector) ); }
            }
        }
        return map;
    }
    // 获取 企业基本信息
    async getBasicInfo ( page: Page, listSelector: string ) :Promise<string>{
        return await common.getTableNoHeaderInfo('企业基本信息', page, '#report_title', listSelector, ['注册号','企业经营状态','从业人数','有限责任公司本年度是否发生股东股权转让','电子邮箱',
        '企业通讯地址', '统一社会信用代码', '企业联系电话','邮政编码', '企业是否有投资信息或购买其他公司股权'] , `${listSelector}  .tb`) ;
    }
    // 获取 企业资产状况信息
    async getAssetsInfo ( page: Page, listSelector: string ) :Promise<string>{
        return await common.getTableNoHeaderInfo('企业资产状况信息', page, '#report_title', listSelector, ['资产总额','所有者权益合计','营业总收入','利润总额','营业总收入中主营业务收入',
        '净利润', '纳税总额', '负债总额' ], `${listSelector}  .tb`) ;
    }

    // 获取 股东（发起人）出资信息 getTableHasHeaderInfo
    async getShareholderAssetsInfo ( page: Page, listTableSelector: string ) {
        return await common.getTableHasHeaderInfo('股东（发起人）出资信息', page, '#report_title', listTableSelector, `${listTableSelector} tr` , ['序号','发起人','认缴出资额','认缴出资时间','认缴出资方式','实缴出资额','实缴出资时间','实缴出资方式' ]) ;
    }

    // 获取 网站或网店信息
    async getWebsiteInfo ( page: Page, listTableSelector: string ) {
        return await common.getTableHasHeaderInfo('网站或网店信息', page, '#report_title', listTableSelector, `${listTableSelector} tr` , ['序号','类型','名称','网址' ]) ;
    }

    // 获取  社保信息
    async getSocialInsurance ( page: Page, listSelector: string ) :Promise<string>{
        return await common.getTableNoHeaderInfo('社保信息', page, '#report_title', listSelector, ['城镇职工基本养老保险','职工基本医疗保险','生育保险','失业保险','工伤保险',
        '单位参加城镇职工基本养老保险缴费基数', '单位参加失业保险缴费基数', '单位参加职工基本医疗保险缴费基数',
        '单位参加工伤保险缴费基数', '单位参加生育保险缴费基数', '参加城镇职工基本养老保险本期实际缴费金额',
        '参加失业保险本期实际缴费金额', '参加职工基本医疗保险本期实际缴费金额', '参加工伤保险本期实际缴费金额',
        '参加生育保险本期实际缴费金额', '单位参加城镇职工基本养老保险累计欠缴金额', '单位参加失业保险累计欠缴金额',
        '单位参加职工基本医疗保险累计欠缴金额', '单位参加工伤保险累计欠缴金额', '单位参加生育保险累计欠缴金额',], `${listSelector} td`) ;
    }
}
export const reportInfo = new ReportInfo();