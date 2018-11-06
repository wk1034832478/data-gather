
import { Page } from 'puppeteer';
import { common } from './Common'; 
export class BusinessRisks {
    title = '企查查-经营风险';
    // 获取股权出质 
    async getPledgeList ( page: Page ) {
        return await common.getListOfModal(page, '股权出质','#fengxian_title', '#pledgeList', '登记编号', '#pledgeModal',
        ['登记编号','出质人','质权人','出质股权数','状态','出质人证件号码','质权人证件号','股权出质登记日期'], '#pledgeModal .modal-content table td.tb');
    }

    // 获取 工商局行政处罚
    async getPenaltylist(page: Page) {
        return await common.getTableHasHeaderInfo( '工商局行政处罚 ', page, '#fengxian_title' , '#penaltylist', '#penaltylist tr',
        ['序号','决定文书号','违法行为类型','行政处罚内容','公示日期','决定机关','决定日期']);
    }

    // 获取信用中国行政处罚  getListOfModal
    async getXinYongZhongGuoPenaltyList( page: Page ) {
        return await common.getListOfModal(page, '信用中国处罚行政','#fengxian_title', '#penaltylist+section', '决定文书号', '#cfModal',
        ['处罚名称','决定文书号','处罚事由','处罚状态','决定日期','处罚类别1','处罚类别2','处罚依据','处罚结果','处罚机关'], '#cfModal .modal-content table td.tb');
    }
}
export const businessRisks = new BusinessRisks();