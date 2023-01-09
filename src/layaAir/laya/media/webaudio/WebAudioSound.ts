import { WebAudioSoundChannel } from "./WebAudioSoundChannel";
import { Event } from "../../events/Event"
import { EventDispatcher } from "../../events/EventDispatcher"
import { SoundChannel } from "../SoundChannel"
import { SoundManager } from "../SoundManager";
import { ILaya } from "../../../ILaya";
import { Loader } from "../../net/Loader";

/**
 * @private
 * web audio api方式播放声音
 */
export class WebAudioSound extends EventDispatcher {

    /**
     * 播放设备
     */
    static ctx: AudioContext;

    /**
     * 用于播放解锁声音以及解决Ios9版本的内存释放
     */
    static _miniBuffer: any = WebAudioSound.ctx ? WebAudioSound.ctx.createBuffer(1, 1, 22050) : undefined;

    /**
     * 是否已解锁声音播放
     */
    private static _unlocked: boolean = false;

    /**
     * 声音URL
     */
    url: string;
    /**
     * 是否已加载完成
     */
    loaded: boolean = false;
    /**
     * 声音原始文件数据
     */
    audioBuffer: AudioBuffer;
    /**
     * 待播放的声音列表
     */
    private __toPlays: any[];
    /**
     * @private
     */
    private _disposed: boolean = false;


    /**
     * 播放声音以解锁IOS的声音
     *
     */
    private static _playEmptySound(): void {
        if (WebAudioSound.ctx == null) {
            return;
        }
        var source: any = WebAudioSound.ctx.createBufferSource();
        source.buffer = WebAudioSound._miniBuffer;
        source.connect(WebAudioSound.ctx.destination);
        source.start(0, 0, 0);
    }

    /**
     * 尝试解锁声音
     *
     */
    private static _unlock(): void {
        if (WebAudioSound._unlocked) {
            return;
        }
        WebAudioSound._playEmptySound();
        if (WebAudioSound.ctx.state == "running") {
            window.document.removeEventListener("mousedown", WebAudioSound._unlock, true);
            window.document.removeEventListener("touchend", WebAudioSound._unlock, true);
            window.document.removeEventListener("touchstart", WebAudioSound._unlock, true);
            WebAudioSound._unlocked = true;
        }
    }
    /*;*/

    static initWebAudio(): void {
        WebAudioSound.ctx = new (window["AudioContext"] || (window as any)["webkitAudioContext"] || (window as any)["mozAudioContext"])();

        if (WebAudioSound.ctx.state != "running") {
            WebAudioSound._unlock(); // When played inside of a touch event, this will enable audio on iOS immediately.
            window.document.addEventListener("mousedown", WebAudioSound._unlock, true);
            window.document.addEventListener("touchend", WebAudioSound._unlock, true);
            window.document.addEventListener("touchstart", WebAudioSound._unlock, true);
        }
    }

    /**
     * 加载声音
     * @param url
     *
     */
    load(url: string): void {
        this.url = url;
        this.audioBuffer = ILaya.loader.getRes(url);
        if (this.audioBuffer) {
            this._loaded(this.audioBuffer);
            return;
        }
        ILaya.loader.load(url, Loader.SOUND).then(audioBuffer => this._loaded(audioBuffer));
    }

    private _loaded(audioBuffer: any): void {
        if (this._disposed)
            return;

        this.audioBuffer = audioBuffer;
        this.loaded = true;
        this.event(Event.COMPLETE);
    }

    private __playAfterLoaded(): void {
        if (!this.__toPlays) return;
        var i: number, len: number;
        var toPlays: any[];
        toPlays = this.__toPlays;
        len = toPlays.length;
        var tParams: any[];
        for (i = 0; i < len; i++) {
            tParams = toPlays[i];
            if (tParams[2] && !((<WebAudioSoundChannel>tParams[2])).isStopped) {
                this.play(tParams[0], tParams[1], tParams[2]);
            }
        }
        this.__toPlays.length = 0;
    }

    /**
     * 播放声音
     * @param startTime 起始时间
     * @param loops 循环次数
     * @return
     *
     */
    play(startTime: number = 0, loops: number = 0, channel: WebAudioSoundChannel = null): SoundChannel {
        channel = channel ? channel : new WebAudioSoundChannel();
        if (!this.audioBuffer) {
            if (this.url) {
                if (!this.__toPlays) this.__toPlays = [];
                this.__toPlays.push([startTime, loops, channel]);
                this.once(Event.COMPLETE, this, this.__playAfterLoaded);
                this.load(this.url);
            }
        }
        channel.url = this.url;
        channel.loops = loops;
        channel.audioBuffer = this.audioBuffer;
        channel.startTime = startTime;
        channel.play();
        SoundManager.addChannel(channel);
        return channel;
    }

    get duration(): number {
        if (this.audioBuffer) {
            return this.audioBuffer.duration;
        }
        return 0;
    }

    dispose(): void {
        this._disposed = true;
        if (this.audioBuffer) {
            ILaya.loader.clearRes(this.url, this.audioBuffer);
            this.audioBuffer = null;
        }
        this.__toPlays = [];
    }
}


