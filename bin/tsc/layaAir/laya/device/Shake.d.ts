import { EventDispatcher } from "../events/EventDispatcher";
/**
 * Shake只能在支持此操作的设备上有效。
 *
 */
export declare class Shake extends EventDispatcher {
    private throushold;
    private shakeInterval;
    private callback;
    private lastX;
    private lastY;
    private lastZ;
    private lastMillSecond;
    constructor();
    private static _instance;
    static readonly instance: Shake;
    /**
     * 开始响应设备摇晃。
     * @param	throushold	响应的瞬时速度阈值，轻度摇晃的值约在5~10间。
     * @param	timeout		设备摇晃的响应间隔时间。
     * @param	callback	在设备摇晃触发时调用的处理器。
     */
    start(throushold: number, interval: number): void;
    /**
     * 停止响应设备摇晃。
     */
    stop(): void;
    private onShake;
    private isShaked;
}
