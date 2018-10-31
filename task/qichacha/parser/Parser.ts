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
                obj[kv[0]] = kv[1];
            }
            result.push( obj );
        }
        return result;
    }
}
export const  parser: Parser = new Parser();
