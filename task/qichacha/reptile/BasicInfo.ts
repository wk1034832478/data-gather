
import { Page } from 'puppeteer';
import { common } from './Common';
export class BasicInfo {
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
