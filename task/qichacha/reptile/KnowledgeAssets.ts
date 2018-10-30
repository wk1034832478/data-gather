import { Page } from "puppeteer";
import { common } from './Common'; 
export class KnowledgeAssets {
    title = '企查查-知识产权';
    
    // 获取 商标信息
    async getShangBiao( page: Page, ) {
        return await common.getTableHasHeaderInfo('商标信息', page, '#assets_title','#shangbiaolist', '#shangbiaolist tr' , ['序号','商标','商标名','状态',	'申请时间',	'注册号','国际分类','内容']) ;
    }
    //获取 专利信息
    async getZhuanli( page: Page, ) {
        return await common.getListOfModal(page,'专利信息', '#assets_title','#zhuanlilist', '名称','#zlModal' ,[],'#zlModal .modal-content table td.tb') ;
    }

    // 获取 证书信息 zhengshulist
    async getZhengshuList( page: Page ) {
        return await common.getListOfModal(page, '证书信息','#assets_title', '#zhengshulist', '证书名称', '#zsModal',
        [], '#zsModal .modal-content table td.tb');
    }

    // 获取 作品著作权
    async getZZQList( page: Page ) {
        return await common.getTableHasHeaderInfo('作品著作权', page, '#assets_title', '#zzqlist', '#zzqlist tr' ,
        ['序号','作品名称','首次发表日期','创作完成日期','登记号','登记日期','登记类别']) ;
    }

    // 获取 软件著作权 
    async getRjzzqlist( page: Page ) {
        return await common.getTableHasHeaderInfo('软件著作权', page, '#assets_title', '#rjzzqlist', '#rjzzqlist tr' ,
        ['序号','软件名称',	'版本号','发布日期','软件简称','登记号','登记批准日期']) ;
    }

    // 获取 网站信息 
    async getWebsiteList( page: Page ) {
        return await common.getTableHasHeaderInfo('网站信息', page, '#assets_title', '#websitelist', '#websitelist tr' ,
        ['序号','网址','网站名称','域名','网站备案/许可证号','审核时间']) ;
    }
}
export const knowledgeAssets = new KnowledgeAssets();