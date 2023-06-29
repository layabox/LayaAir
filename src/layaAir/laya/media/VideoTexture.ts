import { BaseTexture } from "../resource/BaseTexture";
import { LayaGL } from "../layagl/LayaGL";
import { ILaya } from "../../ILaya";
import { Utils } from "../utils/Utils";
import { URL } from "../net/URL";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { LayaEnv } from "../../LayaEnv";
import { Texture2D } from "../resource/Texture2D";
import { AssetDb } from "../resource/AssetDb";
import { Event as LayaEvent } from "../events/Event";
import { Browser } from "../utils/Browser";


/**
 * <code>VideoTexture</code> 多媒体纹理
 */
export class VideoTexture extends BaseTexture {
    public readonly element: HTMLVideoElement;

    private _source: string;
    private _listeningEvents: Record<string, (evt: Event) => void>;
    private immediatelyPlay: boolean;
    /**
     * 是否开发者自己调用Render
     */
    private _frameRender: boolean;
    /** @inernal 避免重复的加载 */
    _isLoaded: boolean;
    _needUpdate: boolean;

    /**
     * 创建VideoTexture对象，
     */
    constructor() {
        let ele: HTMLVideoElement = ILaya.Browser.createElement("video");
        super(ele.videoWidth, ele.videoHeight, RenderTargetFormat.R8G8B8);
        this._frameRender = true;
        this._isLoaded = false;
        this._needUpdate = false;
        this.immediatelyPlay = false;
        this.element = ele;

        this._listeningEvents = {};

        this._dimension = TextureDimension.Tex2D;


        // ele.setAttribute('crossorigin', 'Anonymous');

        var style: any = this.element.style;
        style.position = 'absolute';
        style.top = '0px';
        style.left = '0px';

        // 默认放开webGL对纹理数据的跨域限制
        ele.setAttribute('crossorigin', 'anonymous');
        if (ILaya.Browser.onMobile) {
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

        ele.addEventListener("loadedmetadata", () => {
            this.loadedmetadata();
        });
        const scope = this;
        function updateVideo() {
            scope._needUpdate = true;
            ele.requestVideoFrameCallback(updateVideo);

        }
        if ('requestVideoFrameCallback' in ele) {
            ele.requestVideoFrameCallback(updateVideo);
        }
        //ios微信浏览器环境下默认不触发loadedmetadata，在主动调用play方法的时候才会触发loadedmetadata事件
        if (ILaya.Browser.onWeiXin) {
            this.loadedmetadata();
        }
    }

    private isNeedUpdate() {
        return this._needUpdate;
    }

    loadedmetadata() {
        if (this._isLoaded)
            return;
        //flag only TODO
        this._width = this.element.videoWidth;
        this._height = this.element.videoHeight;
        this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, this.element.videoWidth, this.element.videoHeight, TextureFormat.R8G8B8, false, false);
        this.wrapModeU = WrapMode.Clamp;
        this.wrapModeV = WrapMode.Clamp;
        this.filterMode = FilterMode.Bilinear;
        LayaGL.textureContext.initVideoTextureData(this._texture);
        this._texture.gammaCorrection = 2.2;//这里使用srgb会变得特别的卡，所以srgb的转换放入Shader中进行
        if (this.immediatelyPlay) {
            this.play();
        }
        this._isLoaded = true;
        this.event(LayaEvent.READY, this);
    }

    get source(): string {
        return this._source;
    }

    get gammaCorrection() {
        return 2.2;
    }

    /**
    * 设置播放源路径
    * @param url 播放源路径
    */
    set source(url: string) {
        this._source = url;
        if (!url)
            return;

        AssetDb.inst.resolveURL(url, url => {
            while (this.element.childElementCount)
                this.element.firstChild.remove();

            if (url.startsWith("blob:"))
                this.element.src = url;
            else
                this.appendSource(url);
        });
    }

    private appendSource(source: string): void {
        var sourceElement: HTMLSourceElement = ILaya.Browser.createElement("source");
        sourceElement.src = URL.postFormatURL(URL.formatURL(source));
        let extension = Utils.getFileExtension(source);
        sourceElement.type = extension == "m3u8" ? "application/vnd.apple.mpegurl" : ("video/" + extension);
        this.element.appendChild(sourceElement);
    }

    /**
     * @internal
     */
    render() {

        if (this.element.readyState == 0)
            return;
        if (this.isNeedUpdate() || Browser.onLayaRuntime) {
            LayaGL.textureContext.updateVideoTexture(this._texture, this.element, false, false);
            this._needUpdate = false;
        }
    }

    /**
     * 是否每一帧都渲染
     */
    set frameRender(value: boolean) {
        if (this._frameRender && !value) {
            ILaya.timer.clear(this, this.render);
        }
        if (!this._frameRender && value) {
            ILaya.timer.frameLoop(1, this, this.render);
        }
        this._frameRender = value;
    }

    get frameRender() {
        return this._frameRender;
    }


    /**
     * 开始播放视频
     */
    play() {
        if (!this._texture) {
            this.immediatelyPlay = true;
        } else {
            this.element.play().catch(() => {
                this.event("NotAllowedError");
            });
            if (this._frameRender) {
                ILaya.timer.frameLoop(1, this, this.render);
            }
        }

    }

    _getSource() {
        return this._texture ? this._texture.resource : null;
    }

    get defaultTexture() {
        return Texture2D.whiteTexture;
    }

    /**
     * 暂停播放视频
     */
    pause() {
        this.element.pause();
        if (this._frameRender) {
            ILaya.timer.clear(this, this.render);
        }

    }

    /**
     * 重新加载视频。
     */
    load(): void {
        this.element.load();
    }

    /**
     * 检测是否支持播放指定格式视频。
     * @param type	"mp4","ogg","webm","m3u8"等。
     * @return 表示支持的级别。可能的值：
     * <ul>
     * <li>"probably" - 浏览器最可能支持该音频/视频类型</li>
     * <li>"maybe" - 浏览器也许支持该音频/视频类型</li>
     * <li>"" - （空字符串）浏览器不支持该音频/视频类型</li>
     * </ul>
     */
    canPlayType(type: string): CanPlayTypeResult {
        type = type == "m3u8" ? "application/vnd.apple.mpegurl" : ("video/" + type);
        return this.element.canPlayType(type);
    }

    /**
     * buffered 属性返回 TimeRanges(JS)对象。TimeRanges 对象表示用户的音视频缓冲范围。缓冲范围指的是已缓冲音视频的时间范围。如果用户在音视频中跳跃播放，会得到多个缓冲范围。
     * <p>buffered.length返回缓冲范围个数。如获取第一个缓冲范围则是buffered.start(0)和buffered.end(0)。以秒计。</p>
     * @return TimeRanges(JS)对象
     */
    get buffered(): any {
        return this.element.buffered;
    }

    /**
     * 获取当前播放源路径。
     */
    get currentSrc(): string {
        return this.element.currentSrc;
    }

    /**
     * 设置和获取当前播放头位置。
     */
    get currentTime(): number {
        return this.element.currentTime;
    }

    set currentTime(value: number) {
        if (!this.element)
            return;

        this.element.currentTime = value;
        this.render();
    }

    /**
     * 设置和获取当前音量。
     */
    set volume(value: number) {
        if (!this.element)
            return;
        this.element.volume = value;
    }

    get volume(): number {
        return this.element.volume;
    }

    /**
     * 表示视频元素的就绪状态：
     * <ul>
     * <li>0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息</li>
     * <li>1 = HAVE_METADATA - 关于音频/视频就绪的元数据</li>
     * <li>2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒</li>
     * <li>3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的</li>
     * <li>4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放</li>
     * </ul>
     */
    get readyState(): any {
        return this.element.readyState;
    }

    /**
     * 获取视频源尺寸。ready事件触发后可用。
     */
    get videoWidth(): number {
        return this.element.videoWidth;
    }

    get videoHeight(): number {
        return this.element.videoHeight;
    }

    /**
     * 获取视频长度（秒）。ready事件触发后可用。
     */
    get duration(): number {
        return this.element.duration;
    }

    /**
     * 返回音频/视频的播放是否已结束
     */
    get ended(): boolean {
        return this.element.ended;
    }

    /**
     * 返回表示音频/视频错误状态的 MediaError（JS）对象。
     */
    get error(): MediaError {
        return this.element.error;
    }

    /**
     * 设置或返回音频/视频是否应在结束时重新播放。
     */
    get loop(): boolean {
        return this.element.loop;
    }

    set loop(value: boolean) {
        if (!this.element)
            return;
        this.element.loop = value;
    }

    /**
     * playbackRate 属性设置或返回音频/视频的当前播放速度。如：
     * <ul>
     * <li>1.0 正常速度</li>
     * <li>0.5 半速（更慢）</li>
     * <li>2.0 倍速（更快）</li>
     * <li>-1.0 向后，正常速度</li>
     * <li>-0.5 向后，半速</li>
     * </ul>
     * <p>只有 Google Chrome 和 Safari 支持 playbackRate 属性。</p>
     */
    get playbackRate(): number {
        return this.element.playbackRate;
    }

    set playbackRate(value: number) {
        if (!this.element)
            return;
        this.element.playbackRate = value;
    }

    /**
     * 获取和设置静音状态。
     */
    get muted(): boolean {
        return this.element.muted;
    }

    set muted(value: boolean) {
        if (!this.element)
            return;
        this.element.muted = value;
    }

    /**
     * 返回视频是否暂停
     */
    get paused(): boolean {
        return this.element.paused;
    }

    /**
     * preload 属性设置或返回是否在页面加载后立即加载视频。可赋值如下：
     * <ul>
     * <li>auto	指示一旦页面加载，则开始加载视频。</li>
     * <li>metadata	指示当页面加载后仅加载音频/视频的元数据。</li>
     * <li>none	指示页面加载后不应加载音频/视频。</li>
     * </ul>
     */
    get preload(): string {
        return this.element.preload;
    }

    set preload(value: string) {
        if (!this.element)
            return;
        //@ts-ignore
        this.element.preload = value;
    }

    /**
     * 参见 <i>http://www.w3school.com.cn/tags/av_prop_seekable.asp</i>。
     */
    get seekable(): any {
        return this.element.seekable;
    }

    /**
     * seeking 属性返回用户目前是否在音频/视频中寻址。
     * 寻址中（Seeking）指的是用户在音频/视频中移动/跳跃到新的位置。
     */
    get seeking(): boolean {
        return this.element.seeking;
    }

    protected onStartListeningToType(type: string): void {
        if (videoEvents.has(type)) {
            let func = this._listeningEvents[type];
            if (!func)
                func = this._listeningEvents[type] = () => {
                    this.event(type);
                };

            this.element.addEventListener(type, func);
        }
    }

    destroy() {
        var isConchApp: boolean = LayaEnv.isConch;
        if (isConchApp) {
            (<any>this.element)._destroy();
        }

        ILaya.timer.clear(this, this.render);
        super.destroy();
    }
}

const videoEvents = new Set([
    "abort", "canplay", "canplaythrough", "durationchange", "emptied", "error", "loadeddata",
    "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking",
    "stalled", "suspend", "timeupdate", "volumechange", "waiting", "ended"
]);