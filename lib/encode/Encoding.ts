import { Buffer} from 'buffer';
export class Encoding {
    /**
     * 对内容进行编码
     * @param value 
     */
    static encodeBase64( value: string){
        return new Buffer( value ).toString('base64');
    }
    /**
     * 对内容进行解码
     * @param value 
     */
    static decodeBase64( value: string){
        return new Buffer( value, 'base64').toString();
    }
}