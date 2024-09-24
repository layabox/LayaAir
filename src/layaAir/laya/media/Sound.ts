import { SoundChannel } from "./SoundChannel";
import { EventDispatcher } from "../events/EventDispatcher"

/**
 * @en `Sound` is an abstract base class for controlling sound.
 * @zh `Sound`是播放控制声音的抽象基类。
 */
export class Sound extends EventDispatcher {

    /**
     * @en Load the sound.
     * @param url The URL of the sound file.
     * @zh 加载声音。
     * @param url 声音文件的地址。
     */
    load(url: string): void {

    }

    /**
     * @en Play the sound.
     * @param startTime The start time in seconds.
     * @param loops The number of times to loop the sound. 0 means loop indefinitely.
     * @returns A SoundChannel object representing the sound channel.
     * @zh 播放声音。
     * @param startTime 开始时间，单位为秒。
     * @param loops 循环次数，0表示一直循环。
     * @returns 声道 SoundChannel 对象。
     */
    play(startTime: number = 0, loops: number = 0): SoundChannel {
        return null;
    }

    /**
     * @en The total duration of the sound in seconds.
     * @zh 声音的总时间，以秒为单位。
     */
    get duration(): number {
        return 0;
    }

    /**
     * @en Release the sound resources.
     * @zh 释放声音资源。
     */
    dispose(): void {

    }
}

