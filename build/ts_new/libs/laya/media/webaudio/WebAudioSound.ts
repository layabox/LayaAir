import { WebAudioSoundChannel } from "./WebAudioSoundChannel";
import { Event } from "../../events/Event"
import { EventDispatcher } from "../../events/EventDispatcher"
import { SoundChannel } from "../SoundChannel"
import { URL } from "../../net/URL"
import { ILaya } from "../../../ILaya";

/**
 * @private
 * web audio api方式播放声音
 */
export class WebAudioSound extends EventDispatcher {

    private static _dataCache: any = {};

    /**
     * 是否支持web audio api
     */
    static webAudioEnabled: boolean = window["AudioContext"] || (window as any)["webkitAudioContext"] || (window as any)["mozAudioContext"];

    /**
     * 播放设备
     */
    static ctx: any = WebAudioSound.webAudioEnabled ? new (window["AudioContext"] || (window as any)["webkitAudioContext"] || (window as any)["mozAudioContext"])() : undefined;

    /**
     * 当前要解码的声音文件列表
     */
    static buffs: any[] = [];

    /**
     * 是否在解码中
     */
    static isDecoding: boolean = false;

    /**
     * 用于播放解锁声音以及解决Ios9版本的内存释放
     */
    static _miniBuffer: any = WebAudioSound.ctx ? WebAudioSound.ctx.createBuffer(1, 1, 22050) : undefined;

    /**
     * 事件派发器，用于处理加载解码完成事件的广播
     */
    static e: EventDispatcher = new EventDispatcher();
    /**
     * 是否已解锁声音播放
     */
    private static _unlocked: boolean = false;
    /**
     * 当前解码的声音信息
     */
    static tInfo: any;

    private static __loadingSound: any = {};
    /**
     * 声音URL
     */
    url: string;
    /**
     * 是否已加载完成
     */
    loaded: boolean = false;

    /**
     * 声音文件数据
     */
    data: ArrayBuffer;
    /**
     * 声音原始文件数据
     */
    audioBuffer: any;
    /**
     * 待播放的声音列表
     */
    private __toPlays: any[];

    /**
     * @private
     */
    private _disposed: boolean = false;

    /**
     * 解码声音文件
     *
     */
    static decode(): void {
        if (WebAudioSound.buffs.length <= 0 || WebAudioSound.isDecoding) {
            return;
        }
        WebAudioSound.isDecoding = true;
        WebAudioSound.tInfo = WebAudioSound.buffs.shift();
        WebAudioSound.ctx.decodeAudioData(WebAudioSound.tInfo["buffer"], WebAudioSound._done, WebAudioSound._fail);
    }

    /**
     * 解码成功回调
     * @param audioBuffer
     *
     */
    private static _done(audioBuffer: any): void {
        WebAudioSound.e.event("loaded:" + WebAudioSound.tInfo.url, audioBuffer);
        WebAudioSound.isDecoding = false;
        WebAudioSound.decode();
    }

    /**
     * 解码失败回调
     * @return
     *
     */
    private static _fail(): void {
        WebAudioSound.e.event("err:" + WebAudioSound.tInfo.url, null);
        WebAudioSound.isDecoding = false;
        WebAudioSound.decode();
    }

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
        var me: WebAudioSound = this;
        url = URL.formatURL(url);
        this.url = url;

        this.audioBuffer = WebAudioSound._dataCache[url];
        if (this.audioBuffer) {
            this._loaded(this.audioBuffer);
            return;
        }
        WebAudioSound.e.on("loaded:" + url, this, this._loaded);
        WebAudioSound.e.on("err:" + url, this, this._err);
        if (WebAudioSound.__loadingSound[url]) {
            return;
        }
        WebAudioSound.__loadingSound[url] = true;

        var request: any = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = function (): void {
            if (me._disposed) {
                me._removeLoadEvents();
                return;
            }
            me.data = request.response;
            WebAudioSound.buffs.push({ "buffer": me.data, "url": me.url });
            WebAudioSound.decode();
        };
        request.onerror = function (e: any): void {
            me._err();
        }
        request.send();
    }

    private _err(): void {
        this._removeLoadEvents();
        WebAudioSound.__loadingSound[this.url] = false;
        this.event(Event.ERROR);
    }

    private _loaded(audioBuffer: any): void {
        this._removeLoadEvents();
        if (this._disposed) {
            return;
        }
        this.audioBuffer = audioBuffer;
        WebAudioSound._dataCache[this.url] = this.audioBuffer;
        this.loaded = true;
        this.event(Event.COMPLETE);
    }

    private _removeLoadEvents(): void {
        WebAudioSound.e.off("loaded:" + this.url, this, this._loaded);
        WebAudioSound.e.off("err:" + this.url, this, this._err);
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
        ILaya.SoundManager.addChannel(channel);
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
        delete WebAudioSound._dataCache[this.url];
        delete WebAudioSound.__loadingSound[this.url];
        this.audioBuffer = null;
        this.data = null;
        this.__toPlays = [];
    }
}


