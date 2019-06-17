import { EventDispatcher } from "../events/EventDispatcher";
import { Handler } from "../utils/Handler";
/**
 * <p> <code>SoundChannel</code> 用来控制程序中的声音。每个声音均分配给一个声道，而且应用程序可以具有混合在一起的多个声道。</p>
 * <p> <code>SoundChannel</code> 类包含控制声音的播放、暂停、停止、音量的方法，以及获取声音的播放状态、总时间、当前播放时间、总循环次数、播放地址等信息的方法。</p>
 */
export declare class SoundChannel extends EventDispatcher {
    /**
     * 声音地址。
     */
    url: string;
    /**
     * 循环次数。
     */
    loops: number;
    /**
     * 播放声音开始时间。
     */
    startTime: number;
    /**
     * 表示声音是否已暂停。
     */
    isStopped: boolean;
    /**
     * 播放完成处理器。
     */
    completeHandler: Handler;
    /**
     * 音量范围从 0（静音）至 1（最大音量）。
     */
    volume: number;
    /**
     * 获取当前播放时间，单位是秒。
     */
    readonly position: number;
    /**
     * 获取总时间，单位是秒。
     */
    readonly duration: number;
    /**
     * 播放声音。
     */
    play(): void;
    /**
     * 停止播放。
     */
    stop(): void;
    /**
     * 暂停播放。
     */
    pause(): void;
    /**
     * 继续播放。
     */
    resume(): void;
    /**
     * private
     */
    protected __runComplete(handler: Handler): void;
}
