import { Browser } from "../utils/Browser";
import { LayaGL } from "../layagl/LayaGL";
import { VideoTexture } from "./VideoTexture";
import { PAL } from "../platform/PlatformAdapters";
import { LayaEnv } from "../../LayaEnv";
import { HTMLVideoPlayer } from "./HTMLVideoPlayer";

/**
 * @ignore
 */
export class HTMLVideoTexture extends VideoTexture {
    public readonly element: HTMLVideoElement;

    private _needUpdate = true;
    private _hasRequestVideoFrame = false;

    constructor() {
        super();

        let ele = this.element = HTMLVideoPlayer.createElement();

        ele.addEventListener("loadedmetadata", () =>
            this.setLoaded(this.element.videoWidth, this.element.videoHeight, Browser.onLayaRuntime));
        ele.addEventListener("canplay", () => {
            //让画面显示出来，而不是黑色
            if (!this._playing)
                this.render(true);
        });

        if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
            const scope = this;
            function updateVideo() {
                scope._needUpdate = true;
                ele.requestVideoFrameCallback(updateVideo);
            }
            ele.requestVideoFrameCallback(updateVideo);
            this._hasRequestVideoFrame = true;
        }
    }

    get currentTime(): number {
        return this.element.currentTime;
    }

    set currentTime(value: number) {
        this.element.currentTime = value;
        if (!this._playing && this._loaded)
            this.render();
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
        HTMLVideoPlayer.setSrc(this.element, url);
        this.element.load();
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

    protected onRender(): boolean {
        if (!this._hasRequestVideoFrame || this._needUpdate) {
            LayaGL.textureContext.updateVideoTexture(this._texture, this.element, false, false);
            this._needUpdate = false;
            return true;
        }
        else
            return false;
    }

    protected onDestroy() {
        HTMLVideoPlayer.setSrc(this.element, null);
        this.element.remove();
        if (LayaEnv.isConch)
            (this.element as any)._destroy();
    }
}