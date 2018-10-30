#!/usr/bin/env node
import * as argv from 'yargs';
import Logger from './lib/logger/Logger';
import { config } from './config/Config';
import { Tasks } from './task/Tasks';
import { taskManager } from './task/TaskManager';
import { redisDB } from './plugins/db/Redis';
const params = argv.argv;
class Main {
    title = '程序入口';
    async start () {
        await redisDB.flushAll();
        await redisDB.set( '烟台中科网络技术研究所', '');
        Logger.log(this, '程序开始启动' );
        await config.config( params );
        const taskId: Tasks = config.getTaskId( params );
        Logger.log(this, `执行任务id: ${ taskId }`)
        taskManager.executeTask( taskId );
    }
}
const main = new Main();
main.start();