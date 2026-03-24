import { LayaEnv } from "../../LayaEnv";
import { Component } from "../components/Component";
import { DrawTextureCmd } from "../display/cmd/DrawTextureCmd";
import { IGraphicsCmd } from "../display/IGraphics";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { PAL } from "../platform/PlatformAdapters";
import { Texture } from "../resource/Texture";
import { IVideoPlayerOptions, VideoPlayerBackend } from "./VideoPlayerBackend";
import { VideoTexture } from "./VideoTexture";

export class VideoPlayer extends Component {
    /**
     * @en Video player options. These options need to be set before setting the source, and if you change the settings, you need to reset the source.
     * @zh 视频播放器选项。这些选项需要在设置source前设置好，如果更改设置，需要重新设置source。
     */
    readonly options: IVideoPlayerOptions = { controls: false, objectFit: "contain" };

    /**
     * @zh 视频播放模式。如果设置的模式不支持，会尝试使用另外一种模式。
     * -- player: 使用播放器。这时播放器是浮动在主画布上面（或下面）的，不能与嵌套在UI层级中。
     * -- decoder: 使用解码器。视频会被捕获到Texture再显示，因此可以嵌套在UI层级中。
     * @en Video playback mode. If the set mode is not supported, it will try to use another mode.
     * -- player: Use the player. The player is floating above (or below) the main canvas and cannot be nested in the UI hierarchy.
     * -- decoder: Use the decoder. The video is captured to a Texture and then displayed, so it can be nested in the UI hierarchy.
     */
    mode: "player" | "decoder" = "decoder";

    private _vtex: VideoTexture;
    private _player: VideoPlayerBackend;
    private _api: VideoPlayerBackend | VideoTexture;

    private _source: string;
    private _autoPlay: boolean = false;
    private _loop: boolean = false;
    private _volume: number = 1;
    private _muted: boolean = false;
    private _playbackRate: number = 1;
    private _allowBackground: boolean = false;
    private _paused: boolean = false;
    private _textureCmd: DrawTextureCmd;

    /** @ignore */
    declare owner: Sprite;

    /** @ignore */
    constructor() {
        super();

        this.runInEditor = true;
    }

    /**
     * @en Video player
     * @zh 视频播放器
     */
    get player(): VideoPlayerBackend | VideoTexture | null {
        return this._api;
    }

    /**
     * @en Video source
     * @zh 视频源
     */
    get source() {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
        if (value) {
            if (this.owner?.activeInHierarchy)
                this._load();
        }
        else
            this._unload();
    }

    /**
     * @en Whether to automatically play the video after loading. Default is true.
     * @zh 视频加载完成后是否自动播放。默认值为true。
     */
    get autoPlay(): boolean {
        return this._autoPlay;
    }

    set autoPlay(value: boolean) {
        this._autoPlay = value;
        if (this._api && LayaEnv.isPlaying)
            value ? this._api.play() : this._api.pause();
    }

    /**
     * @en Whether to allow background playback. Default is false.
     * @zh 是否允许后台播放。默认值为false。
     */
    get allowBackground(): boolean {
        return this._allowBackground;
    }

    set allowBackground(value: boolean) {
        this._allowBackground = value;
        if (this._api)
            this._api.allowBackground = value;
    }

    /**
     * @en The current playback position in seconds.
     * @zh 当前播放头位置（以秒为单位）。
     */
    get currentTime(): number {
        return this._api?.currentTime;
    }

    set currentTime(value: number) {
        if (!this._api)
            return;
        this._api.currentTime = value;
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
        return this._vtex?.readyState ?? 0;
    }

    /**
     * @en The video source width. Available after the ready event is triggered.
     * @zh 视频源宽度。ready 事件触发后可用。
     */
    get videoWidth(): number {
        return this._vtex?.videoWidth;
    }

    /**
     * @en The video source height. Available after the ready event is triggered.
     * @zh 视频源高度。ready 事件触发后可用。
     */
    get videoHeight(): number {
        return this._vtex?.videoHeight;
    }

    /**
     * @en The video duration in seconds. Available after the ready event is triggered.
     * @zh 视频长度（秒）。ready 事件触发后可用。
     */
    get duration(): number {
        return this._api?.duration;
    }

    /**
     * @en Returns whether the playback of the audio/video has ended.
     * @zh 返回音频/视频的播放是否已结束。
     */
    get ended(): boolean {
        return this._api?.ended;
    }

    /**
     * @en Whether the video should loop when it ends.
     * @zh 视频是否应在结束时重新播放。
     */
    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
        if (this._api)
            this._api.loop = value;
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
        return this._playbackRate;
    }

    set playbackRate(value: number) {
        this._playbackRate = value;
        if (this._api)
            this._api.playbackRate = value;
    }

    /**
     * @en The current volume level.
     * @zh 当前音量。
     */
    get volume(): number {
        return this._volume;
    }

    set volume(value: number) {
        this._volume = value;
        if (this._api)
            this._api.volume = value;
    }

    /**
     * @en The muted state of the video.
     * @zh 视频的静音状态。
     */
    get muted(): boolean {
        return this._muted;
    }

    set muted(value: boolean) {
        this._muted = value;
        if (this._api)
            this._api.muted = value;
    }

    /**
     * @en If the video is paused.
     * @zh 视频是否暂停。
     */
    get paused(): boolean {
        return this._paused;
    }

    /**
     * @en Get the video texture
     * @zh 获取视频纹理
     */
    get videoTexture(): VideoTexture | null {
        return this._vtex;
    }

    /**
     * @en Start playing the video
     * @zh 开始播放视频
     */
    play(): void {
        if (!this._api)
            return;
        this._paused = false;
        this._api.play();
    }

    /**
     * @en Pause video playback
     * @zh 暂停视频播放
     */
    pause(): void {
        this._paused = true;
        if (this._api)
            this._api.pause();
    }

    private _load() {
        let player: VideoPlayerBackend;
        let vt: VideoTexture;
        let backendType = LayaEnv.isPlaying ? this.mode : "decoder";
        if (backendType === "player") {
            player = (this._player || PAL.media.createVideoPlayer());
            if (!player)
                vt = PAL.media.createVideoTexture();
        }
        else { //if (backendType === "decoder") 
            vt = (this._vtex || PAL.media.createVideoTexture());
            if (!vt)
                player = PAL.media.createVideoPlayer();
        }

        if (player) {
            if (this._player !== player) {
                this._player = player;
                this._player.attachTo(this.owner);
                this._player.options = this.options;
            }
            if (this._vtex) {
                this._vtex.destroy();
                this._vtex = null;
                this.owner.graphics.removeCmd(this._textureCmd, true);
                this._textureCmd = null;
            }
        }
        else {
            if (this._vtex !== vt) {
                this._vtex = vt;
                this._vtex.on(Event.READY, this, this._vtReady);
                this._vtex.on("videoUpdate", this.owner, this.owner.reCache);
                if (!this._textureCmd) {
                    this._textureCmd = DrawTextureCmd.create(new Texture(), 0, 0, 1, 1, null, null, null, null, null, true);
                    (this._textureCmd as IGraphicsCmd).lock = true;
                    this.owner.graphics.addCmd(this._textureCmd);
                }
            }
            if (this._player) {
                this._player.destroy();
                this._player = null;
            }
        }

        this._api = player || vt;
        this._api.loop = this._loop;
        this._api.volume = this._volume;
        this._api.muted = this._muted;
        this._api.playbackRate = this._playbackRate;
        this._api.allowBackground = this._allowBackground;
        if (this._autoPlay && !this._paused && LayaEnv.isPlaying)
            this._api.play();
        else
            this._api.pause();
        this._api.load(this._source);
    }

    private _vtReady() {
        this._textureCmd.texture.setTo(this._vtex);
        this.owner?.graphics.repaint();
    }

    private _unload() {
        if (this._vtex) {
            this._vtex.off(Event.READY, this, this._vtReady);
            this._vtex.off("videoUpdate", this.owner, this.owner.reCache);
            this._vtex.destroy();
            this._vtex = null;
            this.owner.graphics.removeCmd(this._textureCmd, true);
            this._textureCmd = null;
        }

        this._player?.destroy();
        this._player = null;
        this._api = null;
    }

    /**
     * @ignore
     */
    protected _onEnable(): void {
        if (!this._api && this._source)
            this._load();

        super._onEnable();
    }

    /**
     * @ignore
     */
    protected _onDisable(): void {
        this._unload();

        super._onDisable();
    }

    /**
     * @ignore
     */
    protected _onDestroy(): void {
        this._unload();

        super._onDestroy();
    }
}