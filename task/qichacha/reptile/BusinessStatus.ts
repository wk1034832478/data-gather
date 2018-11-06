
import { Page } from 'puppeteer';
import { common } from './Common';
export class BusinessStatus {
    // 获取行政许可（工商局） 
    async getXingZhengXuKeOfGongShang(page: Page) {
        return await common.getTableHasHeaderInfo( '行政许可 【工商局】', page, '#run_title' , '#permissionlist', '#permissionlist tr',
        ['序号', '许可文件编号', '许可文件名称', '有效期自', '有效期至', '许可机关', '许可内容']);
    }

    // 获取行政许可（信用中国） 
    async getXingZhengXuKeOfXinYongZhongGuo(page: Page) {
        return await common.getTableHasHeaderInfo( '行政许可（信用中国）', page, '#run_title' , '#permissionlist+section', '#permissionlist+section tr',
        ['序号', '项目名称', '地域', '决定日期', '内容']);
    }

    // 获取税务信用
    async getSuiWuXinYong(page: Page) {
        return await common.getTableHasHeaderInfo( ' 税务信用 ', page, '#run_title' , '#taxCreditList', '#taxCreditList tr',
        ['序号', '评价年度', '纳税人识别号', '纳税信用等级', '评价单位']);
    }

    // 获取产品信息
    async getProductList(page: Page) {
        return await common.getTableHasHeaderInfo( '产品信息 ', page, '#run_title' , '#productlist', '#productlist tr',
        ['序号', '产品图片', '产品名', '融资信息', '成立时间', '所属地', '产品介绍']);
    }

    // 获取融资信息
    async getRongZiXinXi(page: Page) {
        return await common.getTableHasHeaderInfo( '融资信息 ', page, '#run_title' , '#financingList', '#financingList tr',
        ['序号', '日期', '产品名称', '级别', '金额', '投资方']);
    }

    // 获取招投标信息
    async getZhaoTouBiaoXinXi(page: Page) {
        return await common.getTableHasHeaderInfo( '招投标信息 ', page, '#run_title' , '#tenderlist', '#tenderlist tr',
        ['序号', '描述', '发布时间', '所属地区', '项目分类']);
    }

    // 获取招聘信息
    async getZhaoPinXinxi(page: Page) {
        return await common.getTableHasHeaderInfo( '招聘信息 ', page, '#run_title' , '#joblist', '#joblist tr',
        ['序号', '发布时间', '招聘职位', '月薪', '学历', '经验', '所在城市']);
    }

    //获取财务总览 
    async getCaiWuZongLan(page: Page) {
        return await common.getTableNoHeaderInfo( '财务总览', page, '#run_title' , '#V3_cwzl',
        ['公司实力等级', '纳税区间', '销售净利润率', '销售毛利率'], '#V3_cwzl td.tb');
    }

    //获取进出口信用
    async getJinChuKouXinYong(page: Page) {
        return await common.getListOfModal(page,'进出口信用', '#run_title','#ciaxList', '内容','#jcModal' ,['序号','注册海关','经营类别','注册日期','内容'],'#jcModal .modal-content table td.tb') ;
    }

    // 获取微信公众号
    async getWeChatPublic(page: Page) {
        return await common.getTableHasHeaderInfo( '微信公众号 ', page, '#run_title' , '#wechatlist', '#wechatlist tr',
        ['序号','头像','公众号名字','微信号','二维码','简介']);
    }

    // 获取公告研报
    async getYBList(page: Page) {
        return await common.getTableHasHeaderInfo( '公告研报 ', page, '#run_title' , '#yblist', '#yblist tr',
        ['序号','研报内容','发布时间']);
    }

    // 获取地块公示 
    async getLandpublist ( page: Page ) {
        return await common.getListOfModal(page,'地块公示', '#run_title','#landpublist', '地块位置','#landpubModal' ,[],'#landpubModal .modal-content table td.tb') ;
    }

    // 获取购地信息 
    async getLandpurchaselist ( page: Page ) {
        return await common.getListOfModal(page,'购地信息', '#run_title','#landpurchaselist', '土地坐落','#landpurchaseModal' ,[],'#landpurchaseModal .modal-content table td.tb') ;
    }

    // 获取抽查检查
    async getSpotCheckList(page: Page) {
        return await common.getTableHasHeaderInfo( '抽查检查 ', page, '#run_title' , '#spotCheckList', '#spotCheckList tr',
        ['序号','检查实施机关','类型','日期','结果']);
    }

    // 获取电信许可
    async getTelecomlist(page: Page) {
        return await common.getTableHasHeaderInfo( '电信许可 ', page, '#run_title' , '#telecomlist', '#telecomlist tr',
        ['序号','许可证号','业务范围','是否有效']);
    }
}
export const businessStatus = new BusinessStatus();