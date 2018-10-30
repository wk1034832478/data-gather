import * as wrapper from 'node-mysql-wrapper';
export class MysqlDB {
    dbConnection: wrapper.Database;
    async init() {
        this.dbConnection = wrapper.wrap("mysql://root:hyywk520@127.0.0.1/datagather?debug=false&charset=utf8"); // 数据库连接对象
    }
    getConnection(): wrapper.Database{
        return this.dbConnection;
    }
}
export const mysqlDB = new MysqlDB();

