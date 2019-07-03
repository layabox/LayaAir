import { EventDispatcher } from "../../events/EventDispatcher";
import { SoundChannel } from "../SoundChannel";
/**
 * @private
 * 使用Audio标签播放声音
 */
export declare class AudioSound extends EventDispatcher {
    /**@private */
    private static _audioCache;
    /**
     * 声音URL
     */
    url: string;
    /**
     * 播放用的audio标签
     */
    audio: HTMLAudioElement;
    /**
     * 是否已加载完成
     */
    loaded: boolean;
    /**
     * 释放声音
     *
     */
    dispose(): void;
    /**@private */
    private static _makeMusicOK;
    /**
     * 加载声音
     * @param url
     *
     */
    load(url: string): void;
    /**
     * 播放声音
     * @param startTime 起始时间
     * @param loops 循环次数
     * @return
     *
     */
    play(startTime?: number, loops?: number): SoundChannel;
    /**
     * 获取总时间。
     */
    readonly duration: number;
}
