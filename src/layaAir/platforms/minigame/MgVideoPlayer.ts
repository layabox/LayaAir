import { Mutable } from "../../ILaya";
import { VideoPlayer } from "../../laya/media/VideoPlayer";
import { URL } from "../../laya/net/URL";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { getErrorMsg } from "../../laya/utils/Error";

/**
 * @ignore
 */
export class MgVideoPlayer extends VideoPlayer {
    readonly video: WechatMinigame.Video;

    private _loop: boolean = false;
    private _currentTime: number;
    private _ended: boolean = false;
    private _muted: boolean = false;
    private _playbackRate: number = 1;

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
        return this._currentTime;
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
        if (this._loaded)
            this.video.destroy();

        (<Mutable<this>>this).video = PAL.g.createVideo(Object.assign({},
            this.options,
            this.getNodeTransform(),
            {
                src: URL.postFormatURL(URL.formatURL(url)),
                autoplay: this._playing,
                loop: this._loop,
                muted: this._muted,
                playbackRate: this._playbackRate,
            }));
        this.video.onEnded(() => this._ended = true);
        this.video.onError((err) => {
            console.error("MgVideoPlayer: " + getErrorMsg(err));
        });
        this.setLoaded();
    }

    protected onPlay(): void {
        this.video.play();
    }

    protected onPause(): void {
        this.video.pause();
    }

    protected onTransformChanged(): void {
        if (!this.video)
            return;

        let { x, y, width, height } = this.getNodeTransform();

        if ((this.video as any).paintTo) { //douyin
            (this.video as any).paintTo(Browser.mainCanvas.source, x, y, 0, 0, width, height);
        }
        else {
            this.video.x = x;
            this.video.y = y;
            this.video.width = width;
            this.video.height = height;
        }
    }

    protected onDestroy(): void {
        this.video.destroy();
    }
}