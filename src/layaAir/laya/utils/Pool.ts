/**
 * @en The `Pool` class is an object pooling class used for storing and reusing objects.
 * Reasonable use of the object pool can effectively reduce the overhead of object creation, avoid frequent garbage collection, and thus optimize the smoothness of the game.
 * @zh `Pool` 是对象池类，用于对象的存储和复用。
 * 合理使用对象池可以有效减少对象创建的开销，避免频繁的垃圾回收，从而优化游戏流畅度。
 */

export class Pool {
    /**@private */
    private static _CLSID: number = 0;
    /**@private */
    private static POOLSIGN: string = "__InPool";
    /**@private  对象存放池。*/
    private static _poolDic: any = {};

    /**
     * @en Get the object pool based on the object type signature.
     * @param sign The object type signature.
     * @returns The object pool.
     * @zh 根据对象类型标识字符获取对象池。
     * @param sign 对象类型标识字符。
     * @returns 对象池。
     */
    static getPoolBySign(sign: string): any[] {
        return Pool._poolDic[sign] || (Pool._poolDic[sign] = []);
    }

    /**
     * @en Clear the objects in the object pool.
     * @param sign The object type signature.
     * @zh 清除对象池中的对象。
     * @param sign 对象类型标识字符。
     */
    static clearBySign(sign: string): void {
        if (Pool._poolDic[sign]) Pool._poolDic[sign].length = 0;
    }

    /**
     * @en Put the object into the object pool of the corresponding type signature.
     * @param sign The object type signature.
     * @param item The object.
     * @zh 将对象放到对应类型标识的对象池中。
     * @param sign 对象类型标识字符。
     * @param item 对象。
     */
    static recover(sign: string, item: any): void {
        if (item[Pool.POOLSIGN] !== false) //有这个标志，才表明对象是从Pool里获取的，允许recover
            return;
        item[Pool.POOLSIGN] = true;
        Pool.getPoolBySign(sign).push(item);
    }

    /**
     * @en Recover by class name if the class has one, if not, do not recover.
     * @param instance The instance of the class.
     * @zh 根据类名进行回收，如果类有类名才进行回收，没有则不回收。
     * @param instance 类的具体实例。
     */
    static recoverByClass(instance: any): void {
        if (instance) {
            var className: string = instance["__className"] || instance.constructor._$gid;
            if (className) Pool.recover(className, instance);
        }
    }

    /**
     * 返回类的唯一标识
     */
    private static _getClassSign(cla: any): string {
        var className = cla["__className"] || cla["_$gid"];
        if (!className) {
            cla["_$gid"] = className = Pool._CLSID + "";
            Pool._CLSID++;
        }
        return className;
    }

    /**
     * @en Create an object by class.
     * @param cls The class for creating the object.
     * @zh 根据类创建对象。
     * @param cls 用于创建对象的类。
     */
    static createByClass<T>(cls: new () => T): T {
        return Pool.getItemByClass(Pool._getClassSign(cls), cls);
    }

    /**
     * @en Get an object instance of a certain type from the object pool.
     * If there is no object of this type in the pool, a new object will be created and returned.
     * @param sign The object type signature.
     * @param cls The class used to create the object of this type.
     * @returns An object of the specified type.
     * @zh 根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。
     * 如果对象池中无此类型标识的对象时，则根据传入的类型，创建一个新的对象返回。
     * @param sign 对象类型标识字符。
     * @param cls 用于创建该类型对象的类。
     * @returns 此类型标识的一个对象。
     */
    static getItemByClass<T>(sign: string, cls: new () => T): T {
        let rst: any;
        let pool = Pool.getPoolBySign(sign);
        if (pool.length)
            rst = pool.pop();
        else
            rst = new cls();
        rst[Pool.POOLSIGN] = false;
        return rst;
    }

    /**
     * @en Get an object instance of a certain type from the object pool using a creation function.
     * If there is no object of this type in the pool, a new object will be created using the function and returned.
     * @param sign The object type signature.
     * @param createFun The function used to create the object of this type.
     * @param caller The `this` context for the creation function.
     * @returns An object of the specified type.
     * @zh 根据传入的对象类型标识字符和创建函数，获取对象池中此类型标识的一个对象实例。
     * 如果对象池中无此类型标识的对象时，则使用传入的创建此类型对象的函数，新建一个对象返回。
     * @param sign 对象类型标识字符。
     * @param createFun 用于创建该类型对象的方法。
     * @param caller this对象。
     * @returns 此类型标识的一个对象。
     */
    static getItemByCreateFun(sign: string, createFun: Function, caller: any = null): any {
        var pool: any[] = Pool.getPoolBySign(sign);
        var rst: any = pool.length ? pool.pop() : createFun.call(caller);
        rst[Pool.POOLSIGN] = false;
        return rst;
    }

    /**
     * @en Get an object from the object pool by the object type signature. If there is no object of this type in the pool, return null.
     * @param sign The object type signature.
     * @returns An object of the specified type or null if none is available.
     * @zh 根据传入的对象类型标识字符，获取对象池中已存储的此类型的一个对象，如果对象池中无此类型的对象，则返回 null。
     * @param sign 对象类型标识字符。
     * @returns 对象池中此类型的一个对象，如果对象池中无此类型的对象，则返回 null。
     */
    static getItem(sign: string): any {
        var pool: any[] = Pool.getPoolBySign(sign);
        var rst: any = pool.length ? pool.pop() : null;
        if (rst) {
            rst[Pool.POOLSIGN] = false;
        }
        return rst;
    }

}


