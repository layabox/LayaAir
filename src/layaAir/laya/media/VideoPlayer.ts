import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { PAL } from "../platform/PlatformAdapters";
import { AssetDb } from "../resource/AssetDb";
import { Browser } from "../utils/Browser";
import { SpriteUtils } from "../utils/SpriteUtils";

export interface IVideoPlayerOptions {
    /**
     * @en Whether to show the video controls. Default is false.
     * @zh 是否显示视频控制。默认否。
     */
    controls?: boolean;
    /**
     * @en Whether the video is displayed under the game canvas (the canvas needs to be set to transparent). Default is false.
     * @zh 视频是否显示在游戏画布之下（画布需设置为透明)。默认否。
     */
    underGameView?: boolean;
    /**
     * @en Video scaling mode. Default is contain.
     * @zh 视频的缩放模式。默认contain。
     */
    objectFit?: "fill" | "contain" | "cover";
    /**
     * @en Whether to show the video progress bar.
     * @zh 是否显示视频进度条。
     */
    showProgress?: boolean;
    /**
     * @en Whether to show the progress bar in the control bar.
     * @zh 是否显示控制栏的进度条。
     */
    showProgressInControlMode?: boolean;
    /**
     * @en Whether it is live broadcast。
     * @zh 是否是直播。
     */
    live?: boolean;
    /**
     * @en Whether to show the play button in the center of the video。
     * @zh 是否在视频中间显示播放按钮。
     */
    showCenterPlayBtn?: boolean;
    /**
     * @en Whether the video follows the system mute switch setting (iOS only)。
     * @zh 视频是否遵循系统静音开关设置（仅iOS）。
     */
    obeyMuteSwitch?: boolean;
}

/**
 * @en Video player class
 * @zh 视频播放器类
 */
export class VideoPlayer {
    /**
     * @en Video player options
     * @zh 视频播放器选项
     */
    options: IVideoPlayerOptions = {};
    /**
     * @en Whether to allow the video to continue playing in the background。
     * @zh 视频是否允许在后台继续播放。
     */
    allowBackground: boolean = false;

    protected _owner: Sprite;
    protected _playing: boolean = false;
    protected _loaded: boolean = false;

    /** @internal */
    _autoResume: boolean = false;

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
        return false;
    }

    set loop(value: boolean) {
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

    attachTo(owner: Sprite) {
        if (this._owner) {
            this._owner.off(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);
            ILaya.stage.off(Event.RESIZE, this, this.onTransformChanged);
        }
        this._owner = owner;
        if (this._owner) {
            this._owner.on(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);
            ILaya.stage.on(Event.RESIZE, this, this.onTransformChanged);
        }
    }

    /**
     * @en Load the video
     * @zh 加载视频
     */
    load(url: string) {
        if (!url)
            return;

        AssetDb.inst.resolveURL(url, url2 => this.onLoad(url2));
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

        if (this._loaded)
            this.onPlay();
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

    protected setLoaded() {
        this._loaded = true;
        this.onTransformChanged();

        if (this._playing)
            this.onPlay();
    }

    protected getNodeTransform() {
        let trans: ReturnType<typeof SpriteUtils.getGlobalPosAndScale>;
        if (Browser.onTTMiniGame) { //抖音上视频的坐标是相对画布的坐标，不是相对窗口的坐标
            trans = SpriteUtils.getGlobalPosAndScale(this._owner);
            trans.x *= ILaya.stage.clientScaleX;
            trans.y *= ILaya.stage.clientScaleY;
            trans.scaleX *= ILaya.stage.clientScaleX;
            trans.scaleY *= ILaya.stage.clientScaleY;
        }
        else
            trans = SpriteUtils.getTransformRelativeToWindow(this._owner, 0, 0);
        return { x: trans.x, y: trans.y, width: Math.round(this._owner.width * trans.scaleX), height: Math.round(this._owner.height * trans.scaleY) };
    }

    protected onTransformChanged() {
    }

    /**
     * @en Destroy the video player
     * @zh 销毁视频播放器
     */
    destroy() {
        this.onDestroy();
        this.attachTo(null);
        ILaya.stage.off(Event.BLUR, this, this.onBlur);
    }

    protected onBlur() {
        if (!this.allowBackground)
            PAL.media.resumeUntilGotFocus(this);
    }

    protected onLoad(url: string): void {
    }

    protected onPlay(): void {
    }

    protected onPause(): void {
    }

    protected onDestroy(): void {
    }
}