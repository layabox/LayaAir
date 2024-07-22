const ITEM_LAYOUT = 4; //callback,target,args,flag(0-deleted,1-normal,2-once) 
/**
 * @en Delegate class for managing and invoking callbacks
 * This class provides functionality to add, remove, and invoke callback functions.
 * It supports one-time callbacks and can manage callbacks with different targets and arguments.
 * @zh Delegate类，用于管理和调用回调函数
 * 这个类提供了添加、移除和调用回调函数的功能。
 * 它支持一次性回调，并且可以管理具有不同目标对象和参数的回调函数。
 */
export class Delegate {
    private _flag: number;
    private _items: Array<any>;

    public constructor() {
        this._flag = 0;
        this._items = [];
    }

    /**
     * @en Add a callback function
     * @param callback The callback function
     * @param target The target object of the callback
     * @param args Arguments for the callback
     * @zh 添加回调函数
     * @param callback 回调函数
     * @param target 回调函数的目标对象
     * @param args 回调函数的参数
     */
    public add(callback: Function, target?: any, args?: any[]): void {
        let arr = this._items;
        let index = arr.findIndex((value, index, arr) => value == callback && arr[index + 1] == target);
        if (index != -1) {
            arr[index + 2] = args;
            arr[index + 3] = 1;
        }
        else
            arr.push(callback, target, args, 1);
    }

    /**
     * @en Add a callback function that will only be executed once
     * @param callback The callback function
     * @param target The target object of the callback
     * @param args Arguments for the callback
     * @zh 添加只执行一次的回调函数
     * @param callback 回调函数
     * @param target 回调函数的目标对象
     * @param args 回调函数的参数
     */
    public once(callback: Function, target?: any, args?: any[]): void {
        let arr = this._items;
        let index = arr.findIndex((value, index, arr) => value == callback && arr[index + 1] == target);
        if (index != -1) {
            arr[index + 2] = args;
            arr[index + 3] = 2;
        }
        else
            arr.push(callback, target, args, 2);
    }

    /**
     * @en Remove a callback function
     * @param callback The callback function to remove
     * @param target The target object of the callback
     * @zh 移除回调函数
     * @param callback 要移除的回调函数
     * @param target 回调函数的目标对象
     */
    public remove(callback: Function, target?: any): void {
        let arr = this._items;
        let index = arr.findIndex((value, index, arr) => value == callback && arr[index + 1] == target);
        if (index != -1) {
            if (this._flag != 0) {
                arr[index + 3] = 0;
                this._flag = 2;
            }
            else
                arr.splice(index, ITEM_LAYOUT);
        }
    }

    /**
     * @en Clear all callback functions
     * @zh 清除所有回调函数
     */
    public clear(): void {
        let arr = this._items;
        if (this._flag != 0) {
            arr.forEach((value, index, arr) => { if (index % ITEM_LAYOUT == 3) arr[index] = 0; });
            this._flag = 2;
        }
        else {
            arr.length = 0;
        }
    }

   /**
     * @en Clear all callback functions for a specific target
     * @param target The target object
     * @zh 清除指定目标对象的所有回调函数
     * @param target 目标对象
     */
    public clearForTarget(target: any): void {
        if (!target)
            return;

        let arr = this._items;
        if (this._flag != 0) {
            arr.forEach((value, index, arr) => { if ((index % ITEM_LAYOUT == 1) && arr[index] == target) arr[index + 2] = 0; });
            this._flag = 2;
        }
        else {
            let i: number = arr.length - ITEM_LAYOUT;
            while (i >= 0) {
                if (arr[i + 1] == target)
                    arr.splice(i, ITEM_LAYOUT);
                i -= ITEM_LAYOUT;
            }
        }
    }

    /**
     * @en Get the number of callback functions
     * @zh 获取回调函数的数量
     */
    public get count(): number {
        return this._items.length / ITEM_LAYOUT;
    }

    /**
     * @en Invoke all callback functions
     * @param args Arguments for the invocation
     * @zh 调用所有回调函数
     * @param args 调用参数
     */
    public invoke(...args: any[]): void {
        if (this._flag != 0)
            return;

        this._flag = 1;
        let arr = this._items;
        let cnt = arr.length;
        for (let i = 0; i < cnt; i += ITEM_LAYOUT) {
            if (0 == arr[i + 3]) continue;
            let fixedArgs = arr[i + 2];
            try {
                if (fixedArgs != null)
                    arr[i].call(arr[i + 1], ...fixedArgs, ...args);
                else
                    arr[i].call(arr[i + 1], ...args);
            }
            catch (err: any) {
                console.error(err);
            }
            if (arr[i + 3] == 2) {
                arr[i + 3] = 0;
                this._flag = 2;
            }
        }

        if (this._flag == 2) {
            let cnt = arr.length;
            let i = 0;
            while (i < cnt) {
                if (arr[i + 3] == 0) {
                    arr.splice(i, ITEM_LAYOUT);
                    cnt -= ITEM_LAYOUT;
                    continue;
                }
                else
                    i += ITEM_LAYOUT;
            }
        }
        this._flag = 0;
    }
}