import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { URL } from "../net/URL";
import { PAL } from "../platform/PlatformAdapters";
import { Browser } from "../utils/Browser";
import { Utils } from "../utils/Utils";
import { VideoPlayer } from "./VideoPlayer";

/**
 * @ignore
 */
export class HTMLVideoPlayer extends VideoPlayer {
    public readonly element: HTMLVideoElement;

    constructor() {
        super();

        this.element = HTMLVideoPlayer.createElement();
    }

    get currentTime(): number {
        return this.element.currentTime;
    }

    set currentTime(value: number) {
        this.element.currentTime = value;
    }

    get volume(): number {
        return this.element.volume;
    }

    set volume(value: number) {
        this.element.volume = value;
    }

    get readyState(): any {
        return this.element.readyState;
    }

    get duration(): number {
        return this.element.duration;
    }

    get ended(): boolean {
        return this.element.ended;
    }

    get loop(): boolean {
        return this.element.loop;
    }

    set loop(value: boolean) {
        this.element.loop = value;
    }

    get playbackRate(): number {
        return this.element.playbackRate;
    }

    set playbackRate(value: number) {
        this.element.playbackRate = value;
    }

    get muted(): boolean {
        return this.element.muted;
    }

    set muted(value: boolean) {
        this.element.muted = value;
    }

    protected onLoad(url: string) {
        this.element.controls = this.options.controls ?? false;
        HTMLVideoPlayer.setSrc(this.element, url);
        if (this.options.underGameView) {
            let c = Browser.container;
            if (c !== Browser.document.body)
                Browser.document.body.insertBefore(this.element, c);
            else
                Browser.document.body.appendChild(this.element);
        }
        else
            Browser.document.body.appendChild(this.element);
        this.onTransformChanged();
        this.setLoaded();
    }

    protected onPlay() {
        this.element.play().catch(e => {
            if (e.name === "NotAllowedError")
                PAL.media.resumeUntilGotFocus(this);
            else
                console.warn(e);
        });
    }

    protected onPause() {
        this.element.pause();
    }

    protected onTransformChanged(): void {
        let { x, y, width, height } = this.getNodeTransform();
        let style = this.element.style;
        style.left = x + "px";
        style.top = y + "px";
        style.width = width + "px";
        style.height = height + "px";
        PAL.browser.setStyleTransform(style, "rotate(" + (ILaya.stage.canvasDegree) + "deg)");
    }

    protected onDestroy() {
        HTMLVideoPlayer.setSrc(this.element, null);
        this.element.remove();
        if (LayaEnv.isConch)
            (this.element as any)._destroy();
    }

    static createElement(): HTMLVideoElement {
        let ele = Browser.createElement("video");
        let style = ele.style;
        style.position = 'absolute';
        style.top = '0px';
        style.left = '0px';
        PAL.browser.setStyleTransformOrigin(style, "0 0");

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

    static setSrc(ele: HTMLVideoElement, url: string) {
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
}