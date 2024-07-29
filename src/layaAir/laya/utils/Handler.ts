/**
 * @en The `Handler` class is an event handler class.
 * It is recommended to create a `Handler` object from the object pool using the `Handler.create()` method to reduce the overhead of object creation. When a `Handler` object is no longer needed, it can be recovered to the object pool using `Handler.recover()`. Do not use this object after recovery, as doing so may lead to unpredictable errors.
 * Note: Since mouse events also use this object pool, improper recovery and invocation may affect the execution of mouse events.
 * @zh Handler 是事件处理器类。
 * 推荐使用 Handler.create() 方法从对象池创建，减少对象创建消耗。创建的 Handler 对象不再使用后，可以使用 Handler.recover() 将其回收到对象池，回收后不要再使用此对象，否则会导致不可预料的错误。
 * 注意：由于鼠标事件也用本对象池，不正确的回收及调用，可能会影响鼠标事件的执行。
 */
export class Handler {

    /**@private handler对象池*/
    protected static _pool: Handler[] = [];
    /**@private */
    private static _gid: number = 1;

    /**
     * @en The scope of the object (this).
     * @zh 执行域(this)。
     */
    caller: Object | null;
    /**
     * @en The handling method.
     * @zh 处理方法。
     */
    method: Function | null;
    /**
     * @en Arguments passed to the handler method.
     * @zh 参数。
     */
    args: any[] | null;
    /**
     * @en Indicates whether the handler should be executed only once. If true, the handler will be recovered after execution.After recycling, it will be reused, default to false.
     * @zh 表示是否只执行一次。如果为true，回调后执行recover()进行回收。回收后会被再利用，默认为false
     */
    once = false;

    /**@private */
    protected _id = 0;

    /**
     * @en Constructor method.
     * @param caller The execution context.
     * @param method The handling function.
     * @param args Function arguments.
     * @param once Whether it should be executed only once.
     * @zh 构造方法
     * @param caller 执行域。
     * @param method 处理函数。
     * @param args 函数参数。
     * @param once 是否只执行一次。
     */
    constructor(caller: Object | null = null, method: Function | null = null, args: any[] | null = null, once: boolean = false) {
        this.setTo(caller, method, args, once);
    }

    /**
     * @en Sets the specified property values for this object.
     * @param caller The scope of the object (this).
     * @param method The callback method.
     * @param args The arguments to be passed to the method.
     * @param once Whether the handler should be executed only once. If true, the handler will be recovered after execution.
     * @returns Returns the handler itself.
     * @zh 设置此对象的指定属性值。
     * @param caller 执行域(this)。
     * @param method 回调方法。
     * @param args 携带的参数。
     * @param once 是否只执行一次，如果为true，执行后执行recover()进行回收。
     * @returns 返回 handler 本身。
     */
    setTo(caller: any, method: Function | null, args: any[] | null, once = false): Handler {
        this._id = Handler._gid++;
        this.caller = caller;
        this.method = method;
        this.args = args;
        this.once = once;
        return this;
    }

    /**
     * @en Executes the handler.
     * @zh 执行处理器。
     */
    run(): any {
        if (this.method == null) return null;
        var id: number = this._id;
        var result: any = this.method.apply(this.caller, this.args);
        this._id === id && this.once && this.recover();
        return result;
    }

    /**
     * @en Executes the handler with additional data.
     * @param data Additional callback data, can be a single data or an Array (as multiple arguments).
     * @zh 执行处理器，并携带额外数据。
     * @param data 附加的回调数据，可以是单个数据或者数组（作为多参）。
     */
    runWith(data: any): any {
        if (this.method == null) return null;
        var id: number = this._id;
        if (data == null)
            var result: any = this.method.apply(this.caller, this.args);
        else if (!this.args && !data.unshift) result = this.method.call(this.caller, data);
        else if (this.args) result = this.method.apply(this.caller, this.args.concat(data));
        else result = this.method.apply(this.caller, data);
        this._id === id && this.once && this.recover();
        return result;
    }

    /**
     * @en Clears the references of the object.
     * @zh 清理对象引用。
     */
    clear(): Handler {
        this.caller = null;
        this.method = null;
        this.args = null;
        return this;
    }

    /**
     * @en Clears the handler and recovers it to the Handler object pool.
     * @zh 清理并回收到 Handler 对象池内。
     */
    recover(): void {
        if (this._id > 0) {
            this._id = 0;
            Handler._pool.push(this.clear());
        }
    }

    /**
     * @en Creates a Handler from the object pool. By default, the handler will execute once and then be recovered immediately. If automatic recovery is not desired, set the `once` parameter to false.
     * @param caller The scope of the object (this).
     * @param method The callback method.
     * @param args The arguments to be passed to the callback method.
     * @param once Whether the handler should be executed only once. If true, the handler will be recovered after execution.
     * @returns Return the created handler instance.
     * @zh 从对象池内创建一个 Handler，默认会执行一次并立即回收。如果不需要自动回收，设置 `once` 参数为 false。
     * @param caller 执行域(this)。
     * @param method 回调方法。
     * @param args 回调方法的参数。
     * @param once 是否只执行一次，如果为true，回调后执行 recover() 进行回收，默认为true。
     * @return 返回创建的handler实例。
     */
    static create(caller: any, method: Function | null, args: any[] | null = null, once: boolean = true): Handler {
        if (Handler._pool.length)
            return (Handler._pool.pop() as Handler).setTo(caller, method, args, once);
        return new Handler(caller, method, args, once);
    }
}

