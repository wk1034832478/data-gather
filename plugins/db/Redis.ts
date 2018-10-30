import { Tedis, TedisPool }from 'tedis';
import Logger  from '../../lib/logger/Logger';
import { Encoding } from '../../lib/encode/Encoding';
export class RedisDB {
    title = 'redis 数据库连接';
    // auth
    tedisPool: TedisPool;
    constructor() {
        try {
            this.connect();
        } catch ( e ) {
            Logger.log( redisDB, `redis数据库连接异常,${e}` );
        }
    }
    connect() {
        this.tedisPool = new TedisPool({
            port: 6379,
            host: "localhost",
            // password: "root" // 无密码
        });
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



