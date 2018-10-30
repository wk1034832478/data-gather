/**
 * 线程睡眠类,Promise
 */
export default class Sleep {
    static async sleep( time: number ) : Promise<any> {
        return new Promise( resolve => { setTimeout( () => {resolve('')},time);  });
    } 
}
