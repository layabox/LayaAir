import { LayaEnv } from "../../LayaEnv";
import { PAL } from "../platform/PlatformAdapters";
import { Browser } from "../utils/Browser";
import { VideoPlayer } from "./VideoPlayer";

/**
 * @ignore
 */
export class HTMLVideoPlayer extends VideoPlayer {
    public readonly element: HTMLVideoElement;

    constructor() {
        super();

        this.element = PAL.media.createVideoElement();
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
        PAL.media.setVideoElementSrc(this.element, url);
        if (this.options.underGameView) {
            let c = Browser.container;
            if (c !== document.body)
                document.body.insertBefore(this.element, c);
            else
                document.body.appendChild(this.element);
        }
        else
            document.body.appendChild(this.element);
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
    }

    protected onDestroy() {
        PAL.media.setVideoElementSrc(this.element, null);
        this.element.remove();
        if (LayaEnv.isConch)
            (this.element as any)._destroy();
    }
}