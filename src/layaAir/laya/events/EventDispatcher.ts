import { Handler } from "../utils/Handler"

/**
 * <code>EventDispatcher</code> 类是可调度事件的所有类的基类。
 */
export class EventDispatcher {
    /**@private */
    static MOUSE_EVENTS: any = { "rightmousedown": true, "rightmouseup": true, "rightclick": true, "mousedown": true, "mouseup": true, "mousemove": true, "mouseover": true, "mouseout": true, "click": true, "doubleclick": true };
    /**@private */
    private _events: any;

    //[IF-JS]Object.defineProperty(EventDispatcher.prototype, "_events", {enumerable: false,writable:true});

    /**
     * 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器。
     * @param	type 事件的类型。
     * @return 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
     */
    hasListener(type: string): boolean {
        var listener: any = this._events && this._events[type];
        return !!listener;
    }

    /**
     * 派发事件。
     * @param type	事件类型。
     * @param data	（可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p ，且 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     * @return 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
     */
    event(type: string, data: any = null): boolean {
        if (!this._events || !this._events[type]) return false;

        var listeners: any = this._events[type];
        if (listeners.run) {
            if (listeners.once) delete this._events[type];
            data != null ? listeners.runWith(data) : listeners.run();
        } else {
            for (var i: number = 0, n: number = listeners.length; i < n; i++) {
                var listener: Handler = listeners[i];
                if (listener) {
                    (data != null) ? listener.runWith(data) : listener.run();
                }
                if (!listener || listener.once) {
                    listeners.splice(i, 1);
                    i--;
                    n--;
                }
            }
            if (listeners.length === 0 && this._events) delete this._events[type];
        }

        return true;
    }

    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     */
    on(type: string, caller: any, listener: Function, args: any[] = null): EventDispatcher {
        return this._createListener(type, caller, listener, args, false);
    }

    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知，此侦听事件响应一次后自动移除。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     */
    once(type: string, caller: any, listener: Function, args: any[] = null): EventDispatcher {
        return this._createListener(type, caller, listener, args, true);
    }

    /**@internal */
    _createListener(type: string, caller: any, listener: Function, args: any[], once: boolean, offBefore: boolean = true): EventDispatcher {
        //移除之前相同的监听
        offBefore && this.off(type, caller, listener, once);

        //使用对象池进行创建回收
        var handler: Handler = EventHandler.create(caller || this, listener, args, once);
        this._events || (this._events = {});

        var events: any = this._events;
        //默认单个，每个对象只有多个监听才用数组，节省一个数组的消耗
        if (!events[type]) events[type] = handler;
        else {
            if (!events[type].run) events[type].push(handler);
            else events[type] = [events[type], handler];
        }
        return this;
    }

    /**
     * 从 EventDispatcher 对象中删除侦听器。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param onceOnly	（可选）如果值为 true ,则只移除通过 once 方法添加的侦听器。
     * @return 此 EventDispatcher 对象。
     */
    off(type: string, caller: any, listener: Function, onceOnly: boolean = false): EventDispatcher {
        if (!this._events || !this._events[type]) return this;
        var listeners: any = this._events[type];
        if (listeners != null) {
            if (listeners.run) {
                if ((!caller || listeners.caller === caller) && (listener == null || listeners.method === listener) && (!onceOnly || listeners.once)) {
                    delete this._events[type];
                    listeners.recover();
                }
            } else {
                var count: number = 0;
                for (var i: number = 0, n: number = listeners.length; i < n; i++) {
                    var item: Handler = listeners[i];
                    if (!item) {
                        count++;
                        continue;
                    }
                    if (item && (!caller || item.caller === caller) && (listener == null || item.method === listener) && (!onceOnly || item.once)) {
                        count++;
                        listeners[i] = null;
                        item.recover();
                    }
                }
                //如果全部移除，则删除索引
                if (count === n) delete this._events[type];
            }
        }

        return this;
    }

    /**
     * 从 EventDispatcher 对象中删除指定事件类型的所有侦听器。
     * @param type	（可选）事件类型，如果值为 null，则移除本对象所有类型的侦听器。
     * @return 此 EventDispatcher 对象。
     */
    offAll(type: string = null): EventDispatcher {
        var events: any = this._events;
        if (!events) return this;
        if (type) {
            this._recoverHandlers(events[type]);
            delete events[type];
        } else {
            for (var name in events) {
                this._recoverHandlers(events[name]);
            }
            this._events = null;
        }
        return this;
    }

    /**
     * 移除caller为target的所有事件监听
     * @param	caller caller对象
     */
    offAllCaller(caller: any): EventDispatcher {
        if (caller && this._events) {
            for (var name in this._events) {
                this.off(name, caller, null);
            }
        }
        return this;
    }

    private _recoverHandlers(arr: any): void {
        if (!arr) return;
        if (arr.run) {
            arr.recover();
        } else {
            for (var i: number = arr.length - 1; i > -1; i--) {
                if (arr[i]) {
                    arr[i].recover();
                    arr[i] = null;
                }
            }
        }
    }

    /**
     * 检测指定事件类型是否是鼠标事件。
     * @param	type 事件的类型。
     * @return	如果是鼠标事件，则值为 true;否则，值为 false。
     */
    isMouseEvent(type: string): boolean {
        return EventDispatcher.MOUSE_EVENTS[type] || false;
    }
}




/**@private */
class EventHandler extends Handler {

    /**@private handler对象池*/
    protected static _pool: any[] = [];

    constructor(caller: any, method: Function, args: any[], once: boolean) {
        super(caller, method, args, once);
    }
	/**
	 * @override
	 */
    recover(): void {
        if (this._id > 0) {
            this._id = 0;
            EventHandler._pool.push(this.clear());
        }
    }

	/**
	 * 从对象池内创建一个Handler，默认会执行一次回收，如果不需要自动回收，设置once参数为false。
	 * @param caller	执行域(this)。
	 * @param method	回调方法。
	 * @param args		（可选）携带的参数。
	 * @param once		（可选）是否只执行一次，如果为true，回调后执行recover()进行回收，默认为true。
	 * @return 返回创建的handler实例。
	 */
    static create(caller: any, method: Function, args: any[] = null, once: boolean = true): Handler {
        if (EventHandler._pool.length) return EventHandler._pool.pop().setTo(caller, method, args, once);
        return new EventHandler(caller, method, args, once);
    }
}

