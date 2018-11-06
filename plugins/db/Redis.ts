import { Tedis, TedisPool }from 'tedis';
import Logger  from '../../lib/logger/Logger';
import { Encoding } from '../../lib/encode/Encoding';
export class RedisDB {
    title = 'redis 数据库连接';
    // auth
    tedisPool: TedisPool;
    async init() {
        Logger.log( redisDB, `正在连接redis数据库` );
        // 该构造方法使用回调函数，无法使用try-catch捕获，所以一定要保证redis启动，并且账户或密码正确
        this.tedisPool = new TedisPool({
            port: 6379,
            host: "localhost",
            // password: "root" // 无密码
        });
        //进行获取堵塞
        const tedis = await this.getTedis();
        this.putTedius( tedis );
        Logger.log( redisDB, `连接redis数据库成功！` );
    }
    async set( key: string, value: string) {
        const tedis = await this.getTedis();
        await tedis.set( Encoding.encodeBase64(key),Encoding.encodeBase64(value) );
        this.putTedius( tedis );
    }
    async get( key: string ) {
        const tedis = await this.getTedis();
        const value = await tedis.get( Encoding.encodeBase64(key) );
        this.putTedius( tedis );
        return value;
    }
    async keys( pattern: string) {
        const tedis = await this.getTedis();
        const values = await tedis.keys( pattern );
        this.putTedius( tedis );
        for ( let i = 0; i < values.length; i++) {
            values[i] = Encoding.decodeBase64(  values[i] );
        }
        return values;
    }
    async flushAll( ) { // 清除键
        const tedis = await this.getTedis();
        await tedis.command( 'flushall' ); 
        this.putTedius( tedis );
    }
    /**
     * 获取一个redis连接对象
     */
    async getTedis(): Promise<Tedis>{
        return await this.tedisPool.getTedis();
    }
    putTedius( tedis: Tedis) {
        this.tedisPool.putTedis( tedis );
    }
}
export const redisDB = new RedisDB();



