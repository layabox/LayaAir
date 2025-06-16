import { LayaGL } from "../../laya/layagl/LayaGL";
import { VideoTexture } from "../../laya/media/VideoTexture";
import { URL } from "../../laya/net/URL";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";

export class WxVideoTexture extends VideoTexture {
    readonly decoder: WechatMinigame.VideoDecoder;

    private _currentTime: number;
    private _ended: boolean = false;
    private _waitFirstFrame: boolean = false;
    private _startOption: any;

    constructor() {
        super();

        //@ts-ignore
        this.decoder = PAL.g.createVideoDecoder({
            type: "wemedia" // 3.0.0以上基础库支持传入type参数
        });
        this.decoder.on(<any>"frame", (res) => {
            this._currentTime = res.pts / 1000; // 当前播放的进度
            if (this._waitFirstFrame) {
                this._waitFirstFrame = false;
                if (!this._playing) {
                    //让画面显示出来，而不是黑色
                    this.render(true);
                    //@ts-ignore
                    this.decoder.wait(true);
                }
            }
        });
        this.decoder.on("ended", () => {
            if (this._loop)
                this.decoder.stop().then(() => this.decoder.start(this._startOption));
            else
                this._ended = true;
        });
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

    protected onLoad(url: string): void {
        let src = this._source;
        this._ended = false;
        this._waitFirstFrame = false;
        if (this._loaded)
            this.decoder.stop();
        this._loaded = false;

        if (this._source !== src)
            return;

        this._startOption = {};
        this._startOption.source = URL.postFormatURL(URL.formatURL(url));
        if (Browser.isIOSHighPerformanceModePlus)
            this._startOption.videoDataType = 2;

        this.decoder.start(this._startOption).then(res => {
            this.setLoaded(res.width, res.height, true);
            if (!this._playing)
                this._waitFirstFrame = true;
        }).catch(err => {
            console.warn("MgVideoTexture: " + err.message);
        });
    }

    protected onPlay(): void {
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
        const frameData = this.decoder.getFrameData();
        if (frameData) {
            const { data } = frameData;

            LayaGL.textureContext.setTexturePixelsData(this._texture, new Uint8ClampedArray(data), false, false);

            return true;
        }
        else
            return false;
    }

    protected onDestroy(): void {
        this.decoder.remove();
    }
}