import { HTMLAudioChannel } from "../media/HTMLAudioChannel";
import { SoundChannel } from "../media/SoundChannel";
import { WebAudioChannel } from "../media/WebAudioChannel";
import { AudioDataCache } from "../media/AudioDataCache";
import { Browser } from "../utils/Browser";
import { VideoTexture } from "../media/VideoTexture";
import { HTMLVideoTexture } from "../media/HTMLVideoTexture";
import { ILaya } from "../../ILaya";
import { Event } from "../events/Event";
import { VideoPlayer } from "../media/VideoPlayer";
import { HTMLVideoPlayer } from "../media/HTMLVideoPlayer";
import { PAL } from "./PlatformAdapters";

/**
 * @ignore
 */
export class MediaAdapter {
    readonly audioDataCache: AudioDataCache;
    ctx: AudioContext;
    touchToStart: boolean = true;

    shortAudioClass: new (url: string) => SoundChannel;
    longAudioClass: new (url: string) => SoundChannel;
    videoTextureClass: new () => VideoTexture;
    videoPlayerClass: new () => VideoPlayer;

    protected suspendedMedias: Set<SoundChannel | VideoTexture | VideoPlayer>;

    private _testElement: HTMLAudioElement;
    private _firstTouch = true;

    constructor() {
        this.audioDataCache = new AudioDataCache();
        this.suspendedMedias = new Set();
        this.touchToStart = PAL.global == null; //一般需要点击允许播放的是web，在小游戏或者native上都不需要点击允许播放

        this.init();
    }

    protected init() {
        let ctxClass = window.AudioContext || (window as any)["webkitAudioContext"] || (window as any)["mozAudioContext"];
        if (ctxClass != null)
            this.ctx = new ctxClass();

        this.shortAudioClass = this.ctx ? WebAudioChannel : HTMLAudioChannel;
        this.longAudioClass = HTMLAudioChannel;
        this.videoTextureClass = HTMLVideoTexture;
        this.videoPlayerClass = HTMLVideoPlayer;
    }

    createSoundChannel(url: string, longAudioUsage?: boolean): SoundChannel {
        return longAudioUsage ? new this.longAudioClass(url) : new this.shortAudioClass(url);
    }

    createVideoTexture(): VideoTexture {
        if (this.videoTextureClass === VideoTexture)
            PAL.warnIncompatibility("VideoTexture");
        return new this.videoTextureClass();
    }

    createVideoPlayer(): VideoPlayer {
        if (this.videoPlayerClass === VideoPlayer)
            PAL.warnIncompatibility("VideoPlayer");
        return new this.videoPlayerClass();
    }

    decodeAudioData(data: ArrayBuffer): Promise<any> {
        if (this.ctx)
            return this.ctx.decodeAudioData(data);
        else
            return Promise.resolve(null);
    }

    resumeUntilGotFocus(media: SoundChannel | VideoTexture | VideoPlayer) {
        if (this.suspendedMedias.size === 0) {
            ILaya.stage.on(Event.MOUSE_UP, this, this.onGotFocus);
            if (!this._firstTouch || !this.touchToStart)
                ILaya.stage.on(Event.FOCUS, this, this.onGotFocus);
        }
        this.suspendedMedias.add(media);
        media.pause();
        media._autoResume = true;
    }

    canPlayType(type: string): CanPlayTypeResult {
        if (typeof (HTMLAudioElement) !== undefined && typeof (HTMLAudioElement.prototype.canPlayType) === "function") {
            if (!this._testElement)
                this._testElement = Browser.createElement("audio");
            return this._testElement.canPlayType(type);
        }
        else
            return "";
    }

    protected onGotFocus() {
        this._firstTouch = false;
        ILaya.stage.off(Event.MOUSE_UP, this, this.onGotFocus);
        ILaya.stage.off(Event.FOCUS, this, this.onGotFocus);

        if (this.suspendedMedias.size === 0)
            return;

        let arr = Array.from(this.suspendedMedias).filter(c => c._autoResume);
        this.suspendedMedias.clear();
        this.beforeResumeMedias(arr).then(() => {
            for (let medias of arr) {
                medias._autoResume = false;
                medias.resume();
            }
        });
    }

    protected beforeResumeMedias(medias: ReadonlyArray<SoundChannel | VideoTexture | VideoPlayer>): Promise<void> {
        let checkCtx = false;
        for (let channel of medias) {
            if (channel instanceof WebAudioChannel && !checkCtx) {
                checkCtx = true;
                if (this.ctx.state === "suspended") {
                    return this.ctx.resume().catch(e => { });
                }
            }
        }

        return Promise.resolve();
    }
}

PAL.register("media", MediaAdapter);