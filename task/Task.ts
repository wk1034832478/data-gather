/**
 * 执行的任务
 */
export abstract class Task {
    SIGNAL_RUNNING = 1; // 运行时标志
    SIGNAL_END = 2; // 结束时标志
    id: string; // 任务的id
    signal: number; // 任务执行标志 
    constructor() {
        this.signal = this.SIGNAL_RUNNING;
    }
    /**
     * 进行任务的初始化工作
     */
    async abstract init(): Promise<any>;
    /**
     * 进行任务的开始工作
     */
    async abstract start(): Promise<any>;
    /**
     * 进行任务的结束工作
     */
    async abstract stop(): Promise<any>;
}