import { COLUMN_DEMILITER, EQUAL_DEMILITER  } from '../../../lib/str/Delimiter';
export class Parser {
    /**
     * 将数组字符串转化为数组对象
     * @param list 
     */
    parseStringArray( list: string[]) {
        const result: any[] = [];
        for ( let i = 0; i < list.length; i++ ) {
            let obj: any = {};
            const str = list[ i ];
            const strs = str.split( COLUMN_DEMILITER );
            for ( let j = 0; j < strs.length; j++   ) {
                const kv = strs[j].split( EQUAL_DEMILITER );
                if ( kv.length < 2 ) {
                    continue;
                }
                obj[kv[0].replace('：','').replace(':','')] = kv[1];
            }
            result.push( obj );
        }
        return result;
    }

    /**
     * 解析字符串转化为字符串数组
     */
    parseStringOfValueToArray( obj: string ) {
        const list: string[]  = [];
        const list2 = obj.split( COLUMN_DEMILITER );
        for ( let i = 0; i < list2.length; i++) {
            const kv = list2[i].split( EQUAL_DEMILITER );
            if ( kv.length < 2 ) {
                continue;
            }
            list.push( kv[1] );
        }
        return list;
    }
}
export const  parser: Parser = new Parser();
