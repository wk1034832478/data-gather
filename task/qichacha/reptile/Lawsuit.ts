
import { Page } from 'puppeteer';
import { common } from './Common'; 

export class Lawsuit {
    title = '法律诉讼';
    /**
     * 获取被执行人信息列表
     */
    async getLawsuit(page: Page) {
        return await common.getTableHasHeaderInfo( '被执行人信息', page, '#susong_title' , '#zhixinglist', '#zhixinglist tr',['序号', '案号', '立案时间', '执行法院', '执行标的']);
    }

    // 获取 裁判文书
    async getWenshuList(page: Page) {
        return await common.getTableHasHeaderInfo( '裁判文书', page, '#susong_title' , '#wenshulist', '#wenshulist tr',['序号', '案件名称', '案由', '发布时间', '案件编号', '案件身份', '执行法院']);
    }

    // 获取法院公告
    async getFaYuanGongGao(page: Page) {
        return await common.getListOfModal( page, '法院公告', '#susong_title', '#gonggaolist', '内容', '#gonggaoModal',[], '#gonggaolist tr');
    }

    // 获取开庭公告 
    async getNoticelist(page: Page) {
        return await common.getListOfModal( page, '开庭公告', '#susong_title', '#noticelist', '案号', '#RelatModal',[], '#noticelist tr');
    }
}
export const lawsuit = new Lawsuit(); 
