import { SoundChannel } from "./SoundChannel";
import { Event } from "../events/Event"
import { AudioSound } from "./h5audio/AudioSound"
import { WebAudioSound } from "./webaudio/WebAudioSound"
import { URL } from "../net/URL"
import { Handler } from "../utils/Handler"
import { Sound } from "./Sound";
import { ILaya } from "../../ILaya";
import { Browser } from "../utils/Browser";
import { LayaEnv } from "../../LayaEnv";

/**
 * @en The `SoundManager` is a sound management class. It provides control methods for playing background music and sound effects.
 * @en The engine has two default sound schemes: WebAudio and H5Audio.
 * @en For playing sound effects, WebAudio is prioritized. If WebAudio is not available, H5Audio is used. H5Audio may have compatibility issues on some devices (such as inability to mix sounds or playback delays).
 * @en For playing background music, H5Audio is used (using WebAudio would significantly increase memory usage and cause a delay as it needs to wait for the sound to load completely before playing).
 * @en It is recommended to use mp3 format for background music and wav or mp3 format for sound effects (if packaging as an app, only wav format can be used for sound effects).
 * @en For detailed tutorials and sound formats, please refer to: http://ldc2.layabox.com/doc/?nav=ch-as-1-7-0
 * @zh `SoundManager` 是一个声音管理类。提供了对背景音乐、音效的播放控制方法。
 * @zh 引擎默认有两套声音方案：WebAudio和H5Audio。
 * @zh 播放音效时，优先使用WebAudio播放声音，如果WebAudio不可用，则用H5Audio播放。H5Audio在部分机器上有兼容问题（比如不能混音，播放有延迟等）。
 * @zh 播放背景音乐时，则使用H5Audio播放（使用WebAudio会增加特别大的内存，并且要等加载完毕后才能播放，有延迟）。
 * @zh 建议背景音乐用mp3类型，音效用wav或者mp3类型（如果打包为app，音效只能用wav格式）。
 * @zh 详细教程及声音格式请参考：http://ldc2.layabox.com/doc/?nav=ch-as-1-7-0
 */
export class SoundManager {
    /**
     * @en Background music volume.
     * @zh 背景音乐音量。
     * @default 1
     */
    static musicVolume: number = 1;
    /**
     * @en Sound effect volume.
     * @zh 音效音量。
     * @default 1
     */
    static soundVolume: number = 1;
    /**
     * @en Sound playback rate.
     * @zh 声音播放速率。
     * @default 1
     */
    static playbackRate: number = 1;
    /**
     * @en Background music uses the Audio tag for playback.
     * @zh 背景音乐使用 Audio 标签播放。
     * @default true
     */
    private static _useAudioMusic: boolean = true;

    /**
     * @private
     * @en Indicates whether the audio is muted. The default is false.
     * @zh 是否静音，默认为 false。
     */
    private static _muted: boolean = false;

    /**
     * @private
     * @en Indicates whether sound effects are muted. The default is false.
     * @zh 是否音效静音，默认为 false。
     */
    private static _soundMuted: boolean = false;

    /**
     * @private
     * @en Indicates whether background music is muted. The default is false.
     * @zh 是否背景音乐静音，默认为 false。
     */
    private static _musicMuted: boolean = false;

    /**
     * @internal
     * @en The current background music URL.
     * @zh 当前背景音乐 URL。
     */
    static _bgMusic: string = null;

    /**
     * @private
     * @en The current background music channel.
     * @zh 当前背景音乐声道。
     */
    static _musicChannel: SoundChannel = null;

    /**
     * @private
     * @en The list of currently playing channels.
     * @zh 当前播放的 Channel 列表。
     */
    private static _channels: any[] = [];
    /**@private */
    private static _autoStopMusic: boolean;
    /**@private */
    private static _blurPaused: boolean = false;
    /**@private */
    private static _isActive: boolean = true;
    /**@internal */
    static _soundClass: new () => any;
    /**@internal */
    static _musicClass: new () => any;
    /**@private */
    private static _lastSoundUsedTimeDic: any = {};
    /**@private */
    private static _isCheckingDispose: boolean = false;
    /**@private */
    private static _soundCache: Record<string, Sound> = {};

    /**@internal */
    static __init__(): boolean {
        var win: any = ILaya.Browser.window;
        var supportWebAudio = win["AudioContext"] || win["webkitAudioContext"] || win["mozAudioContext"] ? true : false;
        if (supportWebAudio)
            WebAudioSound.initWebAudio();
        SoundManager._soundClass = supportWebAudio ? WebAudioSound : AudioSound;

        if (!Browser.onTBMiniGame) {
            AudioSound._initMusicAudio();
        }
        SoundManager._musicClass = AudioSound;

        return supportWebAudio;
    }

    /**
     * @en Automatically delete sound effects after playing.
     * @zh 音效播放后自动删除。
     * @default true
     */
    static autoReleaseSound: boolean = true;

    /**
     * @en Add a playing sound instance.
     * @param channel The `SoundChannel` object.
     * @zh 添加播放的声音实例。
     * @param channel `SoundChannel` 对象。
     */
    static addChannel(channel: SoundChannel): void {
        if (SoundManager._channels.indexOf(channel) >= 0) return;
        SoundManager._channels.push(channel);
    }

    /**
     * @en Remove a playing sound instance.
     * @param channel The `SoundChannel` object.
     * @zh 移除播放的声音实例。
     * @param channel `SoundChannel` 对象。
     */
    static removeChannel(channel: SoundChannel): void {
        for (let i = SoundManager._channels.length - 1; i >= 0; i--) {
            if (SoundManager._channels[i] == channel) {
                SoundManager._channels.splice(i, 1);
            }
        }
    }

    /**@private */
    static disposeSoundLater(url: string): void {
        SoundManager._lastSoundUsedTimeDic[url] = ILaya.Browser.now();
        if (!SoundManager._isCheckingDispose) {
            SoundManager._isCheckingDispose = true;
            ILaya.timer.loop(5000, null, SoundManager._checkDisposeSound);
        }
    }

    /**@private */
    private static _checkDisposeSound(): void {
        let tTime: number = ILaya.Browser.now();
        let hasCheck: boolean = false;
        for (let key in SoundManager._lastSoundUsedTimeDic) {
            if (tTime - SoundManager._lastSoundUsedTimeDic[key] > 30000) {
                delete SoundManager._lastSoundUsedTimeDic[key];
                SoundManager.disposeSoundIfNotUsed(key);
            } else {
                hasCheck = true;
            }
        }
        if (!hasCheck) {
            SoundManager._isCheckingDispose = false;
            ILaya.timer.clear(null, SoundManager._checkDisposeSound);
        }
    }

    /**@private */
    static disposeSoundIfNotUsed(url: string): void {
        for (let i = SoundManager._channels.length - 1; i >= 0; i--) {
            if (SoundManager._channels[i].url == url) {
                return;
            }
        }
        SoundManager.destroySound(url);
    }

    /**
     * @en Whether to automatically stop background music when losing focus.
     * @zh 失去焦点后是否自动停止背景音乐。
     */
    static get autoStopMusic(): boolean {
        return SoundManager._autoStopMusic;
    }

    static set autoStopMusic(v: boolean) {
        ILaya.stage.off(Event.BLUR, null, SoundManager._stageOnBlur);
        ILaya.stage.off(Event.FOCUS, null, SoundManager._stageOnFocus);
        ILaya.stage.off(Event.VISIBILITY_CHANGE, null, SoundManager._visibilityChange);
        SoundManager._autoStopMusic = v;
        if (v) {
            ILaya.stage.on(Event.BLUR, null, SoundManager._stageOnBlur);
            ILaya.stage.on(Event.FOCUS, null, SoundManager._stageOnFocus);
            ILaya.stage.on(Event.VISIBILITY_CHANGE, null, SoundManager._visibilityChange);
        }
    }


    private static _visibilityChange(): void {
        if (ILaya.stage.isVisibility) {
            SoundManager._stageOnFocus();
        } else {
            SoundManager._stageOnBlur();
        }
    }

    private static _stageOnBlur(): void {
        SoundManager._isActive = false;
        if (SoundManager._musicChannel) {
            if (!SoundManager._musicChannel.isStopped) {
                SoundManager._blurPaused = true;
                SoundManager._musicChannel.pause();

            }

        }
        SoundManager.stopAllSound();
        ILaya.stage.once(Event.MOUSE_DOWN, null, SoundManager._stageOnFocus);
    }

    private static _recoverWebAudio(): void {
        if (WebAudioSound.ctx && WebAudioSound.ctx.state != "running" && WebAudioSound.ctx.resume)
            WebAudioSound.ctx.resume();
    }

    private static _stageOnFocus(): void {
        SoundManager._isActive = true;
        SoundManager._recoverWebAudio();
        ILaya.stage.off(Event.MOUSE_DOWN, null, SoundManager._stageOnFocus);
        if (SoundManager._blurPaused) {
            if (SoundManager._musicChannel && SoundManager._musicChannel.isStopped) {
                SoundManager._blurPaused = false;
                SoundManager._musicChannel.resume();
            }
        }
    }

    /**
     * @en Whether background music and all sound effects are muted.
     * @zh 背景音乐和所有音效是否静音。
     */
    static get muted(): boolean {
        return SoundManager._muted;
    }

    static set muted(value: boolean) {
        if (value == SoundManager._muted) return;
        if (value) {
            SoundManager.stopAllSound();
        }
        SoundManager.musicMuted = value;
        SoundManager._muted = value;
    }

    /**
     * @en Whether all sound effects (excluding background music) are muted.
     * @zh 所有音效（不包括背景音乐）是否静音。
     */
    static get soundMuted(): boolean {
        return SoundManager._soundMuted;
    }

    static set soundMuted(value: boolean) {
        SoundManager._soundMuted = value;
    }

    /**
     * @en Whether background music (excluding sound effects) is muted.
     * @zh 背景音乐（不包括音效）是否静音。
     */
    static get musicMuted(): boolean {
        return SoundManager._musicMuted;
    }

    static set musicMuted(value: boolean) {
        if (value == SoundManager._musicMuted) return;
        if (value) {
            if (SoundManager._bgMusic) {
                if (SoundManager._musicChannel && !SoundManager._musicChannel.isStopped) {
                    if (LayaEnv.isConch) {
                        if ((SoundManager._musicChannel as any)._audio) (SoundManager._musicChannel as any)._audio.muted = true;;
                    }
                    else {
                        SoundManager._musicChannel.pause();
                    }
                } else {
                    SoundManager._musicChannel = null;
                }
            } else {
                SoundManager._musicChannel = null;
            }

            SoundManager._musicMuted = value;
        } else {
            SoundManager._musicMuted = value;
            if (SoundManager._bgMusic) {
                if (SoundManager._musicChannel) {
                    if (LayaEnv.isConch) {
                        if ((SoundManager._musicChannel as any)._audio) (SoundManager._musicChannel as any)._audio.muted = false;;
                    }
                    else {
                        SoundManager._musicChannel.resume();
                    }
                }
            }
        }

    }

    /**
     * @en Determines whether background music is played using the Audio tag.
     * @zh 背景音乐是否使用Audio标签播放。
     */
    static get useAudioMusic(): boolean {
        return SoundManager._useAudioMusic;
    }

    static set useAudioMusic(value: boolean) {
        SoundManager._useAudioMusic = value;
        if (value) {
            SoundManager._musicClass = AudioSound;
        } else {
            SoundManager._musicClass = null;
        }
    }

    /**
     * @en Play a sound effect. Multiple sound effects can be played simultaneously.
     * @param url The URL of the sound file.
     * @param loops The number of times to loop the sound. 0 means infinite loop.
     * @param complete The callback function when the sound playback is complete. It should be a Handler object.
     * @param soundClass The sound class to use for playback. If null, it will be automatically selected.
     * @param startTime The start time of the sound playback.
     * @returns A SoundChannel object, through which you can control the sound and get sound information.
     * @zh 播放音效。音效可以同时播放多个。
     * @param url 声音文件地址。
     * @param loops 循环次数，0表示无限循环。
     * @param complete 声音播放完成回调，应为Handler对象。
     * @param soundClass 使用哪个声音类进行播放，null表示自动选择。
     * @param startTime 声音播放起始时间。
     * @returns SoundChannel对象，通过此对象可以对声音进行控制，以及获取声音信息。
     */
    static playSound(url: string, loops: number = 1, complete: Handler = null, soundClass: new () => any = null, startTime: number = 0): SoundChannel {
        if (!SoundManager._isActive || !url) return null;
        if (SoundManager._muted) return null;
        SoundManager._recoverWebAudio();
        if (url == SoundManager._bgMusic) {
            if (SoundManager._musicMuted) return null;
        } else {
            if (SoundManager._soundMuted) return null;
        }
        let tSound: Sound;
        if (!Browser._isMiniGame) {
            tSound = SoundManager._soundCache[url];
        }
        if (!soundClass) soundClass = SoundManager._soundClass;
        if (!tSound) {
            tSound = new soundClass();
            tSound.load(url);
            if (!Browser._isMiniGame) {
                SoundManager._soundCache[url] = tSound;
            }
        }
        let channel = tSound.play(startTime, loops);
        if (!channel) return null;
        channel.url = url;
        channel.volume = (url == SoundManager._bgMusic) ? SoundManager.musicVolume : SoundManager.soundVolume;
        channel.completeHandler = complete;
        return channel;
    }

    /**
     * @en Release sound resources.
     * @param url The URL of the sound file to be released.
     * @zh 释放声音资源。
     * @param url 要释放的声音文件地址。
     */
    static destroySound(url: string): void {
        let tSound = SoundManager._soundCache[url];
        if (tSound) {
            delete SoundManager._soundCache[url];
            tSound.dispose();
        }
    }

    /**
     * @en Play background music. Only one background music can be played at a time. If this method is called while background music is already playing, the previous music will be stopped before playing the current one.
     * @param url The URL of the sound file.
     * @param loops The number of times to loop the music. 0 means infinite loop.
     * @param complete The callback function when the music playback is complete. The result parameter is true if playback is completed, false/undefined if triggered by stop.
     * @param startTime The start time of the music playback.
     * @returns A SoundChannel object, through which you can control the sound and get sound information.
     * @zh 播放背景音乐。背景音乐同时只能播放一个，如果在播放背景音乐时再次调用本方法，会先停止之前的背景音乐，再播放当前的背景音乐。
     * @param url 声音文件地址。
     * @param loops 循环次数，0表示无限循环。
     * @param complete 声音播放完成回调，complete 结果参数 true: 播放完成, false/undefined：stop触发的complete。
     * @param startTime 声音播放起始时间。
     * @returns SoundChannel对象，通过此对象可以对声音进行控制，以及获取声音信息。
     */
    static playMusic(url: string, loops: number = 0, complete: Handler = null, startTime: number = 0): SoundChannel {
        SoundManager._bgMusic = url;
        if (SoundManager._musicChannel) SoundManager._musicChannel.stop();
        return SoundManager._musicChannel = SoundManager.playSound(url, loops, complete, SoundManager._musicClass, startTime);
    }

    /**
     * @en Stop playing a specific sound. This method can stop the playback of any sound (including background music and sound effects) by providing the corresponding sound file address.
     * @param url The URL of the sound file.
     * @zh 停止声音播放。此方法能够停止任意声音的播放（包括背景音乐和音效），只需传入对应的声音播放地址。
     * @param url 声音文件地址。
     */
    static stopSound(url: string): void {
        for (let i = SoundManager._channels.length - 1; i >= 0; i--) {
            let channel = SoundManager._channels[i];
            if (channel.url == url) {
                channel.stop();
            }
        }
    }

    /**
     * @en Stop playing all sounds (including background music and sound effects).
     * @zh 停止播放所有声音（包括背景音乐和音效）。
     */
    static stopAll(): void {
        SoundManager._bgMusic = null;
        var i: number;
        var channel: SoundChannel;
        for (i = SoundManager._channels.length - 1; i >= 0; i--) {
            channel = SoundManager._channels[i];
            channel.stop();
        }
    }

    /**
     * @en Stop playing all sound effects (excluding background music).
     * @zh 停止播放所有音效（不包括背景音乐）。
     */
    static stopAllSound(): void {
        for (let i = SoundManager._channels.length - 1; i >= 0; i--) {
            let channel = SoundManager._channels[i];
            if (channel.url != SoundManager._bgMusic) {
                channel.stop();
            }
        }
    }

    /**
     * @en Stop playing background music (excluding sound effects).
     * @zh 停止播放背景音乐（不包括音效）。
     */
    static stopMusic(): void {
        if (SoundManager._musicChannel) SoundManager._musicChannel.stop();
        SoundManager._bgMusic = null;
    }

    /**
     * @en Set the volume of sounds. Depending on the parameters, it can set the volume for a specific sound (background music or sound effect) or all sound effects (excluding background music).
     * @param volume The volume. Initial value is 1. Volume range is from 0 (mute) to 1 (maximum volume).
     * @param url (default = null) The URL of the sound file. If null, it sets the volume for all sound effects (excluding background music). If not null, it sets the volume for the specified sound (background music or sound effect).
     * @zh 设置声音音量。根据参数不同，可以分别设置指定声音（背景音乐或音效）音量或者所有音效（不包括背景音乐）音量。
     * @param volume 音量。初始值为1。音量范围从 0（静音）至 1（最大音量）。
     * @param url (默认为 null) 声音播放地址。为空表示设置所有音效（不包括背景音乐）的音量，不为空表示设置指定声音（背景音乐或音效）的音量。
     */
    static setSoundVolume(volume: number, url: string = null): void {
        if (url) {
            SoundManager._setVolume(url, volume);
        } else {
            SoundManager.soundVolume = volume;
            for (let i = SoundManager._channels.length - 1; i >= 0; i--) {
                let channel = SoundManager._channels[i];
                if (channel.url != SoundManager._bgMusic) {
                    channel.volume = volume;
                }
            }
        }
    }

    /**
     * @en Set the volume of background music. Volume range is from 0 (mute) to 1 (maximum volume).
     * @param volume The volume. Initial value is 1. Volume range is from 0 (mute) to 1 (maximum volume).
     * @zh 设置背景音乐音量。音量范围从 0（静音）至 1（最大音量）。
     * @param volume 音量。初始值为1。音量范围从 0（静音）至 1（最大音量）。
     */
    static setMusicVolume(volume: number): void {
        SoundManager.musicVolume = volume;
        SoundManager._setVolume(SoundManager._bgMusic, volume);
    }

    /**
     * @en Set the volume for a specified sound.
     * @param url The URL of the sound file.
     * @param volume The volume level, with an initial value of 1.
     * @zh 设置指定声音的音量。
     * @param url 声音文件 URL。
     * @param volume 音量。初始值为 1。
     */
    private static _setVolume(url: string, volume: number): void {
        for (let i = SoundManager._channels.length - 1; i >= 0; i--) {
            let channel = SoundManager._channels[i];
            if (channel.url == url) {
                channel.volume = volume;
            }
        }
    }
}

