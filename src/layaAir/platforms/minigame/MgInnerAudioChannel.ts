import { Laya } from "../../Laya";
import { SoundChannel } from "../../laya/media/SoundChannel";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { getErrorMsg } from "../../laya/utils/Error";

export class MgInnerAudioChannel extends SoundChannel {
    private _ctx: WechatMinigame.InnerAudioContext;

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
        if (!this._started || filePath == null)
            return;

        this._loaded = true;
        let ctx = this._ctx = this.createContext();
        ctx.onError(err => {
            console.error("MgInnerAudioChannel: " + getErrorMsg(err));
            this.stop();
        });
        ctx.onEnded(() => this.onPlayEnd());
        let playSound = () => {
            if (this._ctx && !this._paused) {
                if (this.startTime != 0)
                    ctx.seek(this.startTime);
                ctx.play();
            }
            ctx.offCanplay(playSound);
        };
        ctx.onCanplay(playSound);

        ctx.src = filePath;
        ctx.playbackRate = this.playbackRate;
        ctx.loop = this.loops === 0;
        ctx.volume = this._muted ? 0 : this._volume;
    }

    protected onPlayAgain(): void {
        if (this.startTime != 0)
            this._ctx.seek(this.startTime);
        this._ctx.play();
    }

    protected onStop(): void {
        this.releaseContext();
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

    protected createContext() {
        return PAL.g.createInnerAudioContext();
    }

    protected releaseContext(): void {
        this._ctx.destroy();
        this._ctx = null;
    }
}