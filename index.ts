#!/usr/bin/env node
import * as argv from 'yargs';
import Logger from './lib/logger/Logger';
import { config } from './config/Config';
import { Tasks } from './task/Tasks';
import { taskManager } from './task/TaskManager';
import { redisDB } from './plugins/db/Redis';
import { mysqlDB } from './plugins/db/MysqlDB';
const params = argv.argv;
class Main {
    title = '程序入口';
    /**
     * 进行程序的初始化
     */
    async init() {
        await this.initDB();
    }
    /**
     * 进行程序相关的数据库初始化
     */
    async initDB() {
        await mysqlDB.init();
        await redisDB.init();
    }
    /**
     * 程序开始
     */
    async start () {
        // 这三行是爬虫测试代码
        await this.init();
        await redisDB.flushAll();
        await redisDB.set( '小米科技有限责任公司', '');

        Logger.log(this, '程序开始启动' );
        await config.config( params );
        const taskId: Tasks = config.getTaskId( params );
        Logger.log(this, `执行任务id: ${ taskId }`)
        await taskManager.executeTask( taskId );
    }
}
const main = new Main();
main.start();