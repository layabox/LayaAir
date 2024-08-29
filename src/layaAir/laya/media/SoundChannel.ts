import { EventDispatcher } from "../events/EventDispatcher"
import { Handler } from "../utils/Handler"

/**
 * @en The `SoundChannel` class is used to control sounds in the program. Each sound is assigned to a channel, and an application can have multiple channels mixed together.
 * The `SoundChannel` class contains methods for controlling sound playback, pause, stop, volume, as well as methods for getting information about the sound's playback status, total time, current playback time, total loop count, and playback address.
 * @zh `SoundChannel` 用来控制程序中的声音。每个声音均分配给一个声道，而且应用程序可以具有混合在一起的多个声道。
 * `SoundChannel` 类包含控制声音的播放、暂停、停止、音量的方法，以及获取声音的播放状态、总时间、当前播放时间、总循环次数、播放地址等信息的方法。
 */
export class SoundChannel extends EventDispatcher {
    /**
     * @en The URL of the sound.
     * @zh 声音地址。
     */
    url: string;
    /**
     * @en The number of loops.
     * @zh 循环次数。
     */
    loops: number;
    /**
     * @en The start time of sound playback.
     * @zh 播放声音开始时间。
     */
    startTime: number;
    /**
     * @en Indicates whether the sound is paused. 
     * @zh 表示声音是否已暂停。
     */
    isStopped: boolean = false;
    /**
     * @en The handler for playback completion.
     * @zh 播放完成处理器。
     */
    completeHandler: Handler;

    /**
     * @en The volume. The volume range is from 0 (mute) to 1 (maximum volume).
     * @zh 音量。音量范围从 0（静音）至 1（最大音量）。
     */
    get volume(): number {
        return 1;
    }

    set volume(v: number) {

    }


    /**
     * @en The current playback time in seconds.
     * @zh 当前播放时间，单位是秒。
     */
    get position(): number {
        return 0;
    }

    /**
     * @en The total duration in seconds.
     * @zh 总时间，单位是秒。
     */
    get duration(): number {
        return 0;
    }

    /**
     * @en Play the sound.
     * @zh 播放声音。
     */
    play(): void {

    }

    /**
     * @en Stop playing the sound.
     * @zh 停止播放。
     */
    stop(): void {
        if (this.completeHandler) this.completeHandler.runWith(false);
    }

    /**
     * @en Pause the sound playback.
     * @zh 暂停播放。
     */
    pause(): void {
    }

    /**
     * @en Resume the sound playback.
     * @zh 继续播放。
     */
    resume(): void {
    }

    protected __runComplete(handler: Handler): void {
        if (handler) {
            handler.runWith(true);
        }
    }
}

