/**
 * 日志打印对象
 */
interface Target {
    title: string;
}
export default class Logger {
    /**
     * 日志打印
     * @param target 日志打印对象 
     * @param msg 日志打印出的信息
     */
    static log( target: Target, msg: string) {
        console.log(`${new Date()} 【${target.title}】:${msg}`);
    }
    /**
     * 日志打印
     * @param target 日志打印对象 
     * @param msg 日志打印出的信息
     */
    static error( target: Target, msg: string ) {
        console.error(`${new Date()} 【${target.title}】 :${msg}`);
    }
}