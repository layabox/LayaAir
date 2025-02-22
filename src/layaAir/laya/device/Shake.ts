import { AccelerationInfo } from "./motion/AccelerationInfo"
import { Accelerator } from "./motion/Accelerator"
import { RotationInfo } from "./motion/RotationInfo"
import { EventDispatcher } from "../events/EventDispatcher";
import { Handler } from "../utils/Handler";
import { Event } from "../events/Event";
import { ILaya } from "../../ILaya";


/**
 * @en Shake is usually achieved through the built-in accelerometer and gyroscope sensors in a mobile phone, and it only works on devices that support this operation.
 * @zh 摇动通常是通过手机内置的加速度计和陀螺仪传感器来实现，只能在支持此操作的设备环境上有效。 * 
 */
export class Shake extends EventDispatcher {
    private threshold: number;
    private shakeInterval: number;

    private lastX: number;
    private lastY: number;
    private lastZ: number;

    private lastMillSecond: number;

    constructor() {
        super();


    }

    private static _instance: Shake;
    /**
     * @en The singleton instance of Shake.
     * @zh  Shake 的单例实例。
     */
    static get instance(): Shake {
        Shake._instance = Shake._instance || new Shake();
        return Shake._instance;
    }

    /**
     * @en Starts responding to device shaking.
     * The response is based on the threshold of instantaneous velocity and the interval between shakes.
     * @param threshold The threshold for the instantaneous velocity for a shake response, which is approximately between 5 to 10 for a mild shake.
     * @param interval The interval time for responding to device shakes.
     * @zh 开始响应设备摇晃。
     * @param threshold 响应瞬时速度的阈值，轻度摇晃的值约在 5 到 10 之间。
     * @param interval 设备摇晃的响应间隔时间。
     */
    start(threshold: number, interval: number): void {
        this.threshold = threshold;
        this.shakeInterval = interval;

        this.lastX = this.lastY = this.lastZ = NaN;

        // 使用加速器监听设备运动。
        Accelerator.instance.on(Event.CHANGE, this, this.onShake);
    }

    /**
     * @en Stops responding to device shaking.
     * @zh 停止响应设备摇晃。
     */
    stop(): void {
        Accelerator.instance.off(Event.CHANGE, this, this.onShake);
    }

    private onShake(acceleration: AccelerationInfo, accelerationIncludingGravity: AccelerationInfo, rotationRate: RotationInfo, interval: number): void {
        // 设定摇晃的初始状态。
        if (isNaN(this.lastX)) {
            this.lastX = accelerationIncludingGravity.x;
            this.lastY = accelerationIncludingGravity.y;
            this.lastZ = accelerationIncludingGravity.z;

            this.lastMillSecond = ILaya.Browser.now();
            return;
        }

        // 速度增量计算。
        var deltaX: number = Math.abs(this.lastX - accelerationIncludingGravity.x);
        var deltaY: number = Math.abs(this.lastY - accelerationIncludingGravity.y);
        var deltaZ: number = Math.abs(this.lastZ - accelerationIncludingGravity.z);

        // 是否满足摇晃选项。
        if (this.isShaked(deltaX, deltaY, deltaZ)) {
            var deltaMillSecond: number = ILaya.Browser.now() - this.lastMillSecond;

            // 按照设定间隔触发摇晃。
            if (deltaMillSecond > this.shakeInterval) {
                this.event(Event.CHANGE);
                this.lastMillSecond = ILaya.Browser.now();
            }
        }

        this.lastX = accelerationIncludingGravity.x;
        this.lastY = accelerationIncludingGravity.y;
        this.lastZ = accelerationIncludingGravity.z;
    }

    /**
     * @en Determines whether the device is shaken based on the acceleration differences in three directions.
     *       It checks if at least two of the acceleration differences exceed the set threshold.
     * @param deltaX The acceleration difference in the X direction.
     * @param deltaY The acceleration difference in the Y direction.
     * @param deltaZ The acceleration difference in the Z direction.
     * @returns Returns true if at least two of the acceleration differences exceed the threshold; otherwise, returns false.
     * @zh 根据三个方向的加速度差值判断设备是否发生摇晃。
     *       检查三个方向的加速度差值中是否至少有两个超过了设定的阈值。
     * @param deltaX X 方向的加速度差值。
     * @param deltaY Y 方向的加速度差值。
     * @param deltaZ Z 方向的加速度差值。
     * @returns 如果至少有两个方向的加速度差值超过阈值，则返回 true；否则返回 false。
     */
    private isShaked(deltaX: number, deltaY: number, deltaZ: number): boolean {
        // 通过位运算，将每个方向的加速度差值是否超过阈值的结果用二进制位表示
        // 如果 deltaX 超过阈值，mask 的第 0 位为 1；如果 deltaY 超过阈值，mask 的第 1 位为 1；如果 deltaZ 超过阈值，mask 的第 2 位为 1
        const mask = (deltaX > this.threshold ? 1 : 0) |
            (deltaY > this.threshold ? 2 : 0) |
            (deltaZ > this.threshold ? 4 : 0);
        // 通过 mask & (mask - 1) 操作判断 mask 中是否至少有两个 1， 如果结果不为 0，说明至少有两个方向的加速度差值超过了阈值
        return (mask & (mask - 1)) !== 0;
    }
}

