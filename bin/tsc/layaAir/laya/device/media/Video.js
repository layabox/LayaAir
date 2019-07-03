import { WebGLVideo } from "./WebGLVideo";
import { Sprite } from "../../display/Sprite";
import { Texture } from "../../resource/Texture";
import { ILaya } from "../../../ILaya";
/**
 * <code>Video</code>将视频显示到Canvas上。<code>Video</code>可能不会在所有浏览器有效。
 * <p>关于Video支持的所有事件参见：<i>http://www.w3school.com.cn/tags/html_ref_audio_video_dom.asp</i>。</p>
 * <p>
 * <b>注意：</b><br/>
 * 在PC端可以在任何时机调用<code>play()</code>因此，可以在程序开始运行时就使Video开始播放。但是在移动端，只有在用户第一次触碰屏幕后才可以调用play()，所以移动端不可能在程序开始运行时就自动开始播放Video。
 * </p>
 *
 * <p>MDN Video链接： <i>https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video</i></p>
 */
export class Video extends Sprite {
    constructor(width = 320, height = 240) {
        super();
        this.htmlVideo = new WebGLVideo();
        this.videoElement = this.htmlVideo.getVideo();
        this.videoElement.layaTarget = this;
        this.internalTexture = new Texture(this.htmlVideo);
        this.videoElement.addEventListener("abort", Video.onAbort);
        this.videoElement.addEventListener("canplay", Video.onCanplay);
        this.videoElement.addEventListener("canplaythrough", Video.onCanplaythrough);
        this.videoElement.addEventListener("durationchange", Video.onDurationchange);
        this.videoElement.addEventListener("emptied", Video.onEmptied);
        this.videoElement.addEventListener("error", Video.onError);
        this.videoElement.addEventListener("loadeddata", Video.onLoadeddata);
        this.videoElement.addEventListener("loadedmetadata", Video.onLoadedmetadata);
        this.videoElement.addEventListener("loadstart", Video.onLoadstart);
        this.videoElement.addEventListener("pause", Video.onPause);
        this.videoElement.addEventListener("play", Video.onPlay);
        this.videoElement.addEventListener("playing", Video.onPlaying);
        this.videoElement.addEventListener("progress", Video.onProgress);
        this.videoElement.addEventListener("ratechange", Video.onRatechange);
        this.videoElement.addEventListener("seeked", Video.onSeeked);
        this.videoElement.addEventListener("seeking", Video.onSeeking);
        this.videoElement.addEventListener("stalled", Video.onStalled);
        this.videoElement.addEventListener("suspend", Video.onSuspend);
        this.videoElement.addEventListener("timeupdate", Video.onTimeupdate);
        this.videoElement.addEventListener("volumechange", Video.onVolumechange);
        this.videoElement.addEventListener("waiting", Video.onWaiting);
        this.videoElement.addEventListener("ended", this.onPlayComplete['bind'](this));
        this.size(width, height);
        if (ILaya.Browser.onMobile) {
            this.onDocumentClick = this.onDocumentClick.bind(this);
            ILaya.Browser.document.addEventListener("touchend", this.onDocumentClick);
        }
    }
    static onAbort(e) { e.target.layaTarget.event("abort"); }
    static onCanplay(e) { e.target.layaTarget.event("canplay"); }
    static onCanplaythrough(e) { e.target.layaTarget.event("canplaythrough"); }
    static onDurationchange(e) { e.target.layaTarget.event("durationchange"); }
    static onEmptied(e) { e.target.layaTarget.event("emptied"); }
    static onError(e) { e.target.layaTarget.event("error"); }
    static onLoadeddata(e) { e.target.layaTarget.event("loadeddata"); }
    static onLoadedmetadata(e) { e.target.layaTarget.event("loadedmetadata"); }
    static onLoadstart(e) { e.target.layaTarget.event("loadstart"); }
    static onPause(e) { e.target.layaTarget.event("pause"); }
    static onPlay(e) { e.target.layaTarget.event("play"); }
    static onPlaying(e) { e.target.layaTarget.event("playing"); }
    static onProgress(e) { e.target.layaTarget.event("progress"); }
    static onRatechange(e) { e.target.layaTarget.event("ratechange"); }
    static onSeeked(e) { e.target.layaTarget.event("seeked"); }
    static onSeeking(e) { e.target.layaTarget.event("seeking"); }
    static onStalled(e) { e.target.layaTarget.event("stalled"); }
    static onSuspend(e) { e.target.layaTarget.event("suspend"); }
    static onTimeupdate(e) { e.target.layaTarget.event("timeupdate"); }
    static onVolumechange(e) { e.target.layaTarget.event("volumechange"); }
    static onWaiting(e) { e.target.layaTarget.event("waiting"); }
    onPlayComplete(e) {
        this.event("ended");
        if (!ILaya.Render.isConchApp || !this.videoElement || !this.videoElement.loop)
            ILaya.timer.clear(this, this.renderCanvas);
    }
    /**
     * 设置播放源。
     * @param url	播放源路径。
     */
    load(url) {
        // Camera
        if (url.indexOf("blob:") == 0)
            this.videoElement.src = url;
        else
            this.htmlVideo.setSource(url, Video.MP4);
    }
    /**
     * 开始播放视频。
     */
    play() {
        this.videoElement.play();
        ILaya.timer.frameLoop(1, this, this.renderCanvas);
    }
    /**
     * 暂停视频播放。
     */
    pause() {
        this.videoElement.pause();
        ILaya.timer.clear(this, this.renderCanvas);
    }
    /**
     * 重新加载视频。
     */
    reload() {
        this.videoElement.load();
    }
    /**
     * 检测是否支持播放指定格式视频。
     * @param type	参数为Video.MP4 / Video.OGG / Video.WEBM之一。
     * @return 表示支持的级别。可能的值：
     * <ul>
     * <li>"probably"，Video.SUPPORT_PROBABLY - 浏览器最可能支持该音频/视频类型</li>
     * <li>"maybe"，Video.SUPPORT_MAYBY - 浏览器也许支持该音频/视频类型</li>
     * <li>""，Video.SUPPORT_NO- （空字符串）浏览器不支持该音频/视频类型</li>
     * </ul>
     */
    canPlayType(type) {
        var typeString;
        switch (type) {
            case Video.MP4:
                typeString = "video/mp4";
                break;
            case Video.OGG:
                typeString = "video/ogg";
                break;
            case Video.WEBM:
                typeString = "video/webm";
                break;
        }
        return this.videoElement.canPlayType(typeString);
    }
    renderCanvas() {
        if (this.readyState === 0)
            return;
        this.htmlVideo['updateTexture']();
        this.graphics.clear();
        this.graphics.drawTexture(this.internalTexture, 0, 0, this.width, this.height);
    }
    onDocumentClick() {
        this.videoElement.play();
        this.videoElement.pause();
        ILaya.Browser.document.removeEventListener("touchend", this.onDocumentClick);
    }
    /**
     * buffered 属性返回 TimeRanges(JS)对象。TimeRanges 对象表示用户的音视频缓冲范围。缓冲范围指的是已缓冲音视频的时间范围。如果用户在音视频中跳跃播放，会得到多个缓冲范围。
     * <p>buffered.length返回缓冲范围个数。如获取第一个缓冲范围则是buffered.start(0)和buffered.end(0)。以秒计。</p>
     * @return TimeRanges(JS)对象
     */
    get buffered() {
        return this.videoElement.buffered;
    }
    /**
     * 获取当前播放源路径。
     */
    get currentSrc() {
        return this.videoElement.currentSrc;
    }
    /**
     * 设置和获取当前播放头位置。
     */
    get currentTime() {
        return this.videoElement.currentTime;
    }
    set currentTime(value) {
        this.videoElement.currentTime = value;
        this.renderCanvas();
    }
    /**
     * 设置和获取当前音量。
     */
    set volume(value) {
        this.videoElement.volume = value;
    }
    get volume() {
        return this.videoElement.volume;
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
    get readyState() {
        return this.videoElement.readyState;
    }
    /**
     * 获取视频源尺寸。ready事件触发后可用。
     */
    get videoWidth() {
        return this.videoElement.videoWidth;
    }
    get videoHeight() {
        return this.videoElement.videoHeight;
    }
    /**
     * 获取视频长度（秒）。ready事件触发后可用。
     */
    get duration() {
        return this.videoElement.duration;
    }
    /**
     * 返回音频/视频的播放是否已结束
     */
    get ended() {
        return this.videoElement.ended;
    }
    /**
     * 返回表示音频/视频错误状态的 MediaError（JS）对象。
     */
    get error() {
        return this.videoElement.error;
    }
    /**
     * 设置或返回音频/视频是否应在结束时重新播放。
     */
    get loop() {
        return this.videoElement.loop;
    }
    set loop(value) {
        this.videoElement.loop = value;
    }
    /**
     * 设置视频的x坐标
     */
    /*override*/ set x(val) {
        super.x = val;
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.style.left = transform.x;
        }
    }
    get x() {
        return super.x;
    }
    /**
     * 设置视频的y坐标
     */
    /*override*/ set y(val) {
        super.y = val;
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.style.top = transform.y;
        }
    }
    get y() {
        return super.y;
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
    get playbackRate() {
        return this.videoElement.playbackRate;
    }
    set playbackRate(value) {
        this.videoElement.playbackRate = value;
    }
    /**
     * 获取和设置静音状态。
     */
    get muted() {
        return this.videoElement.muted;
    }
    set muted(value) {
        this.videoElement.muted = value;
    }
    /**
     * 返回视频是否暂停
     */
    get paused() {
        return this.videoElement.paused;
    }
    /**
     * preload 属性设置或返回是否在页面加载后立即加载视频。可赋值如下：
     * <ul>
     * <li>auto	指示一旦页面加载，则开始加载视频。</li>
     * <li>metadata	指示当页面加载后仅加载音频/视频的元数据。</li>
     * <li>none	指示页面加载后不应加载音频/视频。</li>
     * </ul>
     */
    get preload() {
        return this.videoElement.preload;
    }
    set preload(value) {
        this.videoElement.preload = value;
    }
    /**
     * 参见 <i>http://www.w3school.com.cn/tags/av_prop_seekable.asp</i>。
     */
    get seekable() {
        return this.videoElement.seekable;
    }
    /**
     * seeking 属性返回用户目前是否在音频/视频中寻址。
     * 寻址中（Seeking）指的是用户在音频/视频中移动/跳跃到新的位置。
     */
    get seeking() {
        return this.videoElement.seeking;
    }
    /*override*/ size(width, height) {
        super.size(width, height);
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.width = width * transform.scaleX;
        }
        else {
            this.videoElement.width = width / ILaya.Browser.pixelRatio;
        }
        if (this.paused)
            this.renderCanvas();
        return this;
    }
    /*override*/ set width(value) {
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.width = value * transform.scaleX;
        }
        else {
            this.videoElement.width = this.width / ILaya.Browser.pixelRatio;
        }
        super.width = value;
        if (this.paused)
            this.renderCanvas();
    }
    get width() {
        return super.width;
    }
    /*override*/ set height(value) {
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.height = value * transform.scaleY;
        }
        else {
            this.videoElement.height = this.height / ILaya.Browser.pixelRatio;
        }
        super.height = value;
    }
    get height() {
        return super.height;
    }
    /**
     * 销毁内部事件绑定。
     */
    /*override*/ destroy(detroyChildren = true) {
        super.destroy(detroyChildren);
        this.videoElement.removeEventListener("abort", Video.onAbort);
        this.videoElement.removeEventListener("canplay", Video.onCanplay);
        this.videoElement.removeEventListener("canplaythrough", Video.onCanplaythrough);
        this.videoElement.removeEventListener("durationchange", Video.onDurationchange);
        this.videoElement.removeEventListener("emptied", Video.onEmptied);
        this.videoElement.removeEventListener("error", Video.onError);
        this.videoElement.removeEventListener("loadeddata", Video.onLoadeddata);
        this.videoElement.removeEventListener("loadedmetadata", Video.onLoadedmetadata);
        this.videoElement.removeEventListener("loadstart", Video.onLoadstart);
        this.videoElement.removeEventListener("pause", Video.onPause);
        this.videoElement.removeEventListener("play", Video.onPlay);
        this.videoElement.removeEventListener("playing", Video.onPlaying);
        this.videoElement.removeEventListener("progress", Video.onProgress);
        this.videoElement.removeEventListener("ratechange", Video.onRatechange);
        this.videoElement.removeEventListener("seeked", Video.onSeeked);
        this.videoElement.removeEventListener("seeking", Video.onSeeking);
        this.videoElement.removeEventListener("stalled", Video.onStalled);
        this.videoElement.removeEventListener("suspend", Video.onSuspend);
        this.videoElement.removeEventListener("timeupdate", Video.onTimeupdate);
        this.videoElement.removeEventListener("volumechange", Video.onVolumechange);
        this.videoElement.removeEventListener("waiting", Video.onWaiting);
        this.videoElement.removeEventListener("ended", this.onPlayComplete);
        this.pause();
        this.videoElement.layaTarget = null;
        this.videoElement = null;
        this.htmlVideo.destroy();
    }
    syncVideoPosition() {
        var stage = ILaya.stage;
        var rec;
        rec = ILaya.Utils.getGlobalPosAndScale(this);
        var a = stage._canvasTransform.a, d = stage._canvasTransform.d;
        var x = rec.x * stage.clientScaleX * a + stage.offset.x;
        var y = rec.y * stage.clientScaleY * d + stage.offset.y;
        this.videoElement.style.left = x + 'px';
        ;
        this.videoElement.style.top = y + 'px';
        this.videoElement.width = this.width / ILaya.Browser.pixelRatio;
        this.videoElement.height = this.height / ILaya.Browser.pixelRatio;
    }
}
Video.MP4 = 1;
Video.OGG = 2;
Video.CAMERA = 4;
Video.WEBM = 8;
/** 表示最有可能支持。 */
Video.SUPPORT_PROBABLY = "probably";
/** 表示可能支持。*/
Video.SUPPORT_MAYBY = "maybe";
/** 表示不支持。 */
Video.SUPPORT_NO = "";
