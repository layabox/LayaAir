import { AccelerationInfo } from "./AccelerationInfo";
import { RotationInfo } from "./RotationInfo";
import { EventDispatcher } from "../../events/EventDispatcher";
import { ILaya } from "../../../ILaya";
import { Event } from "../../events/Event";

/**
 * Accelerator.instance获取唯一的Accelerator引用，请勿调用构造函数。
 *
 * <p>
 * listen()的回调处理器接受四个参数：
 * <ol>
 * <li><b>acceleration</b>: 表示用户给予设备的加速度。</li>
 * <li><b>accelerationIncludingGravity</b>: 设备受到的总加速度（包含重力）。</li>
 * <li><b>rotationRate</b>: 设备的自转速率。</li>
 * <li><b>interval</b>: 加速度获取的时间间隔（毫秒）。</li>
 * </ol>
 * </p>
 * <p>
 * <b>NOTE</b><br/>
 * 如，rotationRate的alpha在apple和moz文档中都是z轴旋转角度，但是实测是x轴旋转角度。为了使各属性表示的值与文档所述相同，实际值与其他属性进行了对调。
 * 其中：
 * <ul>
 * <li>alpha使用gamma值。</li>
 * <li>beta使用alpha值。</li>
 * <li>gamma使用beta。</li>
 * </ul>
 * 目前孰是孰非尚未可知，以此为注。
 * </p>
 */
export class Accelerator extends EventDispatcher {
    /**
     * Accelerator的唯一引用。
     */
    private static _instance: Accelerator;

    static get instance(): Accelerator {
        Accelerator._instance = Accelerator._instance || new Accelerator(0)
        return Accelerator._instance;
    }

    private static acceleration: AccelerationInfo = new AccelerationInfo();
    private static accelerationIncludingGravity: AccelerationInfo = new AccelerationInfo();
    private static rotationRate: RotationInfo = new RotationInfo();

    constructor(singleton: number) {
        super();
        this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
    }

    /**
     * 侦听加速器运动。
     * @param observer	回调函数接受4个参数，见类说明。
     * @override
     */
    on(type: string, caller: any, listener: Function, args: any[] = null): EventDispatcher {
        super.on(type, caller, listener, args);
        ILaya.Browser.window.addEventListener('devicemotion', this.onDeviceOrientationChange);
        return this;
    }

    /**
     * 取消侦听加速器。
     * @param	handle	侦听加速器所用处理器。
     * @override
     */
    off(type: string, caller: any, listener: Function, onceOnly: boolean = false): EventDispatcher {
        if (!this.hasListener(type))
            ILaya.Browser.window.removeEventListener('devicemotion', this.onDeviceOrientationChange)

        return super.off(type, caller, listener, onceOnly);
    }

    private onDeviceOrientationChange(e: any): void {
        var interval: number = e.interval;

        Accelerator.acceleration.x = e.acceleration.x;
        Accelerator.acceleration.y = e.acceleration.y;
        Accelerator.acceleration.z = e.acceleration.z;

        Accelerator.accelerationIncludingGravity.x = e.accelerationIncludingGravity.x;
        Accelerator.accelerationIncludingGravity.y = e.accelerationIncludingGravity.y;
        Accelerator.accelerationIncludingGravity.z = e.accelerationIncludingGravity.z;

        Accelerator.rotationRate.alpha = e.rotationRate.gamma * -1;
        Accelerator.rotationRate.beta = e.rotationRate.alpha * -1;
        Accelerator.rotationRate.gamma = e.rotationRate.beta;

        if (ILaya.Browser.onAndroid) {
            if (ILaya.Browser.userAgent.indexOf("Chrome") > -1) {
                Accelerator.rotationRate.alpha *= 180 / Math.PI;
                Accelerator.rotationRate.beta *= 180 / Math.PI;
                Accelerator.rotationRate.gamma *= 180 / Math.PI;
            }

            Accelerator.acceleration.x *= -1;
            Accelerator.accelerationIncludingGravity.x *= -1;
        }
        else if (ILaya.Browser.onIOS) {
            Accelerator.acceleration.y *= -1;
            Accelerator.acceleration.z *= -1;

            Accelerator.accelerationIncludingGravity.y *= -1;
            Accelerator.accelerationIncludingGravity.z *= -1;

            interval *= 1000;
        }
        this.event(Event.CHANGE, [Accelerator.acceleration, Accelerator.accelerationIncludingGravity, Accelerator.rotationRate, interval]);
    }

    private static transformedAcceleration: AccelerationInfo;
    /**
     * 把加速度值转换为视觉上正确的加速度值。依赖于Browser.window.orientation，可能在部分低端机无效。
     * @param	acceleration
     * @return
     */
    static getTransformedAcceleration(acceleration: AccelerationInfo): AccelerationInfo {
        Accelerator.transformedAcceleration = Accelerator.transformedAcceleration || new AccelerationInfo();
        Accelerator.transformedAcceleration.z = acceleration.z;

        if (ILaya.Browser.window.orientation == 90) {
            Accelerator.transformedAcceleration.x = acceleration.y;
            Accelerator.transformedAcceleration.y = -acceleration.x;
        }
        else if (ILaya.Browser.window.orientation == -90) {
            Accelerator.transformedAcceleration.x = -acceleration.y;
            Accelerator.transformedAcceleration.y = acceleration.x;
        }
        else if (!ILaya.Browser.window.orientation) {
            Accelerator.transformedAcceleration.x = acceleration.x;
            Accelerator.transformedAcceleration.y = acceleration.y;
        }
        else if (ILaya.Browser.window.orientation == 180) {
            Accelerator.transformedAcceleration.x = -acceleration.x;
            Accelerator.transformedAcceleration.y = -acceleration.y;
        }

        var tx: number;
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



