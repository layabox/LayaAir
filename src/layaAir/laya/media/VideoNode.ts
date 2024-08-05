import { Sprite } from "../display/Sprite";
import { Texture } from "../resource/Texture";
import { ILaya } from "../../ILaya";
import { Browser } from "../utils/Browser";
import { VideoTexture } from "./VideoTexture";
import { LayaEnv } from "../../LayaEnv";
import { SpriteUtils } from "../utils/SpriteUtils";
import { Event } from "../events/Event";

/**
 * @en VideoNode displays video on Canvas. Video may not be effective in all browsers.
 * For all events supported by Video, see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
 * Note:
 * On PC, you can call play() at any time, so the Video can start playing as soon as the program starts running. 
 * However, on mobile devices, play() can only be called after the user's first touch on the screen, so it's not possible to automatically start playing Video when the program starts running on mobile devices.
 * MDN Video link: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
 * @zh VideoNode将视频显示到Canvas上。Video可能不会在所有浏览器有效。
 * 关于Video支持的所有事件，请参见：https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
 * 注意：
 * 在PC端可以在任何时机调用play()，因此可以在程序开始运行时就使Video开始播放。
 * 但是在移动端，只有在用户第一次触碰屏幕后才可以调用play()，所以移动端不可能在程序开始运行时就自动开始播放Video。
 * MDN Video链接：https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
 */
export class VideoNode extends Sprite {
    private _videoTexture: VideoTexture;
    private _internalTex: Texture;

    constructor() {
        super();

        this.texture = this._internalTex = new Texture();

        if (LayaEnv.isPlaying && ILaya.Browser.onMobile) {
            let func = () => {
                ILaya.Browser.document.removeEventListener("touchend", func);

                if (!this._videoTexture)
                    return;

                if (Browser.onIOS) {
                    this._videoTexture.load();
                } else {
                    this._videoTexture.play();
                    this._videoTexture.pause();
                }
            }

            ILaya.Browser.document.addEventListener("touchend", func);
        }
    }

    /**
     * @en Video texture
     * @zh 视频纹理
     */
    get videoTexture(): VideoTexture {
        return this._videoTexture;
    }

    set videoTexture(value: VideoTexture) {
        if (this._videoTexture) {
            this._videoTexture._removeReference();
            this._videoTexture.off(Event.READY, this, this.onVideoMetaLoaded);
            this._videoTexture.off(VideoTexture.videoEvent_update, this, this._repaintCachAs);
        }

        this._videoTexture = value;
        if (value) {
            this._videoTexture._addReference();
            this._videoTexture.on(Event.READY, this, this.onVideoMetaLoaded);
            if (this._videoTexture._isLoaded)
                this._internalTex.setTo(this._videoTexture);
        }
        else {
            this._internalTex.setTo(null);
        }
        this._checkCachAs();
    }

    /**
     * @en Video source
     * @zh 视频源
     */
    get source() {
        return this._videoTexture?.source;
    }

    set source(value: string) {
        if (value) {
            if (!this._videoTexture)
                this.videoTexture = new VideoTexture();
            this._videoTexture.source = value;
        }
        else if (this._videoTexture)
            this._videoTexture.source = value;
        this._checkCachAs();
    }


    private _checkCachAs() {
        if (this.videoTexture != null)
            this.videoTexture.on(VideoTexture.videoEvent_update, this, this._repaintCachAs);
    }

    private _repaintCachAs() {
        if (this.cacheAs != "none" || (!!this._getCacheStyle().mask)) {
            this.repaint();
        }
    }



    /**
     * @en Set playback source
     * @param url Play source path.
     * @zh 设置播放源。
     * @param url 播放源路径。
     */
    load(url: string): void {
        this.source = url;
    }

    /**
     * @en Start playing the video
     * @zh 开始播放视频
     */
    play(): void {
        if (!this._videoTexture)
            return;

        this._videoTexture.play();
    }

    /**
     * @en Pause video playback
     * @zh 暂停视频播放
     */
    pause(): void {
        if (!this._videoTexture)
            return;
        this._videoTexture.pause();
    }

    /**
     * @en Reload the video
     * @zh 重新加载视频
     */
    reload(): void {
        if (!this._videoTexture)
            return;

        this._videoTexture.load();
    }

    /**
     * @en Check if the specified video format is supported for playback.
     * @param type The video format type, such as "mp4", "ogg", "webm", "m3u8", etc.
     * @returns The level of support. Possible values:
     * - "probably": The browser most likely supports this audio/video type
     * - "maybe": The browser might support this audio/video type
     * - "": (empty string) The browser does not support this audio/video type
     * @zh 检测是否支持播放指定格式视频。
     * @param type	视频格式类型，如 "mp4"、"ogg"、"webm"、"m3u8" 等。
     * @returns 表示支持的级别。可能的值：
     * - "probably"：浏览器最可能支持该音频/视频类型
     * - "maybe"：浏览器也许支持该音频/视频类型
     * - ""：（空字符串）浏览器不支持该音频/视频类型
     */
    canPlayType(type: string): CanPlayTypeResult {
        if (!this._videoTexture)
            this.videoTexture = new VideoTexture();
        return this._videoTexture.canPlayType(type);
    }

    private onVideoMetaLoaded(): void {
        this._internalTex.setTo(this._videoTexture);
    }

    /**
     * @en Get the TimeRanges object representing the buffered parts of the video.
     * The TimeRanges object represents the time ranges of the buffered audio/video. If the user jumps to different parts of the audio/video, multiple buffer ranges may be created.
     * buffered.length returns the number of buffer ranges.
     * To get the first buffer range, use buffered.start(0) and buffered.end(0). Values are in seconds.
     * @returns TimeRanges object
     * @zh 获取表示视频已缓冲部分的 TimeRanges 对象。
     * TimeRanges 对象表示用户的音视频缓冲范围。缓冲范围指的是已缓冲音视频的时间范围。如果用户在音视频中跳跃播放，会得到多个缓冲范围。
     * buffered.length 返回缓冲范围个数。
     * 如获取第一个缓冲范围则是 buffered.start(0) 和 buffered.end(0)。以秒计。
     * @returns TimeRanges 对象
     */
    get buffered(): any {
        return this._videoTexture?.buffered;
    }

    /**
     * @en The current video source path.
     * @zh 当前播放源路径。
     */
    get currentSrc(): string {
        return this._videoTexture?.currentSrc;
    }

    /**
     * @en The current playback position in seconds.
     * @zh 当前播放头位置（以秒为单位）。
     */
    get currentTime(): number {
        return this._videoTexture?.currentTime;
    }

    set currentTime(value: number) {
        if (!this._videoTexture)
            return;

        this._videoTexture.currentTime = value;
    }

    /**
     * @en The current volume level.
     * @zh 当前音量。
     */
    get volume(): number {
        return this._videoTexture?.volume;
    }

    set volume(value: number) {
        if (!this._videoTexture)
            return;
        this._videoTexture.volume = value;
    }

    /**
     * @en The ready state of the video element:
     * - 0 = HAVE_NOTHING - No information is available about the audio/video readiness
     * - 1 = HAVE_METADATA - Metadata about the audio/video is ready
     * - 2 = HAVE_CURRENT_DATA - Data for the current playback position is available, but not enough to play the next frame/millisecond
     * - 3 = HAVE_FUTURE_DATA - Data for the current and at least the next frame is available
     * - 4 = HAVE_ENOUGH_DATA - Enough data is available to begin playback
     * @zh 视频元素的就绪状态：
     * - 0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息
     * - 1 = HAVE_METADATA - 关于音频/视频就绪的元数据
     * - 2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒
     * - 3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的
     * - 4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放
     */
    get readyState(): any {
        return this._videoTexture?.readyState;
    }

    /**
     * @en The video source width. Available after the ready event is triggered.
     * @zh 视频源宽度。ready 事件触发后可用。
     */
    get videoWidth(): number {
        return this._videoTexture?.videoWidth;
    }

    /**
     * @en The video source height. Available after the ready event is triggered.
     * @zh 视频源高度。ready 事件触发后可用。
     */
    get videoHeight(): number {
        return this._videoTexture?.videoHeight;
    }

    /**
     * @en The video duration in seconds. Available after the ready event is triggered.
     * @zh 视频长度（秒）。ready 事件触发后可用。
     */
    get duration(): number {
        return this._videoTexture?.duration;
    }

    /**
     * @en Returns whether the playback of the audio/video has ended.
     * @zh 返回音频/视频的播放是否已结束。
     */
    get ended(): boolean {
        return this._videoTexture?.ended;
    }

    /**
     * @en Returns a MediaError object representing the audio/video error state.
     * @zh 返回表示音频/视频错误状态的 MediaError 对象。
     */
    get error(): MediaError {
        return this._videoTexture?.error;
    }

    /**
     * @en Whether the audio/video should loop when it ends.
     * @zh 音频/视频是否应在结束时重新播放。
     */
    get loop(): boolean {
        return this._videoTexture?.loop;
    }

    set loop(value: boolean) {
        if (!this._videoTexture)
            return;
        this._videoTexture.loop = value;
    }

    /**
     * @en The current playback speed of the audio/video. For example:
     * - 1.0: Normal speed
     * - 0.5: Half speed (slower)
     * - 2.0: Double speed (faster)
     * - -1.0: Backwards, normal speed
     * - -0.5: Backwards, half speed
     * Note: Only Google Chrome and Safari support the playbackRate property.
     * @zh 音频/视频的当前播放速度。例如：
     * - 1.0：正常速度
     * - 0.5：半速（更慢）
     * - 2.0：倍速（更快）
     * - -1.0：向后，正常速度
     * - -0.5：向后，半速
     * 注意：只有 Google Chrome 和 Safari 支持 playbackRate 属性。
     */
    get playbackRate(): number {
        return this._videoTexture?.playbackRate;
    }

    set playbackRate(value: number) {
        if (!this._videoTexture)
            return;
        this._videoTexture.playbackRate = value;
    }

    /**
     * @en The muted state of the video.
     * @zh 视频的静音状态。
     */
    get muted(): boolean {
        return this._videoTexture?.muted;
    }

    set muted(value: boolean) {
        if (!this._videoTexture)
            return;
        this._videoTexture.muted = value;
    }

    /**
     * @en If the video is paused.
     * @zh 视频是否暂停。
     */
    get paused(): boolean {
        return this._videoTexture?.paused;
    }

    /**
     * @en The preload attribute. This specifies how the video should be loaded when the page loads.
     * Possible values:
     * - "auto": Indicates that the video should be loaded entirely when the page loads.
     * - "metadata": Indicates that only metadata should be loaded when the page loads.
     * - "none": Indicates that the video should not be loaded when the page loads.
     * @zh preload 属性。这指定了页面加载时应如何加载视频。
     * 可能的值：
     * - "auto"：指示一旦页面加载，则开始加载整个视频。
     * - "metadata"：指示当页面加载后仅加载音频/视频的元数据。
     * - "none"：指示页面加载后不应加载音频/视频。
     */
    get preload(): string {
        return this._videoTexture?.preload;
    }

    set preload(value: string) {
        if (!this._videoTexture)
            return;
        //@ts-ignore
        this._videoTexture.preload = value;
    }

    /**
     * @en See also: http://www.w3school.com.cn/tags/av_prop_controls.asp
     * @zh 参见 http://www.w3school.com.cn/tags/av_prop_seekable.asp
     */
    get seekable(): any {
        return this._videoTexture?.seekable;
    }

    /**
     * @en Check if the user is currently seeking in the audio/video.
     * Seeking means that the user is moving/skipping to a new position in the audio/video.
     * @zh 检查用户当前是否正在音频/视频中寻址。
     * 寻址指的是用户在音频/视频中移动/跳跃到新的位置。
     */
    get seeking(): boolean {
        return this._videoTexture?.seeking;
    }

    /**
     * @internal
     * @override
     */
    _setX(value: number): void {
        super._setX(value);
        if (this._videoTexture && LayaEnv.isConch) {
            var transform: any = SpriteUtils.getTransformRelativeToWindow(this, 0, 0);
            this._videoTexture.element.style.left = transform.x;
        }
    }

    /**
     * @internal
     * @override
     */
    _setY(value: number): void {
        super._setY(value);
        if (this._videoTexture && LayaEnv.isConch) {
            var transform: any = SpriteUtils.getTransformRelativeToWindow(this, 0, 0);
            this._videoTexture.element.style.top = transform.y;
        }
    }

    /**
     * @internal
     * @override
     */
    set_width(value: number): void {
        super.set_width(value);

        if (!this._videoTexture)
            return;
        if (LayaEnv.isConch) {
            var transform: any = SpriteUtils.getTransformRelativeToWindow(this, 0, 0);
            this._videoTexture.element.width = value * transform.scaleX;
        }
        else {
            this._videoTexture.element.width = this.width / ILaya.Browser.pixelRatio;
        }
    }

    /**
     * @internal
     * @override
     */
    set_height(value: number) {
        super.set_height(value);

        if (!this._videoTexture)
            return;
        if (LayaEnv.isConch) {
            var transform: any = SpriteUtils.getTransformRelativeToWindow(this, 0, 0);
            this._videoTexture.element.height = value * transform.scaleY;

        }
        else {
            this._videoTexture.element.height = this.height / ILaya.Browser.pixelRatio;
        }
    }

    /**
     * @override
     * @en Destroy the internal event bindings and optionally destroy child nodes
     * @param destroyChildren Whether to destroy child nodes
     * @zh 销毁内部事件绑定，并可选择是否删除子节点
     * @param destroyChildren 是否删除子节点
     */
    destroy(detroyChildren: boolean = true): void {
        this.videoTexture = null;
        super.destroy(detroyChildren);
    }
}