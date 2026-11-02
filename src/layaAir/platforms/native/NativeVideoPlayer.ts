import { Mutable } from "../../ILaya";
import { VideoPlayerBackend } from "../../laya/media/VideoPlayerBackend";
import { URL } from "../../laya/net/URL";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { getErrorMsg } from "../../laya/utils/Error";

/**
 * @ignore
 */
export class NativeVideoPlayer extends VideoPlayerBackend {
    readonly video: any;

    private _loop: boolean = false;
    private _ended: boolean = false;
    private _muted: boolean = false;
    private _playbackRate: number = 1;
    private _volume: number = 1;

    get duration(): number {
        try {
            const duration = this.video?.duration;
            return typeof duration === "number" ? duration : 0;
        }
        catch {
            return 0;
        }
    }

    get volume(): number {
        return this._volume;
    }

    set volume(value: number) {
        this._volume = value;
        try {
            if (this.video && "volume" in this.video)
                this.video.volume = value;
        }
        catch {
            // Older bridges can reject read-only or unsupported properties.
        }
    }

    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
        if (this.video)
            this.video.loop = value;
    }

    get ended(): boolean {
        return this._ended;
    }

    get currentTime(): number {
        if (this.video)
            return this.video.tell();
        return 0.0;
    }

    set currentTime(value: number) {
        if (this.video)
            this.video.seek(value * 1000);
    }

    get muted(): boolean {
        return this._muted;
    }

    set muted(value: boolean) {
        this._muted = value;
        if (this.video)
            this.video.muted = value;
    }

    get playbackRate(): number {
        return this._playbackRate;
    }

    set playbackRate(value: number) {
        this._playbackRate = value;
        if (this.video)
            this.video.playbackRate = value;
    }

    protected onLoad(url: string): void {
        this._ended = false;
        const previousVideo = this.video;
        (<Mutable<this>>this).video = null;
        this._loaded = false;
        previousVideo?.destroy();

        (<Mutable<this>>this).video = PAL.g.createVideo(Object.assign({},
            this.options,
            this.getNodeTransform(),
            {
                src: URL.postFormatURL(URL.formatURL(url)),
                autoplay: this._playing,
                loop: this._loop,
                muted: this._muted,
                playbackRate: this._playbackRate,
                volume: this._volume,
            }));
        const video = this.video;
        video.onEnded(() => {
            if (this.video !== video || this._loop)
                return;
            this.pause();
            this._ended = true;
            this._owner?.event("ended");
        });
        video.onError((err: any) => {
            if (this.video !== video)
                return;
            this.pause();
            console.error("NativeVideoPlayer: " + getErrorMsg(err));
            this._owner?.event("error", err);
        });
        this.setLoaded();
    }

    protected onPlay(): void {
        this._ended = false;
        this.video.play();
    }

    protected onPause(): void {
        this.video.pause();
    }

    protected onTransformChanged(): void {
        if (!this.video)
            return;

        let { x, y, width, height } = this.getNodeTransform();

        this.video.x = x;
        this.video.y = y;
        this.video.width = width;
        this.video.height = height;
    }

    protected onDestroy(): void {
        const video = this.video;
        (<Mutable<this>>this).video = null;
        this._loaded = false;
        video?.destroy();
    }
}
