import { LayaGL } from "../../laya/layagl/LayaGL";
import { VideoTexture } from "../../laya/media/VideoTexture";
import { URL } from "../../laya/net/URL";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { getErrorMsg } from "../../laya/utils/Error";

export class NativeVideoTexture extends VideoTexture {
    readonly decoder: any;

    private _currentTime: number = 0;
    private _ended: boolean = false;
    private _waitFirstFrame: boolean = false;
    private _startOption: any;
    private _loadId: number = 0;
    private _hasNativeControls: boolean;

    constructor() {
        super();
        //@ts-ignore
        this.decoder = PAL.g.createVideoDecoder({
            type: "wemedia" // 3.0.0以上基础库支持传入type参数
        });
        // The matching runtime adds duration together with the control/session fixes.
        // Older runtimes keep their existing first-frame and replay call sequence.
        this._hasNativeControls = this.readNativeProperty("duration", -1) >= 0;
        this.decoder.on(<any>"frame", (res: any) => {
            this._currentTime = res.pts / 1000; // 当前播放的进度
            if (this._waitFirstFrame) {
                this._waitFirstFrame = false;
                if (!this._playing) {
                    const loadId = this._loadId;
                    const source = this._source;
                    //让画面显示出来，而不是黑色
                    this.render(true);
                    if (loadId === this._loadId && source === this._source && !this.destroyed && !this._playing)
                        this.decoder.wait(true);
                }
            }
        });
        this.decoder.on("ended", () => {
            if (this._loop) {
                this.restart();
            }
            else {
                if (this._hasNativeControls)
                    this.pause();
                this._ended = true;
                this.event("ended");
            }
        });
        if (this._hasNativeControls) {
            try { this.decoder.on("error", (err: any) => this.onError(err)); }
            catch { /* Older bridges can reject unsupported event names. */ }
        }
    }

    get readyState(): number {
        return this._loaded ? 1 : 0;
    }

    get ended(): boolean {
        return this._ended;
    }

    get currentTime(): number {
        return this._currentTime;
    }

    set currentTime(value: number) {
        this.decoder.seek(value * 1000);
    }

    get duration(): number {
        return this.readNativeProperty("duration", 0);
    }

    get muted(): boolean {
        return this.readNativeProperty("muted", false);
    }

    set muted(value: boolean) {
        this.writeNativeProperty("muted", value);
    }

    get volume(): number {
        return this.readNativeProperty("volume", 1);
    }

    set volume(value: number) {
        this.writeNativeProperty("volume", value);
    }

    get playbackRate(): number {
        return this.readNativeProperty("playbackRate", 1);
    }

    set playbackRate(value: number) {
        this.writeNativeProperty("playbackRate", value);
    }

    private readNativeProperty<T>(name: string, fallback: T): T {
        try {
            const value = this.decoder?.[name];
            return typeof value === typeof fallback ? value : fallback;
        }
        catch {
            return fallback;
        }
    }

    private writeNativeProperty(name: string, value: any): void {
        try {
            // Do not create JS-only properties on an older Native object.
            if (this.decoder && name in this.decoder)
                this.decoder[name] = value;
        }
        catch {
            // Older bridges can reject read-only or unsupported properties.
        }
    }

    protected onLoad(url: string): void {
        let loadId = ++this._loadId;
        let source = this._source;
        this._ended = false;
        this._currentTime = 0;
        this._waitFirstFrame = false;
        if (this._loaded)
            this.decoder.stop();
        this._loaded = false;

        this._startOption = {};
        this._startOption.source = URL.postFormatURL(URL.formatURL(url));
        if (Browser.isIOSHighPerformanceModePlus)
            this._startOption.videoDataType = 2;

        this.decoder.start(this._startOption).then((res: any) => {
            if (loadId !== this._loadId || source !== this._source || this.destroyed)
                return;
            this.setLoaded(res.width, res.height, true);
            if (loadId !== this._loadId || source !== this._source || this.destroyed)
                return;
            if (!this._playing) {
                this._waitFirstFrame = true;
                // Request the first asynchronous native pixel copy even without a render timer.
                if (this._hasNativeControls)
                    this.render(true);
            }
        }).catch((err: any) => {
            if (loadId === this._loadId && source === this._source && !this.destroyed)
                this.onError(err);
        });
    }

    private onError(err: any): void {
        if (this.destroyed)
            return;
        this.pause();
        console.warn("NativeVideoTexture: " + getErrorMsg(err));
        this.event("error", err);
    }

    private async restart(): Promise<void> {
        const loadId = ++this._loadId;
        const source = this._source;
        const options = this._startOption;
        const isCurrent = () => loadId === this._loadId && source === this._source && !this.destroyed;
        try {
            // EOF can terminate the native decoding thread (for example, on Windows).
            await this.decoder.stop();
            if (!isCurrent())
                return;
            await this.decoder.start(options);
            if (!isCurrent())
                return;
            this._currentTime = 0;
            if (this._hasNativeControls)
                this.decoder.wait(!this._playing);
        }
        catch (err) {
            if (isCurrent())
                this.onError(err);
        }
    }

    protected onPlay(): void {
        if (this._ended && this._hasNativeControls) {
            this._ended = false;
            this.restart();
            return;
        }
        //@ts-ignore
        this.decoder.wait(false);
    }

    protected onPause(): void {
        //@ts-ignore
        this.decoder.wait(true);
    }

    protected onStop(): void {
        this.decoder.stop();
    }
    onRender(): boolean {
        LayaGL.textureContext.setTextureImageData(this._texture, this.decoder, false, false);
        return true;
    }
    protected onDestroy(): void {
        ++this._loadId;
        this.decoder.remove();
    }
}
