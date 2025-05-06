import { Laya } from "../../../Laya";
import { SoundChannel } from "../../../laya/media/SoundChannel";
import { PAL } from "../../../laya/platform/PlatformAdapters";
import { MgMediaAdapter } from "../MgMediaAdapter";

export class MgInnerAudioChannel extends SoundChannel {
    private _ctx: WechatMinigame.InnerAudioContext;
    private _useWebAudioImplement: boolean;

    constructor(url: string, useWebAudioImplement?: boolean) {
        super(url);

        this._useWebAudioImplement = useWebAudioImplement;
    }

    get position(): number {
        if (this._ctx)
            return this._ctx.currentTime;
        else
            return 0;
    }

    get duration(): number {
        if (this._ctx)
            return this._ctx.duration;
        else
            return 0;
    }

    protected onPlay(url: string): void {
        Laya.loader.fetch(url, <any>"filePath").then((filePath: string) => this.onLoaded(filePath));
    }

    private onLoaded(filePath: string): void {
        if (!this._started)
            return;

        this._ctx = this._useWebAudioImplement ?
            (<MgMediaAdapter>PAL.media).webAudioCtxPool.take() :
            (<MgMediaAdapter>PAL.media).innerCtxPool.take();

        this._loaded = true;
        let ctx = this._ctx;
        ctx.onError(result => {
            console.error("MgInnerAudioChannel: ", result);
            this.stop();
        });
        ctx.onEnded(() => this.onPlayEnd());
        ctx.src = filePath;
        ctx.playbackRate = this.playbackRate;
        ctx.currentTime = this.startTime;
        ctx.loop = this.loops === 0;
        ctx.volume = this._muted ? 0 : this._volume;
        if (!this._paused)
            ctx.play();
    }

    protected onPlayAgain(): void {
        this._ctx.currentTime = this.startTime;
        this._ctx.play();
    }

    protected onStop(): void {
        this._ctx.pause();
        if (this._useWebAudioImplement)
            (<MgMediaAdapter>PAL.media).webAudioCtxPool.recover(this._ctx);
        else
            (<MgMediaAdapter>PAL.media).innerCtxPool.recover(this._ctx);
        this._ctx = null;
    }

    protected onPause(): void {
        this._ctx.pause();
    }

    protected onResume(): void {
        this._ctx.play();
    }

    protected onVolumeChanged(): void {
        this._ctx.volume = this._muted ? 0 : this._volume;
    }

    protected onMuted(): void {
        if (this._muted)
            this._ctx.pause();
        else
            this._ctx.play();
    }
}