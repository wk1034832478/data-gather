import { LoginConfig } from './LoginConfig';
import { Page } from 'puppeteer';
import Logger from '../../lib/logger/Logger';
export class Login {
    title = '登陆插件';
    async login( page: Page, config: LoginConfig ) {
        await page.bringToFront();
        Logger.log( this, `开始登陆` );
        Logger.log( this, `进入登陆界面` );
        await page.goto( config.entranceUrl );

         // 检查是否已经有登陆标志
        try {
            const element = await page.$( config.loginSuccessSelector );
            if ( element ) {
                Logger.log( this, `用户已经登陆！`);
                return ;
            } else {
                Logger.log( this, `还未登陆！需要登陆`);
            } 
        } catch ( e ) {
            Logger.log( this, `还未登陆！,据需登陆`);
        } 

        Logger.log( this, `输入用户名${config.username}` );
        await page.type( config.usernameSelector, config.username, { delay: 100 });
        Logger.log( this, `输入密码${config.password}` );
        await page.type( config.passwordSelector, config.password, { delay: 100 });
        Logger.log( this, `点击确定按钮进行登陆` );
        await page.click( config.loginButtonSelector );
        await page.waitForSelector( config.loginSuccessSelector, { timeout: 30000} ); // 等待时间30s，会报错
        Logger.log(this, '登陆完成！');
    }
}
export const login = new Login();