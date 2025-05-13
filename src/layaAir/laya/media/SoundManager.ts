import type { SoundChannel } from "./SoundChannel";
import { Event } from "../events/Event";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { PAL } from "../platform/PlatformAdapters";
import { MathUtil } from "../maths/MathUtil";

/**
 * @en The `SoundManager` is a sound management class. It provides control methods for playing background music and sound effects.
 * - The engine has two default sound schemes: WebAudio and H5Audio.
 * - For playing sound effects, WebAudio is prioritized. If WebAudio is not available, H5Audio is used. H5Audio may have compatibility issues on some devices (such as inability to mix sounds or playback delays).
 * - For playing background music, H5Audio is used (using WebAudio would significantly increase memory usage and cause a delay as it needs to wait for the sound to load completely before playing).
 * - It is recommended to use mp3 format for background music and wav or mp3 format for sound effects (if packaging as an app, only wav format can be used for sound effects).
 * @zh `SoundManager` 是一个声音管理类。提供了对背景音乐、音效的播放控制方法。
 * - 引擎默认有两套声音方案：WebAudio和H5Audio。
 * - 播放音效时，优先使用WebAudio播放声音，如果WebAudio不可用，则用H5Audio播放。H5Audio在部分机器上有兼容问题（比如不能混音，播放有延迟等）。
 * - 播放背景音乐时，则使用H5Audio播放（使用WebAudio会增加特别大的内存，并且要等加载完毕后才能播放，有延迟）。
 * - 建议背景音乐用mp3类型，音效用wav或者mp3类型（如果打包为app，音效只能用wav格式）。
 */
export class SoundManager {
    /**
     * @en Sound playback rate. default value is 1.
     * @zh 声音播放速率。默认值为1。
     */
    static playbackRate: number = 1;
    /**
     * @en Determines whether background music is played using the Audio tag.
     * @zh 背景音乐是否使用Audio标签播放。
     */
    static useAudioMusic: boolean = true;

    /**
     * @en Whether to automatically stop background music when losing focus.
     * @zh 失去焦点后是否自动停止背景音乐。
     */
    static autoStopMusic: boolean = true;

    /**@internal */
    static __init__() {
        ILaya.stage.on(Event.BLUR, () => {
            if (mgr.autoStopMusic && mgr._musicChannel && !mgr._musicChannel.paused)
                PAL.media.resumeUntilGotFocus(mgr._musicChannel);
        });
    }

    private static _muted: boolean = false;
    private static _soundMuted: boolean = false;
    private static _musicMuted: boolean = false;
    private static _musicVolume: number = 1;
    private static _soundVolume: number = 1;
    private static _musicChannel: SoundChannel = null;
    private static _channels: Set<SoundChannel> = new Set();

    /**
     * @en Background music volume. default value is 1.
     * @zh 背景音乐音量。默认值为1。
     */
    static get musicVolume(): number {
        return mgr._musicVolume;
    }

    static set musicVolume(value: number) {
        value = MathUtil.clamp(value, 0, 1);
        if (value !== mgr._musicVolume) {
            mgr._musicVolume = value;
            if (mgr._musicChannel)
                mgr._musicChannel.volume = mgr._musicChannel.volume;
        }
    }

    /**
     * @en Sound effect volume. default value is 1.
     * @zh 音效音量。默认值为1。
     */
    static get soundVolume(): number {
        return mgr._soundVolume;
    }

    static set soundVolume(value: number) {
        value = MathUtil.clamp(value, 0, 1);
        if (value !== mgr._soundVolume) {
            mgr._soundVolume = value;
            for (let channel of mgr._channels) {
                if (channel !== mgr._musicChannel) {
                    channel.volume = channel.volume;
                }
            }
        }
    }

    /**
     * @en Whether background music and all sound effects are muted.
     * @zh 背景音乐和所有音效是否静音。
     */
    static get muted(): boolean {
        return mgr._muted;
    }

    static set muted(value: boolean) {
        value = !!value;
        if (value !== mgr._muted) {
            mgr._muted = value;
            this.updateMutedStatus();
        }
    }

    /**
     * @en Whether all sound effects (excluding background music) are muted.
     * @zh 所有音效（不包括背景音乐）是否静音。
     */
    static get soundMuted(): boolean {
        return mgr._soundMuted;
    }

    static set soundMuted(value: boolean) {
        value = !!value;
        if (value !== mgr._soundMuted) {
            mgr._soundMuted = value;
            this.updateMutedStatus();
        }
    }

    /**
     * @en Whether background music (excluding sound effects) is muted.
     * @zh 背景音乐（不包括音效）是否静音。
     */
    static get musicMuted(): boolean {
        return mgr._musicMuted;
    }

    static set musicMuted(value: boolean) {
        value = !!value;
        if (value !== mgr._musicMuted) {
            mgr._musicMuted = value;
            this.updateMutedStatus();
        }
    }

    /**
     * @en Play a sound effect. Multiple sound effects can be played simultaneously.
     * @param url The URL of the sound file.
     * @param loops The number of times to loop the sound. 0 means infinite loop.
     * @param complete The callback function when the sound playback is complete. It should be a Handler object.
     * @param startTime The start time of the sound playback. In seconds.
     * @returns A SoundChannel object, through which you can control the sound and get sound information.
     * @zh 播放音效。音效可以同时播放多个。
     * @param url 声音文件地址。
     * @param loops 循环次数，0表示无限循环。
     * @param complete 声音播放完成回调，应为Handler对象。
     * @param startTime 声音播放起始时间。以秒为单位。
     * @returns SoundChannel对象，通过此对象可以对声音进行控制，以及获取声音信息。
     */
    static playSound(url: string, loops?: number, complete?: Handler | (() => void), startTime?: number): SoundChannel;
    /**
     * @deprecated
     */
    static playSound(url: string, loops?: number, complete?: Handler | (() => void), soundClass?: new () => any, startTime?: number): SoundChannel;
    static playSound(url: string, loops?: number, complete?: Handler | (() => void), soundClass?: (new () => any) | number, startTime?: number): SoundChannel {
        if (!url)
            return null;

        if (typeof (soundClass) === 'number')
            startTime = soundClass;

        let channel = PAL.media.createSoundChannel(url, false);
        channel.loops = loops ?? 1;
        channel.startTime = startTime ?? 0;
        channel.playbackRate = this.playbackRate;
        channel.volume = 1;
        channel.muted = mgr._soundMuted || mgr._muted;
        channel.completeHandler = complete;
        channel._isMusic = false;
        channel.play();
        return channel;
    }

    /**
     * @en Play background music. Only one background music can be played at a time. If this method is called while background music is already playing, the previous music will be stopped before playing the current one.
     * @param url The URL of the sound file.
     * @param loops The number of times to loop the music. 0 means infinite loop. Default is 1.
     * @param complete The callback function when the music playback is complete. The result parameter is true if playback is completed, false/undefined if triggered by stop.
     * @param startTime The start time of the music playback. In seconds.
     * @returns A SoundChannel object, through which you can control the sound and get sound information.
     * @zh 播放背景音乐。背景音乐同时只能播放一个，如果在播放背景音乐时再次调用本方法，会先停止之前的背景音乐，再播放当前的背景音乐。
     * @param url 声音文件地址。
     * @param loops 循环次数，0表示无限循环。默认为1。
     * @param complete 声音播放完成回调，complete 结果参数 true: 播放完成, false/undefined：stop触发的complete。
     * @param startTime 声音播放起始时间。以秒为单位。
     * @returns SoundChannel对象，通过此对象可以对声音进行控制，以及获取声音信息。
     */
    static playMusic(url: string, loops?: number, complete?: Handler | ((success: boolean) => void), startTime?: number): SoundChannel {
        if (mgr._musicChannel) {
            mgr._musicChannel.stop();
            mgr._musicChannel = null;
        }

        if (!url)
            return null;

        let channel = PAL.media.createSoundChannel(url, mgr.useAudioMusic);
        channel.loops = loops ?? 1;
        channel.startTime = startTime ?? 0;
        channel.playbackRate = this.playbackRate;
        channel.volume = 1;
        channel.muted = mgr._musicMuted || mgr._muted;
        channel.completeHandler = complete;
        channel._isMusic = true;
        channel.play();
        return channel;
    }

    /**
     * @en Stop playing a specific sound. This method can stop the playback of any sound (including background music and sound effects) by providing the corresponding sound file address.
     * @param url The URL of the sound file.
     * @zh 停止声音播放。此方法能够停止任意声音的播放（包括背景音乐和音效），只需传入对应的声音播放地址。
     * @param url 声音文件地址。
     */
    static stopSound(url: string): void {
        for (let channel of mgr._channels) {
            if (channel.url == url) {
                channel.stop();
                if (channel === mgr._musicChannel) {
                    mgr._musicChannel = null;
                }
            }
        }
    }

    /**
     * @en Stop playing all sounds (including background music and sound effects).
     * @zh 停止播放所有声音（包括背景音乐和音效）。
     */
    static stopAll(): void {
        mgr._musicChannel = null;
        for (let channel of mgr._channels)
            channel.stop();
    }

    /**
     * @en Stop playing all sound effects (excluding background music).
     * @zh 停止播放所有音效（不包括背景音乐）。
     */
    static stopAllSound(): void {
        for (let channel of mgr._channels) {
            if (channel !== mgr._musicChannel) {
                channel.stop();
            }
        }
    }

    /**
     * @en Stop playing background music (excluding sound effects).
     * @zh 停止播放背景音乐（不包括音效）。
     */
    static stopMusic(): void {
        if (mgr._musicChannel)
            mgr._musicChannel.stop();
        mgr._musicChannel = null;
    }

    /**
     * @deprecated Use SoundManager.soundVolume instead.
     */
    static setSoundVolume(volume: number, url?: string): void {
        if (url) {
            let channel = this.findChannel(url);
            if (channel)
                channel.volume = volume;
        } else {
            this.soundVolume = volume;
        }
    }

    /**
     * @deprecated Use SoundManager.musicVolume instead.
     */
    static setMusicVolume(volume: number): void {
        this.musicVolume = volume;
    }

    /**
     * @en Find a sound channel by its URL.
     * @param url The URL of the sound file.
     * @returns The SoundChannel object corresponding to the URL, or null if not found.
     * @zh 通过声音地址查找声音通道。
     * @param url 声音文件地址。
     * @returns 对应声音地址的SoundChannel对象，如果没有找到则返回null。 
     */
    static findChannel(url: string): SoundChannel | null {
        for (let channel of mgr._channels) {
            if (channel.url == url) {
                return channel;
            }
        }
        return null;
    }

    private static updateMutedStatus(): void {
        let s = mgr._muted || mgr._soundMuted;
        let m = mgr._muted || mgr._musicMuted;
        for (let channel of mgr._channels) {
            if (channel === mgr._musicChannel)
                channel.muted = m;
            else
                channel.muted = s;
        }
    }

    /** @internal */
    static addChannel(channel: SoundChannel): void {
        mgr._channels.add(channel);
        if (channel._isMusic)
            mgr._musicChannel = channel;
    }

    /** @internal */
    static removeChannel(channel: SoundChannel): void {
        mgr._channels.delete(channel);
        if (channel === mgr._musicChannel)
            mgr._musicChannel = null;
    }
}

//后者太长了
const mgr = SoundManager;