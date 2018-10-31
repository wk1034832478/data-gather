import * as wrapper from 'node-mysql-wrapper';
import Logger from '../../lib/logger/Logger';
import Sleep from '../../lib/sleep/Sleep';
export class MysqlDB {
    title = 'mysql数据库连接对象';
    dbConnection: wrapper.Database;
    async init() {
        this.dbConnection = wrapper.wrap("mysql://root:hyywk520@127.0.0.1/datagather?debug=false&charset=utf8"); // 数据库连接对象
        this.dbConnection.ready( () => {
            Logger.log(this, '连接成功！');
        });
        while( true ) {
            if( this.dbConnection.isReady ) {
                break;
            } else {
                Logger.log(this, '正在连接mysql数据库');
                await Sleep.sleep( 1000);
            }
        }
    }
    getConnection(): wrapper.Database{
        return this.dbConnection;
    }
}
export const mysqlDB = new MysqlDB();

