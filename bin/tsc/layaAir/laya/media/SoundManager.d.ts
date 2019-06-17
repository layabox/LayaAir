import { SoundChannel } from "././SoundChannel";
import { Handler } from "../utils/Handler";
/**
 * <code>SoundManager</code> 是一个声音管理类。提供了对背景音乐、音效的播放控制方法。
 * 引擎默认有两套声音方案：WebAudio和H5Audio
 * 播放音效，优先使用WebAudio播放声音，如果WebAudio不可用，则用H5Audio播放，H5Audio在部分机器上有兼容问题（比如不能混音，播放有延迟等）。
 * 播放背景音乐，则使用H5Audio播放（使用WebAudio会增加特别大的内存，并且要等加载完毕后才能播放，有延迟）
 * 建议背景音乐用mp3类型，音效用wav或者mp3类型（如果打包为app，音效只能用wav格式）。
 * 详细教程及声音格式请参考：http://ldc2.layabox.com/doc/?nav=ch-as-1-7-0
 */
export declare class SoundManager {
    /**
     * 背景音乐音量。
     * @default 1
     */
    static musicVolume: number;
    /**
     * 音效音量。
     * @default 1
     */
    static soundVolume: number;
    /**
     * 声音播放速率。
     * @default 1
     */
    static playbackRate: number;
    /**
     * 背景音乐使用Audio标签播放。
     * @default true
     */
    private static _useAudioMusic;
    /**@private 是否静音，默认为false。*/
    private static _muted;
    /**@private 是否音效静音，默认为false。*/
    private static _soundMuted;
    /**@private 是否背景音乐静音，默认为false。*/
    private static _musicMuted;
    /**@private 当前背景音乐url。*/
    static _bgMusic: string;
    /**@private 当前背景音乐声道。*/
    private static _musicChannel;
    /**@private 当前播放的Channel列表。*/
    private static _channels;
    /**@private */
    private static _autoStopMusic;
    /**@private */
    private static _blurPaused;
    /**@private */
    private static _isActive;
    /**@private */
    static _soundClass: new () => any;
    /**@private */
    static _musicClass: new () => any;
    /**@private */
    private static _lastSoundUsedTimeDic;
    /**@private */
    private static _isCheckingDispose;
    /**@private */
    static __init__(): boolean;
    /**
     * 音效播放后自动删除。
     * @default true
     */
    static autoReleaseSound: boolean;
    /**
     * 添加播放的声音实例。
     * @param channel <code>SoundChannel</code> 对象。
     */
    static addChannel(channel: SoundChannel): void;
    /**
     * 移除播放的声音实例。
     * @param channel <code>SoundChannel</code> 对象。
     */
    static removeChannel(channel: SoundChannel): void;
    /**@private */
    static disposeSoundLater(url: string): void;
    /**@private */
    private static _checkDisposeSound;
    /**@private */
    static disposeSoundIfNotUsed(url: string): void;
    /**
     * 失去焦点后是否自动停止背景音乐。
     * @param v Boolean 失去焦点后是否自动停止背景音乐。
     *
     */
    /**
    * 失去焦点后是否自动停止背景音乐。
    */
    static autoStopMusic: boolean;
    private static _visibilityChange;
    private static _stageOnBlur;
    private static _recoverWebAudio;
    private static _stageOnFocus;
    /**
     * 背景音乐和所有音效是否静音。
     */
    static muted: boolean;
    /**
     * 所有音效（不包括背景音乐）是否静音。
     */
    static soundMuted: boolean;
    /**
     * 背景音乐（不包括音效）是否静音。
     */
    static musicMuted: boolean;
    static useAudioMusic: boolean;
    /**
     * 播放音效。音效可以同时播放多个。
     * @param url			声音文件地址。
     * @param loops			循环次数,0表示无限循环。
     * @param complete		声音播放完成回调  Handler对象。
     * @param soundClass	使用哪个声音类进行播放，null表示自动选择。
     * @param startTime		声音播放起始时间。
     * @return SoundChannel对象，通过此对象可以对声音进行控制，以及获取声音信息。
     */
    static playSound(url: string, loops?: number, complete?: Handler, soundClass?: new () => any, startTime?: number): SoundChannel;
    /**
     * 释放声音资源。
     * @param url	声音播放地址。
     */
    static destroySound(url: string): void;
    /**
     * 播放背景音乐。背景音乐同时只能播放一个，如果在播放背景音乐时再次调用本方法，会先停止之前的背景音乐，再播发当前的背景音乐。
     * @param url		声音文件地址。
     * @param loops		循环次数,0表示无限循环。
     * @param complete	声音播放完成回调。
     * @param startTime	声音播放起始时间。
     * @return SoundChannel对象，通过此对象可以对声音进行控制，以及获取声音信息。
     */
    static playMusic(url: string, loops?: number, complete?: Handler, startTime?: number): SoundChannel;
    /**
     * 停止声音播放。此方法能够停止任意声音的播放（包括背景音乐和音效），只需传入对应的声音播放地址。
     * @param url  声音文件地址。
     */
    static stopSound(url: string): void;
    /**
     * 停止播放所有声音（包括背景音乐和音效）。
     */
    static stopAll(): void;
    /**
     * 停止播放所有音效（不包括背景音乐）。
     */
    static stopAllSound(): void;
    /**
     * 停止播放背景音乐（不包括音效）。
     * @param url  声音文件地址。
     */
    static stopMusic(): void;
    /**
     * 设置声音音量。根据参数不同，可以分别设置指定声音（背景音乐或音效）音量或者所有音效（不包括背景音乐）音量。
     * @param volume	音量。初始值为1。音量范围从 0（静音）至 1（最大音量）。
     * @param url		(default = null)声音播放地址。默认为null。为空表示设置所有音效（不包括背景音乐）的音量，不为空表示设置指定声音（背景音乐或音效）的音量。
     */
    static setSoundVolume(volume: number, url?: string): void;
    /**
     * 设置背景音乐音量。音量范围从 0（静音）至 1（最大音量）。
     * @param volume	音量。初始值为1。音量范围从 0（静音）至 1（最大音量）。
     */
    static setMusicVolume(volume: number): void;
    /**
     * 设置指定声音的音量。
     * @param url		声音文件url
     * @param volume	音量。初始值为1。
     */
    private static _setVolume;
}
