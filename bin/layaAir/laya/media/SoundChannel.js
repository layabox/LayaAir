import { EventDispatcher } from "../events/EventDispatcher";
/**
 * <p> <code>SoundChannel</code> 用来控制程序中的声音。每个声音均分配给一个声道，而且应用程序可以具有混合在一起的多个声道。</p>
 * <p> <code>SoundChannel</code> 类包含控制声音的播放、暂停、停止、音量的方法，以及获取声音的播放状态、总时间、当前播放时间、总循环次数、播放地址等信息的方法。</p>
 */
export class SoundChannel extends EventDispatcher {
    constructor() {
        super(...arguments);
        /**
         * 表示声音是否已暂停。
         */
        this.isStopped = false;
    }
    /**
     * 音量范围从 0（静音）至 1（最大音量）。
     */
    set volume(v) {
    }
    get volume() {
        return 1;
    }
    /**
     * 获取当前播放时间，单位是秒。
     */
    get position() {
        return 0;
    }
    /**
     * 获取总时间，单位是秒。
     */
    get duration() {
        return 0;
    }
    /**
     * 播放声音。
     */
    play() {
    }
    /**
     * 停止播放。
     */
    stop() {
        if (this.completeHandler)
            this.completeHandler.run();
    }
    /**
     * 暂停播放。
     */
    pause() {
    }
    /**
     * 继续播放。
     */
    resume() {
    }
    /**
     * private
     */
    __runComplete(handler) {
        if (handler) {
            handler.run();
        }
    }
}
