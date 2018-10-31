import * as wrapper  from 'node-mysql-wrapper';
import Logger from '../logger/Logger';
// mysql数据库数据持久化
export class MysqlPersist {
    title = '数据库持久层';
    async saveObj( mysqldb: wrapper.Database, table: string ,obj: any ) : Promise<any>{
        try {
            // 保存对象
            const tableObj =  mysqldb.table( table );
            if ( tableObj ) {
                const result = await tableObj.save( obj );
                Logger.log(this, `存储结果id：${ result.id }`);
                return result;
            } else {
                Logger.log( this, `数据库不存在该表【${table}】`);
                throw `数据库不存在该表【${table}】`;
            }
        } catch( e ) {
            Logger.log( this, `保存信息失败：${e}`);
            throw `保存信息失败：${e}`;
        }
    }
    async selectEqualObj( mysqldb: wrapper.Database, table: string, equalObj: any) : Promise<any>{
        const tableObj = mysqldb.table( table );
        return await tableObj.findSingle(  equalObj ) ;
    }
}
export const mysqlPersist = new MysqlPersist();