import { mysqlPersist } from '../../../lib/persist/MysqlPersist';
import { mysqlDB } from '../../../plugins/db/MysqlDB';
import Logger from '../../../lib/logger/Logger';
import { Company } from '../entity/Company';
import { ShareHolder } from '../entity/ShareHolder';
export class MysqlStorage {
    title = '企查查数据库存储对象';
    // 存储成功则返回公司的id，否则返回-1
    async storeCompany( companyObj: Company ): Promise<Company> {
        try {
            const mysql  = mysqlDB.getConnection();
            // 检查是否含有公司数据
            const queryResult: Company = await mysqlPersist.selectEqualObj( mysql ,  'company', { '公司名': companyObj.公司名 }  );
            if ( queryResult ) { // 存在数据
                Logger.log( this, `该公司数据存在，进行更新,公司id： ${queryResult.id}`);
                companyObj.id = queryResult.id; // 设置id来更新数据
                await mysqlPersist.saveObj( mysql ,  'company'  ,companyObj); // 更新
            } else {
                let company: Company = await mysqlPersist.saveObj( mysql ,  'company'  ,companyObj); // 保存
                companyObj.id = company.id;
            }
            
            return companyObj;
        } catch ( e ) {
            Logger.log( this, `${e}`);
            return {}; // 返回空对象
        } 
    }
    // 存储成功则返回公司的id，否则返回-1
    async storeShareHolder( shareholder: ShareHolder ): Promise<ShareHolder> {
        try {
            const mysql  = mysqlDB.getConnection();
            // 检查是否含有公司的股东信息
            const queryResult: {id?: string} = await mysqlPersist.selectEqualObj( mysql ,  'share_holder', { '股东': shareholder.股东, 'company_id': shareholder.company_id }  );
            if ( queryResult && queryResult.id !== '0' ) { //存在
                shareholder.id = queryResult.id;
            }
            const result = await mysqlPersist.saveObj( mysql ,  'share_holder'  ,shareholder);
            return result;
        } catch ( e ) {
            Logger.log( this, `${e}`);
            return {}; // 返回空对象
        } 
    }
    /**
     * 通用检查更新存储方法
     * @param obj 存储更新的对象
     * @param table 表名
     * @param checkHashObj 检查是否存在记录的对象 
     */
    async storeObject( obj: any, table: string,checkHashObj: any) {
        try {
            const mysql  = mysqlDB.getConnection();
            const queryResult: {id?: string} = await mysqlPersist.selectEqualObj( mysql ,  table, checkHashObj  );
            if ( queryResult && queryResult.id !== '0' ) { //存在
                obj.id = queryResult.id;
            }
            const result = await mysqlPersist.saveObj( mysql , table , obj);
            return result;
        } catch ( e ) {
            Logger.log( this, `${e}`);
            return {}; // 返回空对象
        }
    }
    /**
     * 通用检查存储返回方法，如果存在信息，则直接返回
     * @param obj 存储更新的对象
     * @param table 表名
     * @param checkHashObj 检查是否存在记录的对象 
     */
    async storeObjectOrReturn( obj: any, table: string,checkHashObj: any) {
        try {
            const mysql  = mysqlDB.getConnection();
            const queryResult: {id?: string} = await mysqlPersist.selectEqualObj( mysql ,  table, checkHashObj  );
            if ( queryResult && queryResult.id !== '0' ) { //存在
                return null;
            }
            const result = await mysqlPersist.saveObj( mysql , table , obj);
            return result;
        } catch ( e ) {
            Logger.log( this, `${e}`);
        }
    } 
}
export const mysqlStorage = new MysqlStorage();