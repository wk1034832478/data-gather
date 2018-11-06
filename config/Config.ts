import { browserStartup, PageCube } from '../plugins/browser/BrowserStartup';
import { browserConfig, defaultConfig } from '../plugins/browser/BrowserConfig';
import Logger from '../lib/logger/Logger';
import { login } from '../plugins/login/Login';
import Sleep from '../lib/sleep/sleep';
export class Config {
    title = '主配置程序';
    async config( param: any  ) {
        await this.configBrowser( param );
        await this.configLogin( param );
    }
    /**
     * 对浏览器进行配置
     * @param param 命令行参数
     */
    async configBrowser ( param: any ) {
        browserConfig.path = param.path ? param.path : defaultConfig.path;
        browserConfig.headless = param.headless ? (param.headless === 'true' ? true : false ) : defaultConfig.headless;
        browserConfig.tabNums = +( param.tabNums ? param.tabNums : defaultConfig.tabNums );
        await browserStartup.init( browserConfig ); // 打开浏览器
    }
    /**
     * 如果需要进行登陆，则执行登陆操作
     * @param param 命令行参数
     */
    async configLogin ( param: any ) {
        if ( param.username ) {
            Logger.log( this, `正在执行登陆`);
            const pageCube: PageCube =  await browserStartup.getFreeTab();
            while ( true )  {
                try {
                    await login.login( pageCube.page,
                        { username: '' + param.username,  password: '' + param.password, entranceUrl:  param.entranceUrl, loginSuccessSelector: param.loginSuccessSelector,
                        usernameSelector: param.usernameSelector, passwordSelector: param.passwordSelector, loginButtonSelector: param.loginButtonSelector} );
                    break;
                } catch ( e ) {
                    Logger.log(this,`登陆错误：${e}，准备开始重新尝试！`);
                    Sleep.sleep( 3000 );
                }
            }
        }
    }
    getTaskId( param: any ) {
        return param.taskId;
    }
}
export const config = new Config();
