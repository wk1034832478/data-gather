import { redisDB } from '../plugins/db/Redis';
import { mysqlDB } from '../plugins/db/MysqlDB';
import { QichachaTask } from './qichacha/QichachaTask';
import  { browserStartup } from '../plugins/browser/BrowserStartup';
import Logger from '../lib/logger/Logger';
import { Tasks } from '../task/Tasks';
import { Task } from '../task/Task';
import { UUID } from '../lib/uuid/UUID';
export class TaskManager {
    tasks: Map<string, Task> = new Map();
    title = '任务管理器';
    async getQichachaTask() {
        return new QichachaTask( browserStartup.getBrowser(), mysqlDB.getConnection() , redisDB );
    }
    async GetTask( taskId: Tasks ) {
        switch ( taskId ) {
            case Tasks.QICHACHA_TASK_ID:
                Logger.log(this, `开始执行任务id: ${ taskId }`)
                return await this.getQichachaTask();
        }
    }
    async executeTask( taskId: Tasks ) {
        const task = await this.GetTask( taskId );
        await task.init();
        await task.start();
        task.id = UUID.newID();
        this.tasks.set( task.id, task );
    }
    async getTaskByID( taskId: string ): Promise<Task>{
        return  this.tasks.get( taskId );
    }
}
export const taskManager = new  TaskManager();
