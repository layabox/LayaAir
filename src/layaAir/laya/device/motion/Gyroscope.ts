import { RotationInfo } from "./RotationInfo";
import { Event } from "../../events/Event";
import { EventDispatcher } from "../../events/EventDispatcher";
import { PAL } from "../../platform/PlatformAdapters";

/**
 * @en Use Gyroscope.instance to obtain the unique Gyroscope reference. Do not call the constructor directly.
 * The callback handler of listen() accepts two parameters:
 * - onOrientationChange: A function with the signature <code>function onOrientationChange(absolute: Boolean, info: RotationInfo): void</code>.
 * - absolute: Indicates whether the device can provide absolute orientation data (toward the Earth coordinate system) or an arbitrary coordinate system determined by the device. For more information about coordinate systems, see [Orientation and motion data explained](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained).
 * - info: A RotationInfo type parameter that stores the device's rotation values.
 * For browser compatibility, refer to: (http://caniuse.com/#search=deviceorientation).
 * @zh 通过 Gyroscope.instance 获取唯一的 Gyroscope 引用，不要直接调用构造函数。
 * listen() 的回调处理器接受两个参数：
 * - function onOrientationChange: 一个函数，签名为 function onOrientationChange(absolute: Boolean, info: RotationInfo): void。
 * - absolute: 指明设备是否能够提供绝对方位数据（指向地球坐标系），或者由设备决定的任意坐标系。关于坐标系更多信息，请参阅 [方位和运动数据解释](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained)。
 * - info: RotationInfo 类型的参数，保存设备的旋转值。
 * 浏览器兼容性信息，请参阅：(http://caniuse.com/#search=deviceorientation)。
 */
export class Gyroscope extends EventDispatcher {

    /**
     * Gyroscope的唯一引用。
     */
    private static _instance: Gyroscope;

    /**
     * @en Gets the singleton instance of Gyroscope.
     * @zh 获取 Gyroscope 的单例实例。
     */
    static get instance(): Gyroscope {
        Gyroscope._instance = Gyroscope._instance || new Gyroscope();
        return Gyroscope._instance;
    }

    protected onStartListeningToType(type: string) {
        if (type === Event.CHANGE)
            PAL.device.on("deviceorientation", this, this.onDeviceOrientation);
        return this;
    }

    private onDeviceOrientation(absolute: boolean, orientationInfo: RotationInfo): void {
        this.event(Event.CHANGE, [absolute, orientationInfo]);
    }
}

