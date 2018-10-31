#!/usr/bin/env node
import * as argv from 'yargs';
import Logger from './lib/logger/Logger';
import { config } from './config/Config';
import { Tasks } from './task/Tasks';
import { taskManager } from './task/TaskManager';
import { redisDB } from './plugins/db/Redis';
import { mysqlDB } from './plugins/db/MysqlDB';
import { mysqlPersist } from './lib/persist/MysqlPersist';
const params = argv.argv;
class Main {
    title = '程序入口';
    async init() {
        await this.initDB();
    }
    async initDB() {
        await mysqlDB.init();
    }
    async start () {
        await this.init();
        await redisDB.flushAll();
        await redisDB.set( '小米科技有限责任公司', '');
        Logger.log(this, '程序开始启动' );
        await config.config( params );
        const taskId: Tasks = config.getTaskId( params );
        Logger.log(this, `执行任务id: ${ taskId }`)
        await taskManager.executeTask( taskId );
    }
    async test() {
        await mysqlDB.init();
        Logger.log(this, (await mysqlPersist.selectEqualObj(  mysqlDB.getConnection(), 'company',  { '公司名': '小米科技有限责任公司' }))['id']  );
        //await mysqlPersist.saveObj( mysqlDB.getConnection(), 'company', { '公司名': '爱安静死哦撒娇哦','公司简介': '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈'} );
    }
}
const main = new Main();
main.start();