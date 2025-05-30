import { AccelerationInfo } from "./AccelerationInfo";
import { EventDispatcher } from "../../events/EventDispatcher";
import { ILaya } from "../../../ILaya";
import { Event } from "../../events/Event";
import { PAL } from "../../platform/PlatformAdapters";
import { RotationInfo } from "./RotationInfo";

/**
 * @en Use Accelerator.instance to get the unique Accelerator reference. Do not call the constructor directly.
 * The callback handler of listen() accepts four parameters:
 * - acceleration: The acceleration given to the device without gravity.
 * - accelerationIncludingGravity: The total acceleration (including gravity).
 * - rotationRate: The rate of rotation.
 * - interval: The time interval for the acceleration data获取 (in milliseconds).
 * NOTE
 * For example, while the alpha in the rotationRate is documented as the z-axis rotation angle in both Apple and Mozilla documentation, actual testing shows it to be the x-axis rotation angle. To make the values represented by each property consistent with the documentation, the actual values have been swapped with other properties.
 * The mappings are as follows:
 * - alpha uses the gamma value.
 * - beta uses the alpha value.
 * - gamma uses the beta value.
 * It is currently unclear which is correct, and this serves as a note.
 * @zh 通过 Accelerator.instance 获取唯一的 Accelerator 引用，不要直接调用构造函数。
 * listen() 的回调处理器接受四个参数：
 * - acceleration: 设备的加速度（不包含重力）。
 * - accelerationIncludingGravity: 总加速度（包含重力）。
 * - rotationRate: 自转速率。
 * - interval: 获取加速度数据的时间间隔（毫秒）。
 * 注意：
 * 例如，rotationRate 中的 alpha 在 Apple 和 Mozilla 文档中都是 z 轴旋转角度，但实测是 x 轴旋转角度。为了使各属性表示的值与文档所述相同，实际值与其他属性进行了对调。
 * 具体对应如下：
 * - alpha 使用 gamma 值。
 * - beta 使用 alpha 值。
 * - gamma 使用 beta 值。
 * 目前孰是孰非尚未可知，以此为注。
 */
export class Accelerator extends EventDispatcher {
    /**
     * Accelerator的唯一引用。
     */
    private static _instance: Accelerator;

    /**
     * @en The singleton instance of Accelerator.
     * @zh Accelerator 的单例实例。
     */
    static get instance(): Accelerator {
        Accelerator._instance = Accelerator._instance || new Accelerator()
        return Accelerator._instance;
    }

    constructor() {
        super();
    }

    protected onStartListeningToType(type: string) {
        if (type === Event.CHANGE)
            PAL.device.on("devicemotion", this, this.onDeviceMotionChange);
        return this;
    }

    private onDeviceMotionChange(acceleration: AccelerationInfo,
        accelerationIncludingGravity: AccelerationInfo,
        interval: number,
        rotationRate: RotationInfo): void {
        this.event(Event.CHANGE, [acceleration, accelerationIncludingGravity, rotationRate, interval]);
    }

    private static transformedAcceleration: AccelerationInfo;

    /**
     * @en Converts the acceleration values to visually correct acceleration values. 
     * @param acceleration The original acceleration information.
     * @returns The transformed acceleration information.
     * @zh 将加速度值转换为视觉上正确的加速度值。
     * @param acceleration 原始的加速度信息。
     * @returns 转换后的加速度信息。
     */
    static getTransformedAcceleration(acceleration: AccelerationInfo): AccelerationInfo {
        Accelerator.transformedAcceleration = Accelerator.transformedAcceleration || { x: 0, y: 0, z: 0 };
        Accelerator.transformedAcceleration.z = acceleration.z;

        let ot = PAL.browser.getScreenOrientation();

        if (ot === "landscape-primary") {
            Accelerator.transformedAcceleration.x = acceleration.y;
            Accelerator.transformedAcceleration.y = -acceleration.x;
        }
        else if (ot === "landscape-secondary") {
            Accelerator.transformedAcceleration.x = -acceleration.y;
            Accelerator.transformedAcceleration.y = acceleration.x;
        }
        else if (ot === "portrait-primary") {
            Accelerator.transformedAcceleration.x = acceleration.x;
            Accelerator.transformedAcceleration.y = acceleration.y;
        }
        else if (ot === "portrait-secondary") {
            Accelerator.transformedAcceleration.x = -acceleration.x;
            Accelerator.transformedAcceleration.y = -acceleration.y;
        }

        let tx: number;
        if (ILaya.stage.canvasDegree == -90) {
            tx = Accelerator.transformedAcceleration.x;
            Accelerator.transformedAcceleration.x = -Accelerator.transformedAcceleration.y;
            Accelerator.transformedAcceleration.y = tx;
        }
        else if (ILaya.stage.canvasDegree == 90) {
            tx = Accelerator.transformedAcceleration.x;
            Accelerator.transformedAcceleration.x = Accelerator.transformedAcceleration.y;
            Accelerator.transformedAcceleration.y = -tx;
        }

        return Accelerator.transformedAcceleration;
    }
}



