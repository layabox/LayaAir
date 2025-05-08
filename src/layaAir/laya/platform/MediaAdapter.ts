import { HTMLAudioChannel } from "../media/HTMLAudioChannel";
import { SoundChannel } from "../media/SoundChannel";
import { WebAudioChannel } from "../media/WebAudioChannel";
import { AudioDataCache } from "../media/AudioDataCache";
import { ClassUtils } from "../utils/ClassUtils";
import { IPool, Pool } from "../utils/Pool";
import { Browser } from "../utils/Browser";
import { VideoTexture } from "../media/VideoTexture";
import { HTMLVideoTexture } from "../media/HTMLVideoTexture";
import { ILaya, Mutable } from "../../ILaya";
import { Event } from "../events/Event";
import { VideoPlayer } from "../media/VideoPlayer";
import { Sprite } from "../display/Sprite";
import { Utils } from "../utils/Utils";
import { URL } from "../net/URL";
import { HTMLVideoPlayer } from "../media/HTMLVideoPlayer";

/**
 * @ignore
 */
export class MediaAdapter {
    readonly dataCache: AudioDataCache;
    readonly elementPool: IPool<HTMLAudioElement>;
    readonly gainNodePool: IPool<GainNode>;
    readonly ctx: AudioContext;
    touchToStart: boolean = true;

    protected suspendedMedias: Set<SoundChannel | VideoTexture | VideoPlayer>;

    private _testElement: HTMLAudioElement;
    private _firstTouch = true;

    constructor() {
        this.dataCache = new AudioDataCache();
        this.elementPool = Pool.createPool2(() => this.createAudioElement(), null, ele => this.resetAudioElement(ele));
        this.gainNodePool = Pool.createPool2(() => this.createGainNode(), node => this.initGainNode(node), node => this.resetGainNode(node));
        this.suspendedMedias = new Set();

        this.init();
    }

    protected init() {
        let ctxClass = window.AudioContext || (window as any)["webkitAudioContext"] || (window as any)["mozAudioContext"];
        if (ctxClass != null)
            (<Mutable<this>>this).ctx = new ctxClass();
    }

    createSoundChannel(url: string, useWebAudioImplement?: boolean): SoundChannel {
        let channel: SoundChannel;
        if (this.ctx && useWebAudioImplement)
            channel = new WebAudioChannel(url);
        else
            channel = new HTMLAudioChannel(url);
        return channel;
    }

    createVideoTexture(): VideoTexture {
        return new HTMLVideoTexture();
    }

    createVideoPlayer(): VideoPlayer {
        return new HTMLVideoPlayer();
    }

    createVideoElement(): HTMLVideoElement {
        let ele = Browser.createElement("video");
        let style: any = ele.style;
        style.position = 'absolute';
        style.top = '0px';
        style.left = '0px';

        // 默认放开webGL对纹理数据的跨域限制
        ele.setAttribute('crossorigin', 'anonymous');
        if (Browser.onMobile) {
            //@ts-ignore
            ele["x5-playsInline"] = true;
            //@ts-ignore
            ele["x5-playsinline"] = true;
            //@ts-ignore
            ele.x5PlaysInline = true;
            //@ts-ignore
            ele.playsInline = true;
            //@ts-ignore
            ele["webkit-playsInline"] = true;
            //@ts-ignore
            ele["webkit-playsinline"] = true;
            //@ts-ignore
            ele.webkitPlaysInline = true;
            //@ts-ignore
            ele.playsinline = true;
            //@ts-ignore
            ele.style.playsInline = true;
            ele.crossOrigin = "anonymous";
            ele.setAttribute('playsinline', 'true');
            ele.setAttribute('x5-playsinline', 'true');
            ele.setAttribute('webkit-playsinline', 'true');
            ele.autoplay = true;
        }

        return ele;
    }

    setVideoElementSrc(ele: HTMLVideoElement, url: string) {
        while (ele.childElementCount)
            ele.firstChild.remove();

        if (url) {
            if (url.startsWith("blob:"))
                ele.src = url;
            else {
                let sourceElement = Browser.createElement("source");
                sourceElement.src = URL.postFormatURL(URL.formatURL(url));
                let extension = Utils.getFileExtension(url);
                sourceElement.type = extension == "m3u8" ? "application/vnd.apple.mpegurl" : ("video/" + extension);
                ele.appendChild(sourceElement);
            }
        }
        else {
            ele.pause();
            ele.src = "";
        }
    }

    decodeAudioData(url: string, data: ArrayBuffer): Promise<any> {
        if (this.ctx) {
            let len = data.byteLength;
            return this.ctx.decodeAudioData(data).then(buffer => {
                this.dataCache.add(url, buffer, len);
                return buffer;
            });
        }
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
                this._testElement = this.createAudioElement();
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

    protected createAudioElement() {
        let ele = Browser.createElement("audio");
        return ele;
    }

    protected resetAudioElement(ele: HTMLAudioElement) {
        ele.remove();
        ele.src = "";
        ele.onended = null;
        ele.onerror = null;
        ele.oncanplay = null;
        ele.oncanplaythrough = null;
    }

    protected createGainNode(): GainNode {
        let node: GainNode;
        if (this.ctx.createGain)
            node = this.ctx.createGain();
        else
            node = (this.ctx as any).createGainNode();
        return node;
    }

    protected initGainNode(node: GainNode) {
        node.connect(this.ctx.destination);
    }

    protected resetGainNode(node: GainNode) {
        node.disconnect(0);
    }
}

ClassUtils.regClass("PAL.Media", MediaAdapter);