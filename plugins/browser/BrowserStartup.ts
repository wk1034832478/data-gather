import * as puppeteer from 'puppeteer';
import { BrowserConfig } from  './BrowserConfig';
import Logger from '../../lib/logger/Logger';
import Sleep from '../../lib/sleep/Sleep';
/**
 * 浏览器页面盒，管理浏览器状态
 */
export interface PageCube {
    index:number, // 页面索引
    page: puppeteer.Page,
    lock: boolean // 如果锁住则不可再继续使用
}
export class BrowserStartup {
    title = '浏览器启动程序';
    browser: puppeteer.Browser;
    pageCubes: PageCube[] = [];
    async init ( config: BrowserConfig ) {
        Logger.log( this, `正在初始化浏览器`);
        await this.openBrowser( config );
        await this.openTabs( config.tabNums );
        for (let i = 0; i < this.pageCubes.length; i++ ) {
            // await this.processPage( this.pageCubes[i].page );
        }
    }
    async openBrowser ( config: BrowserConfig  ) {
        Logger.log( this, `正在打开浏览器`);
        this.browser = await puppeteer.launch( { //打开浏览器
			executablePath: config.path , // chrome位置
			headless: config.headless,
        });
    }
    getBrowser( ) {
        return this.browser;
    }
    /**
     * 根据配置文件中的内容来重新打开程序
     */
    async openTabs( num: number ) {
        Logger.log( this, `浏览器正在打开标签页`);
        this.pageCubes.push( { index: 0, page: (await this.browser.pages())[0], lock: false } ); // 添加默认标签页
        for ( let i = 1; i < num; i++ ) {
            const page = await this.browser.newPage(); 
            this.pageCubes.push( { index: i, page: page, lock: false } );
        }
    }
    async processPage( page: puppeteer.Page) {
        await page.setRequestInterception( true );
        page.on('request', interceptedRequest => { // 拦截图片请求
            // if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg'))
            //   interceptedRequest.abort();
            // else
            interceptedRequest.continue();
        });
        page.on( 'requestfailed', req => {
           Logger.log(this, `页面加载失败！${ req.url() }`);
            req.abort();
        });
    }
    /**
     * 获取空间的标签页
     */
    async getFreeTab(): Promise<PageCube> {
        let i = 1;
        while ( true )  {
            Logger.log(this, `正在第${i}次尝试获取空闲标签页`);
            for ( let j = 0; j < this.pageCubes.length; j++ ) {
                if ( !this.pageCubes[j].lock ) {
                    this.pageCubes[j].lock = true;
                    Logger.log(this, `第${i}次尝试获取空闲标签页成功！`);
                    return this.pageCubes[j];
                }
                Logger.log(this, `第${i}个标签页不可用`);
            }
            Sleep.sleep( 1000 );
            i++;
        }
    }
}
export const browserStartup = new BrowserStartup();