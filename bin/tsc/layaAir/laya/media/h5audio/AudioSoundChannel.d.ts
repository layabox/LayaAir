import { SoundChannel } from "../SoundChannel";
/**
 * @private
 * audio标签播放声音的音轨控制
 */
export declare class AudioSoundChannel extends SoundChannel {
    /**
     * 播放用的audio标签
     */
    private _audio;
    private _onEnd;
    private _resumePlay;
    constructor(audio: HTMLAudioElement);
    private __onEnd;
    private __resumePlay;
    /**
     * 播放
     */
    play(): void;
    /**
     * 当前播放到的位置
     * @return
     *
     */
    readonly position: number;
    /**
     * 获取总时间。
     */
    readonly duration: number;
    /**
     * 停止播放
     *
     */
    stop(): void;
    pause(): void;
    resume(): void;
    /**
     * 设置音量
     * @param v
     *
     */
    /**
    * 获取音量
    * @return
    *
    */
    /*override*/ volume: number;
}
