/**
 * 浏览器配置项
 */
export interface BrowserConfig {
    path?: string,  // 浏览器路径
    headless?: boolean // 浏览器是否显示
    tabNums?: number;
}
export const browserConfig:BrowserConfig  = {};
// 默认配置参数
export const defaultConfig:BrowserConfig = {
    path: 'F://chromium//chrome.exe',
    headless: false,
    tabNums: 5, // 默认是5个标签页
};