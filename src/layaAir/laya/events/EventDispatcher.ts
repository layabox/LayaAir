import { Delegate } from "../utils/Delegate";
import { Event } from "./Event";

const eventPool: Array<Event> = [];

/**
 * @en The `EventDispatcher` class is the base class for all classes that dispatch events.
 * @zh `EventDispatcher` 类是可调度事件的所有类的基类。
 */
export class EventDispatcher {
    /**@private */
    private _events: Record<string, Delegate>;

    /**
     * @internal
     * @protected
     * @en Start listening to a specific event type.
     * This method is called when a new event listener is added.
     * @param type The event type to listen to.
     * @zh 开始监听特定事件类型。
     * 添加新的事件侦听器时调用此方法。
     * @param type 要监听的事件类型。
     */
    protected onStartListeningToType(type: string) {
    }

    /**
     * @en Check if the EventDispatcher object has any listeners registered for a specific type of event.
     * @param type The type of event.
     * @returns True if a listener of the specified type is registered, false otherwise.
     * @zh 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器。
     * @param type 事件的类型。
     * @returns 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
     */
    hasListener(type: string): boolean {
        let listeners = this._events && this._events[type];
        return !!listeners && listeners.count > 0;
    }

    /**
     * @en Dispatch an event.
     * @param type The type of event.
     * @param data (Optional) Data to pass to the callback. If multiple parameters p1, p2, p3, ... need to be passed, use an array structure such as [p1, p2, p3, ...]. If a single parameter p needs to be passed and p is an array, use a structure such as [p]. For other single parameters p, you can directly pass parameter p.
     * @returns True if there are listeners for this event type, false otherwise.
     * @zh 派发事件。
     * @param type 事件类型。
     * @param data （可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p ，且 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     * @returns 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
     */
    event(type: string, data?: any): boolean {
        let listeners = this._events && this._events[type];
        if (!listeners) return false;
        let ret = listeners.count > 0;

        if (Array.isArray(data))
            listeners.invoke(...data);
        else if (data !== undefined)
            listeners.invoke(data);
        else if (data === Event.EMPTY) {
            let ev = eventPool.length > 0 ? eventPool.pop() : new Event();
            listeners.invoke(ev.setTo(type, this, this));
            ev.target = ev.currentTarget = null;
            eventPool.push(ev);
        }
        else
            listeners.invoke();

        return ret;
    }

    /**
     * @en Register an event listener object with the EventDispatcher object so that the listener receives event notifications.
     * @param type The type of event.
     * @param caller The execution scope of the event listener function.
     * @param listener The listener function.
     * @param args (Optional) The callback parameters of the event listener function.
     * @returns This EventDispatcher object.
     * @zh 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
     * @param type 事件的类型。
     * @param caller 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     * @param args （可选）事件侦听函数的回调参数。
     * @returns 此 EventDispatcher 对象。
     */
    on(type: string, listener: Function): EventDispatcher;
    on(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    on(type: string, caller: any, listener?: Function, args?: any[]): EventDispatcher {
        if (arguments.length == 2) {
            listener = caller;
            caller = null;
        }
        if (!this._events) this._events = {};
        let listeners = this._events[type];
        if (!listeners) {
            this.onStartListeningToType(type);
            this._events[type] = listeners = new Delegate();
        }

        listeners.add(listener, caller, args);
        return this;
    }

    /**
     * @en Register an event listener object with the EventDispatcher object so that the listener receives event notifications. This event listener responds once and is automatically removed after the first call.
     * @param type The type of event.
     * @param caller The execution scope of the event listener function.
     * @param listener The listener function.
     * @param args (Optional) The callback parameters of the event listener function.
     * @returns This EventDispatcher object.
     * @zh 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知，此侦听事件响应一次后自动移除。
     * @param type 事件的类型。
     * @param caller 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     * @param args （可选）事件侦听函数的回调参数。
     * @returns 此 EventDispatcher 对象。
     */
    once(type: string, listener: Function): EventDispatcher;
    once(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    once(type: string, caller: any, listener?: Function, args?: any[]): EventDispatcher {
        if (arguments.length == 2) {
            listener = caller;
            caller = null;
        }
        if (!this._events) this._events = {};
        let listeners = this._events[type];
        if (!listeners) {
            this.onStartListeningToType(type);
            this._events[type] = listeners = new Delegate();
        }

        listeners.once(listener, caller, args);
        return this;
    }

    /**
     * @en Remove a listener from the EventDispatcher object.
     * @param type The type of event.
     * @param caller The execution scope of the event listener function.
     * @param listener The listener function.
     * @returns This EventDispatcher object.
     * @zh 从 EventDispatcher 对象中删除侦听器。
     * @param type 事件的类型。
     * @param caller 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     * @returns 此 EventDispatcher 对象。
     */
    off(type: string, listener: Function): EventDispatcher;
    off(type: string, caller: any, listener?: Function, args?: any[]): EventDispatcher;
    off(type: string, caller: any, listener?: Function): EventDispatcher {
        if (arguments.length == 2) {
            listener = caller;
            caller = null;
        }
        let listeners = this._events && this._events[type];
        if (listeners)
            listeners.remove(listener, caller);

        return this;
    }

    /**
     * @en Remove all listeners of the specified event type from the EventDispatcher object.
     * @param type (Optional) The type of event. If the value is null, all types of listeners on this object are removed.
     * @returns This EventDispatcher object.
     * @zh 从 EventDispatcher 对象中删除指定事件类型的所有侦听器。
     * @param type （可选）事件类型，如果值为 null，则移除本对象所有类型的侦听器。
     * @returns 此 EventDispatcher 对象。
     */
    offAll(type?: string): EventDispatcher {
        if (type == null)
            this._events = null;
        else {
            let listeners = this._events && this._events[type];
            if (listeners)
                listeners.clear();
        }
        return this;
    }

    /**
     * @en Remove all event listeners whose caller is the specified target.
     * @param caller The target caller object.
     * @returns This EventDispatcher object.
     * @zh 移除caller为target的所有事件监听。
     * @param caller caller对象
     * @returns 此 EventDispatcher 对象。
     */
    offAllCaller(caller: any): EventDispatcher {
        if (caller && this._events) {
            for (let type in this._events)
                this._events[type].clearForTarget(caller);
        }
        return this;
    }
}
