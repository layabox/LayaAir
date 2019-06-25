import { EventDispatcher } from "../../events/EventDispatcher";
/**
 * 使用Gyroscope.instance获取唯一的Gyroscope引用，请勿调用构造函数。
 *
 * <p>
 * listen()的回调处理器接受两个参数：
 * <code>function onOrientationChange(absolute:Boolean, info:RotationInfo):void</code>
 * <ol>
 * <li><b>absolute</b>: 指示设备是否可以提供绝对方位数据（指向地球坐标系），或者设备决定的任意坐标系。关于坐标系参见<i>https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained</i>。</li>
 * <li><b>info</b>: <code>RotationInfo</code>类型参数，保存设备的旋转值。</li>
 * </ol>
 * </p>
 *
 * <p>
 * 浏览器兼容性参见：<i>http://caniuse.com/#search=deviceorientation</i>
 * </p>
 */
export declare class Gyroscope extends EventDispatcher {
    private static info;
    /**
     * Gyroscope的唯一引用。
     */
    private static _instance;
    static readonly instance: Gyroscope;
    constructor(singleton: number);
    /**
     * 监视陀螺仪运动。
     * @param	observer	回调函数接受一个Boolean类型的<code>absolute</code>和<code>GyroscopeInfo</code>类型参数。
     */
    on(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    /**
     * 取消指定处理器对陀螺仪的监视。
     * @param	observer
     */
    off(type: string, caller: any, listener: Function, onceOnly?: boolean): EventDispatcher;
    private onDeviceOrientationChange;
}
