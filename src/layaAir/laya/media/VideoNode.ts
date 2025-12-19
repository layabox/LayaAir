import { Sprite } from "../display/Sprite";
import { VideoTexture } from "./VideoTexture";
import { IVideoPlayerOptions, VideoPlayerBackend } from "./VideoPlayerBackend";
import { PAL } from "../platform/PlatformAdapters";
import { VideoPlayer } from "./VideoPlayer";
import { HideFlags } from "../Const";

/**
 * @en VideoNode displays video on Canvas. Video may not be effective in all platforms.
 * On PC, you can call play() at any time, so the Video can start playing as soon as the program starts running. 
 * However, on mobile devices, play() can only be called after the user's first touch on the screen, so it's not possible to automatically start playing Video when the program starts running on mobile devices.
 * @zh VideoNode将视频显示到Canvas上。Video可能不会在所有平台有效。
 * 在PC端可以在任何时机调用play()，因此可以在程序开始运行时就使Video开始播放。
 * 但是在移动端，只有在用户第一次触碰屏幕后才可以调用play()，所以移动端不可能在程序开始运行时就自动开始播放Video。
 */
export class VideoNode extends Sprite {
    private _comp: VideoPlayer;

    /** @ignore */
    constructor() {
        super();

        this._comp = this.addComponent(VideoPlayer);
        this._comp.hideFlags |= HideFlags.HideAndDontSave;
    }

    /**
     * @en Video player options. These options need to be set before setting the source, and if you change the settings, you need to reset the source.
     * @zh 视频播放器选项。这些选项需要在设置source前设置好，如果更改设置，需要重新设置source。
     */
    get options(): IVideoPlayerOptions {
        return this._comp.options;
    }

    /**
     * @zh 视频播放模式。如果设置的模式不支持，会尝试使用另外一种模式。
     * -- player: 使用播放器。这时播放器是浮动在主画布上面（或下面）的，不能与嵌套在UI层级中。
     * -- decoder: 使用解码器。视频会被捕获到Texture再显示，因此可以嵌套在UI层级中。
     * @en Video playback mode. If the set mode is not supported, it will try to use another mode.
     * -- player: Use the player. The player is floating above (or below) the main canvas and cannot be nested in the UI hierarchy.
     * -- decoder: Use the decoder. The video is captured to a Texture and then displayed, so it can be nested in the UI hierarchy.
     */
    get mode(): "player" | "decoder" {
        return this._comp.mode;
    }

    set mode(value: "player" | "decoder") {
        this._comp.mode = value;
    }

    /**
     * @en Video player
     * @zh 视频播放器
     */
    get player(): VideoPlayerBackend | VideoTexture | null {
        return this._comp.player;
    }

    /**
     * @en Video source
     * @zh 视频源
     */
    get source() {
        return this._comp.source;
    }

    set source(value: string) {
        this._comp.source = value;
    }

    /**
     * @en Whether to automatically play the video after loading. Default is true.
     * @zh 视频加载完成后是否自动播放。默认值为true。
     */
    get autoPlay(): boolean {
        return this._comp.autoPlay;
    }

    set autoPlay(value: boolean) {
        this._comp.autoPlay = value;
    }

    /**
     * @en Whether to allow background playback. Default is false.
     * @zh 是否允许后台播放。默认值为false。
     */
    get allowBackground(): boolean {
        return this._comp.allowBackground;
    }

    set allowBackground(value: boolean) {
        this._comp.allowBackground = value;
    }

    /**
     * @en The current playback position in seconds.
     * @zh 当前播放头位置（以秒为单位）。
     */
    get currentTime(): number {
        return this._comp.currentTime;
    }

    set currentTime(value: number) {
        this._comp.currentTime = value;
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
    get readyState(): number {
        return this._comp.readyState;
    }

    /**
     * @en The video source width. Available after the ready event is triggered.
     * @zh 视频源宽度。ready 事件触发后可用。
     */
    get videoWidth(): number {
        return this._comp.videoWidth;
    }

    /**
     * @en The video source height. Available after the ready event is triggered.
     * @zh 视频源高度。ready 事件触发后可用。
     */
    get videoHeight(): number {
        return this._comp.videoHeight;
    }

    /**
     * @en The video duration in seconds. Available after the ready event is triggered.
     * @zh 视频长度（秒）。ready 事件触发后可用。
     */
    get duration(): number {
        return this._comp.duration;
    }

    /**
     * @en Returns whether the playback of the audio/video has ended.
     * @zh 返回音频/视频的播放是否已结束。
     */
    get ended(): boolean {
        return this._comp.ended;
    }

    /**
     * @en Whether the video should loop when it ends.
     * @zh 视频是否应在结束时重新播放。
     */
    get loop(): boolean {
        return this._comp.loop;
    }

    set loop(value: boolean) {
        this._comp.loop = value;
    }

    /**
     * @en The current playback speed of the video. For example:
     * - 1.0: Normal speed
     * - 0.5: Half speed (slower)
     * - 2.0: Double speed (faster)
     * - -1.0: Backwards, normal speed
     * - -0.5: Backwards, half speed
     * Note: Only Google Chrome and Safari support the playbackRate property.
     * @zh 视频的当前播放速度。例如：
     * - 1.0：正常速度
     * - 0.5：半速（更慢）
     * - 2.0：倍速（更快）
     * - -1.0：向后，正常速度
     * - -0.5：向后，半速
     * 注意：只有 Google Chrome 和 Safari 支持 playbackRate 属性。
     */
    get playbackRate(): number {
        return this._comp.playbackRate;
    }

    set playbackRate(value: number) {
        this._comp.playbackRate = value;
    }

    /**
     * @en The current volume level.
     * @zh 当前音量。
     */
    get volume(): number {
        return this._comp.volume;
    }

    set volume(value: number) {
        this._comp.volume = value;
    }

    /**
     * @en The muted state of the video.
     * @zh 视频的静音状态。
     */
    get muted(): boolean {
        return this._comp.muted;
    }

    set muted(value: boolean) {
        this._comp.muted = value;
    }

    /**
     * @en If the video is paused.
     * @zh 视频是否暂停。
     */
    get paused(): boolean {
        return this._comp.paused;
    }

    /**
     * @en Set playback source
     * @param url Play source path.
     * @zh 设置播放源。
     * @param url 播放源路径。
     */
    load(url: string): void {
        this._comp.source = url;
    }

    /**
     * @en Start playing the video
     * @zh 开始播放视频
     */
    play(): void {
        this._comp.play();
    }

    /**
     * @en Pause video playback
     * @zh 暂停视频播放
     */
    pause(): void {
        this._comp.pause();
    }

    /**
     * @en Reload the video
     * @zh 重新加载视频
     */
    reload(): void {
        this._comp.source = this._comp.source;
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
        return PAL.media.canPlayType(type);
    }

    /** @deprecated */
    get currentSrc(): string {
        return this._comp.source;
    }

    /** @deprecated */
    get videoTexture(): VideoTexture | null {
        return this._comp.videoTexture;
    }

    /** @deprecated */
    set videoTexture(value: VideoTexture) {
        if (value)
            this.source = value.source;
        else
            this.source = null;
    }
}