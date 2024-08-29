import { BaseTexture } from "../resource/BaseTexture";
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
import { LayaGL } from "../layagl/LayaGL";


/**
 * @en VideoTexture Multimedia texture
 * @zh VideoTexture 多媒体纹理
 */
export class VideoTexture extends BaseTexture {
    public readonly element: HTMLVideoElement;
    static videoEvent_update: string = "videoUpdate";
    private _source: string;
    private _listeningEvents: Record<string, (evt: Event) => void>;
    private immediatelyPlay: boolean;
    /**
     * 是否开发者自己调用Render
     */
    private _frameRender: boolean;
    /** @inernal 避免重复的加载 */
    _isLoaded: boolean;
    /** @internal */
    _needUpdate: boolean;
    /** @inernal 是否使用了requestVideoFrameCallback 接口 */
    _requestVideoFrame: boolean = false;
    private _frameDelty: number;
    private _updateFrame: number;
    private _useFrame: boolean;
    private _lastTimer: number = 0;

    /**
     * @en videoTexture update frame
     * @zh 视频纹理更新帧率
     */
    set updateFrame(value: number) {
        this._frameDelty = 1 / value * 1000;
        this._updateFrame = value;
    }

    get updateFrame() {
        return this._updateFrame;
    }

    set useFrame(value: boolean) {
        this._useFrame = value;
    }

    get useFrame() {
        return this._useFrame;
    }

    /**
     * @ignore
     * @en Creates an inst
     * @zh VideoTexture对象的构造方法
     */
    constructor() {
        let ele: HTMLVideoElement = ILaya.Browser.createElement("video");
        super(ele.videoWidth, ele.videoHeight, RenderTargetFormat.R8G8B8);
        this._frameRender = true;
        this._isLoaded = false;
        this._needUpdate = false;
        this.immediatelyPlay = false;
        this.element = ele;

        this.useFrame = false;
        this.updateFrame = 30;

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


        if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
            const scope = this;
            function updateVideo() {
                scope._needUpdate = true;
                ele.requestVideoFrameCallback(updateVideo);
            }
            ele.requestVideoFrameCallback(updateVideo);
            this._requestVideoFrame = true
        } else {
            this._needUpdate = true;
        }

        // if ('requestVideoFrameCallback' in ele) {
        //     const scope = this;
        //     function updateVideo() {
        //         scope._needUpdate = true;
        //         ele.requestVideoFrameCallback(updateVideo);
        //     }
        //     ele.requestVideoFrameCallback(updateVideo);
        //     this._requestVideoFrame = true
        // } else {
        //     this._needUpdate = true;
        // }

    }


    private isNeedUpdate() {
        if (!this.useFrame)
            return !this._requestVideoFrame || this._needUpdate;
        else {
            let timer: number = Browser.now();
            if (timer - this._lastTimer > this._frameDelty) {
                this._lastTimer = timer;
                return true;
            }
            return false;
        }
    }

    /**
     * @en Handle the loadedmetadata event of the video element.
     * Processes the initialization work after the video resource is loaded, ensuring that necessary texture and playback settings are made so that the video can be properly handled during rendering.
     * @zh 视频元素的 loadedmetadata 事件的回调方法。
     * 处理视频资源加载完毕后的初始化工作，用于在视频正确加载后，做必要的纹理和播放设置，确保视频能在渲染时被正确处理。
     */
    loadedmetadata() {
        if (this._isLoaded)
            return;
        //flag only TODO
        this._width = this.element.videoWidth;
        this._height = this.element.videoHeight;
        if (Browser.onLayaRuntime) {
            this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, this.element.videoWidth, this.element.videoHeight, TextureFormat.R8G8B8A8, false, false, false);
        }
        else {
            this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, this.element.videoWidth, this.element.videoHeight, TextureFormat.R8G8B8, false, false, false);
        }
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


    /**
     * @en The gamma correction value
     * @zh gamma 校正值
     */
    get gammaCorrection() {
        return 2.2;
    }

    /**
     * @en The source URL for the video
     * @zh 视频的源 URL
     */
    get source(): string {
        return this._source;
    }

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
     * @en Render the video texture
     * @zh 渲染视频纹理
     */
    render() {

        if (this.element.readyState == 0)
            return;
        if (this.isNeedUpdate() || Browser.onLayaRuntime) {
            LayaGL.textureContext.updateVideoTexture(this._texture, this.element, false, false);
            this._needUpdate = false;
            //更新事件
            this.event(VideoTexture.videoEvent_update);
        }
    }

    /**
     * @en Whether to render every frame
     * @zh 是否每一帧都渲染
     */
    get frameRender() {
        return this._frameRender;
    }

    set frameRender(value: boolean) {
        if (this._frameRender && !value) {
            ILaya.timer.clear(this, this.render);
        }
        if (!this._frameRender && value) {
            ILaya.timer.frameLoop(1, this, this.render);
        }
        this._frameRender = value;
    }

    /**
     * @en Start playing the video
     * @zh 开始播放视频
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

    /**
     * @en The default texture
     * @zh 默认纹理
     */
    get defaultTexture() {
        return Texture2D.whiteTexture;
    }

    /**
     * @en Pause the video playback
     * @zh 暂停播放视频
     */
    pause() {
        this.element.pause();
        if (this._frameRender) {
            ILaya.timer.clear(this, this.render);
        }

    }

    /**
     * @en Reload the video
     * @zh 重新加载视频
     */
    load(): void {
        this.element.load();
    }

    /**
     * @en Check if the specified video format is supported for playback
     * @param type Video format type, such as "mp4", "ogg", "webm", "m3u8", etc.
     * @returns  The level of support. Possible values:
     * - "probably": The browser most likely supports this audio/video type
     * - "maybe": The browser might support this audio/video type
     * - "": (empty string) The browser does not support this audio/video type
     * @zh 检测是否支持播放指定格式视频
     * @param type	视频格式类型 "mp4","ogg","webm","m3u8"等。
     * @return 表示支持的级别。可能的值：
     * - "probably": 浏览器最可能支持该音频/视频类型
     * - "maybe": 浏览器也许支持该音频/视频类型
     * - "": （空字符串）浏览器不支持该音频/视频类型
     */
    canPlayType(type: string): CanPlayTypeResult {
        type = type == "m3u8" ? "application/vnd.apple.mpegurl" : ("video/" + type);
        return this.element.canPlayType(type);
    }

    /**
     * @en Get the TimeRanges object representing the buffered parts of the audio/video
     * The TimeRanges object represents the buffered time ranges of the audio/video. If the user skips around in the audio/video, multiple buffered ranges may be created.
     * buffered.length returns the number of buffered ranges. 
     * To get the first buffered range, use buffered.start(0) and buffered.end(0). Values are in seconds.
     * @returns The TimeRanges object
     * @zh 获取表示音视频已缓冲部分的 TimeRanges 对象
     * TimeRanges 对象表示用户的音视频缓冲范围。缓冲范围指的是已缓冲音视频的时间范围。如果用户在音视频中跳跃播放，会得到多个缓冲范围。
     * buffered.length 返回缓冲范围个数。如获取第一个缓冲范围则是 buffered.start(0) 和 buffered.end(0)。以秒计。
     * @returns TimeRanges(JS)对象
     */
    get buffered(): any {
        return this.element.buffered;
    }

    /**
     * @en The current source URL of the video
     * @zh 当前播放源路径
     */
    get currentSrc(): string {
        return this.element.currentSrc;
    }

    /**
     * @en The current playback position in seconds
     * @zh 当前播放头位置（以秒为单位）
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
     * @en The current volume level
     * @zh 当前音量
     */
    get volume(): number {
        return this.element.volume;
    }

    set volume(value: number) {
        if (!this.element)
            return;
        this.element.volume = value;
    }


    /**
     * @en The readiness state of the video element:
     * - 0 = HAVE_NOTHING - No information is available about the audio/video
     * - 1 = HAVE_METADATA - Metadata for the audio/video is ready
     * - 2 = HAVE_CURRENT_DATA - Data for the current playback position is available, but not enough to play the next frame/millisecond
     * - 3 = HAVE_FUTURE_DATA - Data for the current and at least the next frame is available
     * - 4 = HAVE_ENOUGH_DATA - Enough data is available to start playing
     * @zh 视频元素的就绪状态：
     * - 0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息
     * - 1 = HAVE_METADATA - 关于音频/视频就绪的元数据
     * - 2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒
     * - 3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的
     * - 4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放
     */
    get readyState(): any {
        return this.element.readyState;
    }

    /**
     * @en The width of the video source. Available after the ready event is triggered.
     * @zh 视频源宽度。ready 事件触发后可用。
     */
    get videoWidth(): number {
        return this.element.videoWidth;
    }

    /**
     * @en The height of the video source. Available after the ready event is triggered.
     * @zh 视频源高度。ready 事件触发后可用。
     */
    get videoHeight(): number {
        return this.element.videoHeight;
    }

    /**
     * @en The duration of the video in seconds. Available after the ready event is triggered.
     * @zh 视频长度（秒）。ready 事件触发后可用。
     */
    get duration(): number {
        return this.element.duration;
    }

    /**
     * @en If the playback of the audio/video has ended
     * @zh 音频/视频的播放是否已结束
     */
    get ended(): boolean {
        return this.element.ended;
    }

    /**
     * @en Return the MediaError object representing the error state of the audio/video
     * @zh 返回表示音频/视频错误状态的 MediaError 对象
     */
    get error(): MediaError {
        return this.element.error;
    }

    /**
     * @en Whether the audio/video should loop when it reaches the end
     * @zh 音频/视频是否应在结束时重新播放
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
     * @en The current playback speed of the audio/video. For example:
     * - 1.0: Normal speed
     * - 0.5: Half speed (slower)
     * - 2.0: Double speed (faster)
     * - -1.0: Backwards, normal speed
     * - -0.5: Backwards, half speed
     * Note: Only Google Chrome and Safari support the playbackRate property.
     * @zh 音频/视频的当前播放速度。如：
     * - 1.0：正常速度
     * - 0.5：半速（更慢）
     * - 2.0：倍速（更快）
     * - -1.0：向后，正常速度
     * - -0.5：向后，半速
     * 注意：只有 Google Chrome 和 Safari 支持 playbackRate 属性。
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
     * @en The muted state of the video
     * @zh 视频的静音状态
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
     * @en If the video is paused
     * @zh 视频是否暂停
     */
    get paused(): boolean {
        return this.element.paused;
    }

    /**
     * @en The preload attribute of the video. Possible values:
     * - "auto": Indicates that the video should be loaded as soon as the page loads
     * - "metadata": Indicates that only metadata should be loaded when the page loads
     * - "none": Indicates that the video should not be loaded when the page loads
     * @zh 视频的预加载属性。可赋值如下：
     * - "auto"：指示一旦页面加载，则开始加载视频
     * - "metadata"：指示当页面加载后仅加载音频/视频的元数据
     * - "none"：指示页面加载后不应加载音频/视频
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
     * @en see: http://www.w3school.com.cn/tags/av_prop_seekable.asp象
     * @zh 参见：http://www.w3school.com.cn/tags/av_prop_seekable.asp
     */
    get seekable(): any {
        return this.element.seekable;
    }

    /**
     * @en Returns whether the user is currently seeking in the audio/video.
     * Seeking refers to the user moving/jumping to a new position in the audio/video.
     * @zh 返回用户目前是否在音频/视频中寻址。
     * 寻址（Seeking）指的是用户在音频/视频中移动/跳跃到新的位置。
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

    /**
     * @en Destroys the current instance and releases resources.
     * @zh 销毁当前实例并释放资源。
     */
    destroy() {
        if (this.element) {
            if (LayaEnv.isConch) {
                (<any>this.element)._destroy();
            }
            else {
                this.element.pause();
                this.element.src = "";
                while (this.element.childElementCount)
                    this.element.firstChild.remove();
            }
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