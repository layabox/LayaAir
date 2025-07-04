import { BaseTexture } from "../resource/BaseTexture";
import { ILaya } from "../../ILaya";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { Texture2D } from "../resource/Texture2D";
import { Browser } from "../utils/Browser";
import { LayaGL } from "../layagl/LayaGL";
import { Event } from "../events/Event";
import { PAL } from "../platform/PlatformAdapters";
import { LayaEnv } from "../../LayaEnv";
import { AssetDb } from "../resource/AssetDb";

/**
 * @en Video texture class, used to create video textures.
 * @zh 视频纹理
 * @blueprintIgnoreSubclasses
 */
export class VideoTexture extends BaseTexture {
    /**
     * @en Whether to allow the video to continue playing in the background。
     * @zh 视频是否允许在后台继续播放。
     */
    allowBackground: boolean = false;

    protected _source: string;
    protected _playing: boolean = false;
    protected _loaded: boolean = false;
    protected _frameRender: boolean = true;
    protected _interval: number = 0;
    protected _lastTimer: number = 0;
    protected _frameRate: number = 0;
    protected _useMediaFrameRate: boolean = true;
    protected _loop: boolean = false;

    /** @internal */
    _autoResume: boolean = false;

    /**
     * @en Create a video texture instance. You need to create a video texture in this way. You cannot directly use the new VideoTexture() method to create it.
     * @zh 创建一个视频纹理实例，需要通过这种方式创建视频纹理，不能直接使用new VideoTexture()的方式创建。
     * @returns 
     */
    static createInstance(): VideoTexture {
        return PAL.media.createVideoTexture();
    }

    /**
     * @ignore
     */
    constructor() {
        super(1, 1, RenderTargetFormat.R8G8B8);

        this._dimension = TextureDimension.Tex2D;
    }

    /**
     * @en The frame rate of the video texture, which indicates the number of renderings in one second. It only takes effect when useMediaFrameRate is false or the current platform does not support obtaining the video frame rate.
     * @zh 视频纹理更新帧率，表示一秒内的渲染次数。只有useMediaFrameRate为false或者当前平台不支持获取视频自身帧率时才生效。
     */
    get frameRate() {
        return this._frameRate;
    }

    set frameRate(value: number) {
        if (value < 0.001)
            this._interval = 0;
        else
            this._interval = 1000 / value;
        this._frameRate = value;
    }

    /**
     * @en Whether to use the video itself frame rate to update the texture, default is true.
     * @zh 是否使用视频自身的帧率来更新纹理，默认true。
     */
    get useMediaFrameRate() {
        return this._useMediaFrameRate;
    }

    set useMediaFrameRate(value: boolean) {
        this._useMediaFrameRate = value;
    }

    /**
     * @en Whether to call the render function internally. If not, the user needs to call the render function manually. Default is true.
     * @zh 是否内部驱动调用render函数。如果否，则需要用户自行调用render函数。默认true。
     */
    get frameRender() {
        return this._frameRender;
    }

    set frameRender(value: boolean) {
        if (this._loaded) {
            if (this._frameRender && !value)
                ILaya.timer.clear(this, this.render);
            if (!this._frameRender && value && this._playing)
                ILaya.timer.frameLoop(1, this, this.render);
        }
        this._frameRender = value;
    }

    /**
     * @en The source URL for the video
     * @zh 视频的源 URL
     */
    get source(): string {
        return this._source;
    }

    set source(url: string) {
        this.load(url);
    }

    /**
     * @en The current playback position in seconds
     * @zh 当前播放头位置（以秒为单位）
     */
    get currentTime(): number {
        return 0;
    }

    set currentTime(value: number) {
    }

    /**
     * @en The current volume level
     * @zh 当前音量
     */
    get volume(): number {
        return 0;
    }

    set volume(value: number) {
    }

    /**
     * @en The muted state of the video
     * @zh 视频的静音状态
     */
    get muted(): boolean {
        return false;
    }

    set muted(value: boolean) {
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
    get readyState(): number {
        return 0;
    }

    /**
     * @en The width of the video source. Available after the ready event is triggered.
     * @zh 视频源宽度。ready 事件触发后可用。
     */
    get videoWidth(): number {
        return this._width;
    }

    /**
     * @en The height of the video source. Available after the ready event is triggered.
     * @zh 视频源高度。ready 事件触发后可用。
     */
    get videoHeight(): number {
        return this._height;
    }

    /**
     * @en The duration of the video in seconds. Available after the ready event is triggered.
     * @zh 视频长度（秒）。ready 事件触发后可用。
     */
    get duration(): number {
        return 0;
    }

    /**
     * @en If the playback of the audio/video has ended
     * @zh 音频/视频的播放是否已结束
     */
    get ended(): boolean {
        return false;
    }

    /**
     * @en Whether the audio/video should loop when it reaches the end
     * @zh 音频/视频是否应在结束时重新播放
     */
    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
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
        return 1;
    }

    set playbackRate(value: number) {
    }

    /**
     * @en If the video is paused
     * @zh 视频是否暂停
     */
    get paused(): boolean {
        return false;
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
        return PAL.media.canPlayType(type);
    }

    protected setLoaded(width: number, height: number, rgba: boolean) {
        this._width = width;
        this._height = height;
        this._loaded = true;

        if (this._texture)
            this._texture.dispose();
        this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, width, height, rgba ? TextureFormat.R8G8B8A8 : TextureFormat.R8G8B8, false, false, false);
        this.wrapModeU = WrapMode.Clamp;
        this.wrapModeV = WrapMode.Clamp;
        this.filterMode = FilterMode.Bilinear;
        LayaGL.textureContext.initVideoTextureData(this._texture);
        this._texture.gammaCorrection = 2.2;//这里使用srgb会变得特别的卡，所以srgb的转换放入Shader中进行

        if (this._frameRender && this._playing)
            ILaya.timer.frameLoop(1, this, this.render);

        if (this._playing)
            this.onPlay();

        this.event(Event.READY, this);
    }

    /**
     * @internal
     */
    render(force?: boolean) {
        if (!this._loaded)
            return;

        if (!this._useMediaFrameRate && !force) {
            let timer = Browser.now();
            if (timer - this._lastTimer < this._interval)
                return;
        }

        if (this.onRender())
            this.event("videoUpdate");
    }

    /**
     * @en Load the video texture. 
     * @param url Video URL
     * @zh 加载视频纹理。
     * @param url 视频 URL
     */
    load(url: string) {
        this._source = url;
        if (url) {
            AssetDb.inst.resolveURL(url, url2 => {
                if (this._source === url)
                    this.onLoad(url2);
            });
        }
        else
            this.pause();
    }

    /**
     * @en Start playing the video
     * @zh 开始播放视频
     */
    play() {
        if (this._playing || !LayaEnv.isPlaying)
            return;

        this._playing = true;
        ILaya.stage.on(Event.BLUR, this, this.onBlur);

        if (this._loaded) {
            if (this._frameRender)
                ILaya.timer.frameLoop(1, this, this.render);
            this.onPlay();
        }
    }

    /**
     * @en Pause the video playback
     * @zh 暂停播放视频
     */
    pause() {
        this._autoResume = false;

        if (!this._playing)
            return;

        this._playing = false;
        ILaya.stage.off(Event.BLUR, this, this.onBlur);

        ILaya.timer.clear(this, this.render);

        if (this._loaded)
            this.onPause();
    }

    /**
     * @en Resume the video playback
     * @zh 继续播放视频
     */
    resume() {
        this.play();
    }

    /** @internal */
    get gammaCorrection() {
        return 2.2;
    }

    /** @internal */
    _getSource() {
        return this._texture ? this._texture.resource : Texture2D.blackTexture._getSource();
    }

    /** @internal */
    get defaultTexture() {
        return Texture2D.blackTexture;
    }

    /**
     * @en Destroys the current instance and releases resources.
     * @zh 销毁当前实例并释放资源。
     */
    destroy() {
        this._playing = false;
        ILaya.timer.clear(this, this.render);
        ILaya.stage.off(Event.BLUR, this, this.onBlur);
        this.onDestroy();
        super.destroy();
    }

    protected onBlur() {
        if (!this.allowBackground)
            PAL.media.resumeUntilGotFocus(this);
    }

    protected onLoad(url: string) {
    }

    protected onRender(): boolean {
        return false;
    }

    protected onPlay() {
    }

    protected onPause() {
    }

    protected onDestroy() {
    }

    /** @deprecated */
    get currentSrc(): string {
        return this._source;
    }
    /** @deprecated */
    get updateFrame(): number {
        return this.frameRate;
    }
    /** @deprecated */
    set updateFrame(value: number) {
        this.frameRate = value;
    }
    /** @deprecated */
    get useFrame(): boolean {
        return this.useMediaFrameRate;
    }
    /** @deprecated */
    set useFrame(value: boolean) {
        this.useMediaFrameRate = value;
    }
}