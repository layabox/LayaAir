import { LayaGL } from "../../laya/layagl/LayaGL";
import { VideoTexture } from "../../laya/media/VideoTexture";
import { URL } from "../../laya/net/URL";
import { PAL } from "../../laya/platform/PlatformAdapters";

export class TtVideoTexture extends VideoTexture {
    readonly decoder: any;

    private _volume: number = 1;
    private _muted: boolean = false;
    private _ended: boolean = false;

    constructor() {
        super();

        this.decoder = PAL.g.createOffscreenVideo();
        this.decoder.onCandraw((aspectRatio: number) => {
            if (this._loaded)
                return;

            this.setLoaded(1080 * aspectRatio, 1080, true);
        });
        this.decoder.onCanplay(() => {
            if (this._playing)
                this.decoder.play();
        });
        this.decoder.offEnded(() => {
            this._ended = true;
        });
    }

    get readyState(): number {
        return this._loaded ? 1 : 0;
    }

    get volume(): number {
        return this._volume;
    }

    set volume(value: number) {
        this._volume = value;
        if (this.decoder)
            this.decoder.volume = value;
    }

    get muted(): boolean {
        return this._muted;
    }
    set muted(value: boolean) {
        this._muted = value;
        if (this.decoder)
            this.decoder.muted = value;
    }

    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
        if (this.decoder)
            this.decoder.loop = value;
    }

    get ended(): boolean {
        return this._ended;
    }

    get currentTime(): number {
        if (this.decoder)
            return this.decoder.currentTime;
        else
            return 0;
    }

    set currentTime(value: number) {
        if (this.decoder)
            this.decoder.currentTime = value;
    }

    protected onLoad(url: string): void {
        let src = this._source;
        this._ended = false;
        if (this._loaded)
            this.decoder.stop();
        this._loaded = false;

        if (this._source !== src)
            return;

        this.decoder.src = URL.postFormatURL(URL.formatURL(url));
        this.decoder.volume = this._volume;
        this.decoder.muted = this._muted;
        this.decoder.autoplay = this._playing;
        this.decoder.loop = this._loop;
    }

    protected onPlay(): void {
        this.decoder.play();
    }

    protected onPause(): void {
        this.decoder.pause();
    }

    protected onStop(): void {
        this.decoder.stop();
    }

    onRender(): boolean {
        LayaGL.textureContext.updateVideoTexture(this._texture, this.decoder, false, false);
        return true;
    }

    protected onDestroy(): void {
        this.decoder.destroy();
    }
}