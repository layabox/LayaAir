import { Config } from "../../Config";
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { DrawTextureCmd } from "../display/cmd/DrawTextureCmd";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { Color } from "../maths/Color";
import { Point } from "../maths/Point";
import { Loader } from "../net/Loader";
import { AtlasResource } from "../resource/AtlasResource";
import { Texture } from "../resource/Texture";
import { Component } from "./Component";

export enum AnimationWrapMode {
    /**
     * @en Animation playback order type: Forward playback.
     * @zh 动画播放顺序类型：正序播放。
     */
    Positive,
    /**
     * @en Animation playback order type: Reverse playback.
     * @zh 动画播放顺序类型：倒序播放。
     */
    Reverse,
    /**
     * @en Animation playback order type: Ping-pong playback (changes playback direction after reaching the end when continuing to play).
     * @zh 动画播放顺序类型：pingpong播放(当按指定顺序播放完结尾后，如果继续播放，则会改变播放顺序)。
     */
    PingPong,
}

export enum AnimationStretchMode {
    /**
     * @en No stretch.
     * @zh 不拉伸。
     */
    None,

    /**
     * @en Fill the entire sprite size.
     * @zh 填满整个精灵尺寸。
     */
    Fill,

    /**
     * @en Resize the sprite to fit the size of the first frame.
     * @zh 调整精灵尺寸适应第一帧的大小。
     */
    ResizeToFit
}

/**
 * @en The FrameAnimation component is used to play frame animation.
 * @zh FrameAnimation 组件，用于播放帧动画。
 */
export class FrameAnimation extends Component {
    /**
     * @en The interval between frame changes, in milliseconds.
     * @zh 帧改变之间的间隔时间，单位为毫秒。
     */
    interval: number;

    /**
     * @en The delay between each repeat, in milliseconds.
     * @zh 每次重复之间的延迟，单位为毫秒。
     */
    repeatDelay: number = 0;

    /**
     * @en Playback speed.
     * @zh 播放速率。
     */
    timeScale: number = 1;

    private _wrapMode: AnimationWrapMode = 0;
    private _loop: boolean = true;
    private _frame: number = 0;
    private _frames: Texture[];
    private _delays: number[];
    private _autoPlay: boolean = true;
    private _stretchMode: AnimationStretchMode = 0;
    private _offset: Point;
    private _source: string;
    private _images: string[];
    private _color: Color;

    private _atlas: AtlasResource;
    private _playing: boolean = false;
    private _count: number = 0;
    private _index: number = 0;
    private _elapsed: number = 0;
    private _reversed: boolean;
    private _drawCmd: DrawTextureCmd;
    private _drawCmds: DrawTextureCmd[];
    private _loadId: number = 0;
    private _changingSize: boolean;

    declare owner: Sprite;

    /**
     * @en Constructor method of Animation.
     * @zh 动画类的构造方法
     */
    constructor() {
        super();

        this.interval = Config.animationInterval;
        this._frames = [];
        this._drawCmds = [];
        this._delays = [];
        this._offset = new Point();
        this._color = new Color(1, 1, 1, 1);
        this._singleton = false;
        this.runInEditor = true;
    }

    /**
     * @en The index of the current frame in the animation.
     * @zh 动画当前帧的索引。
     */
    get frame(): number {
        return LayaEnv.isPlaying ? this._frame : this._index;
    }

    set frame(value: number) {
        this._index = this._frame = value;
        this.drawFrame();
    }

    /**
     * @en The current animation frame image array.
     * @zh 当前动画的帧图像数组。
     */
    get frames(): ReadonlyArray<Texture> {
        return this._frames;
    }

    set frames(value: ReadonlyArray<Texture>) {
        if (this._drawCmd) {
            this.owner.graphics.removeCmd(this._drawCmd);
            this._drawCmd = null;
        }
        for (let cmd of this._drawCmds)
            cmd.recover();
        this._drawCmds.length = 0;
        this._frames.length = 0;

        if (value != null && value.length > 0) {
            this._frames.push(...value);
            let stretch = this._stretchMode === AnimationStretchMode.Fill;
            for (let tex of value) {
                let cmd = stretch ? DrawTextureCmd.create(tex, 0, 0, 1, 1, null, 1, null, null, null, true)
                    : DrawTextureCmd.create(tex, 0, 0);
                this._drawCmds.push(cmd);
            }

            this._count = this._frames.length;
            this._elapsed = 0;
            if (this._wrapMode === AnimationWrapMode.Reverse)
                this._frame = this._count - 1;
            else {
                this._reversed = false;
                this._frame = 0;
            }

            if (this._stretchMode === AnimationStretchMode.ResizeToFit) {
                let w = this.width, h = this.height;
                if (w > 0 && h > 0 || LayaEnv.isPlaying) {
                    this._changingSize = true;
                    this.owner.size(w, h);
                    this._changingSize = false;
                }
            }

            this.drawFrame();
        }
        else {
            this._count = 0;
        }
    }

    /**
     * @en The delay time of each frame, in milliseconds.
     * @zh 每帧的延迟时间，单位为毫秒。
     */
    get frameDelays(): Array<number> {
        return this._delays;
    }

    /**
     * @en Whether the animation is playing.
     * @zh 动画是否正在播放。
     */
    get isPlaying(): boolean {
        return this._playing;
    }

    /**
     * @en Whether to automatically play the animation after the component is activated.
     * @zh 是否在组件激活后自动播放动画。
     */
    get autoPlay(): boolean {
        return this._autoPlay;
    }

    set autoPlay(value: boolean) {
        this._autoPlay = value;
        if (this.enabled) {
            if (value)
                this.play();
            else
                this.stop();
        }
    }

    /**
     * @en Playback order type.
     * @zh 播放顺序类型。
     */
    get wrapMode(): AnimationWrapMode {
        return this._wrapMode;
    }

    set wrapMode(value: AnimationWrapMode) {
        if (this._wrapMode != value) {
            this._wrapMode = value;
            if (this._playing) {
                if (value === AnimationWrapMode.Reverse)
                    this._reversed = true;
                else if (value === AnimationWrapMode.Positive)
                    this._reversed = false;
            }
        }
    }

    /**
     * @en Whether to loop playback. The default is true.
     * @zh 是否循环播放。默认为 true。
     */
    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        if (this._loop != value) {
            this._loop = value;
            if (value && !this._playing && this._autoPlay)
                this.play();
        }
    }

    /**
     * @en The stretch mode of the animation. The default is AnimationStretchMode.None.
     * @zh 动画的拉伸模式。默认为 AnimationStretchMode.None。
     */
    get stretchMode(): AnimationStretchMode {
        return this._stretchMode;
    }

    set stretchMode(value: AnimationStretchMode) {
        if (this._changingSize)
            return;

        if (this._stretchMode != value) {
            this._stretchMode = value;

            if (this._count > 0) {
                if (this._stretchMode === AnimationStretchMode.ResizeToFit) {
                    let w = this.width, h = this.height;
                    if (w > 0 && h > 0 || LayaEnv.isPlaying) {
                        this._changingSize = true;
                        this.owner.size(w, h);
                        this._changingSize = false;
                    }
                }

                this.applyStretchMode();
                this.drawFrame();
            }
        }
    }

    /**
     * @en The offset of the animation. Only applies when the stretch mode is AnimationStretchMode.None.
     * @zh 动画的偏移量。仅在 stretchMode 为 AnimationStretchMode.None 时生效。
     */
    get offset(): Point {
        return this._offset;
    }

    set offset(value: Readonly<Point>) {
        this._offset.copy(value);
        this.applyStretchMode();
        this.drawFrame();
    }

    /**
     * @en The color of the object.
     * @zh 对象的颜色。
     */
    get color() {
        return this._color;
    }

    set color(value: Color) {
        this._color = value;
        this.drawFrame();
    }

    get width() {
        return this._count > 0 ? this._frames[0].sourceWidth : 0;
    }

    get height() {
        return this._count > 0 ? this._frames[0].sourceHeight : 0;
    }

    private applyStretchMode() {
        if (this._stretchMode === AnimationStretchMode.Fill) {
            for (let cmd of this._drawCmds) {
                cmd.x = cmd.y = 0;
                cmd.width = cmd.height = 1;
                cmd.percent = true;
            }
        }
        else {
            let dx = 0, dy = 0;
            if (this._stretchMode === AnimationStretchMode.None) {
                dx = this._offset.x;
                dy = this._offset.y;
            }
            for (let cmd of this._drawCmds) {
                cmd.x = dx;
                cmd.y = dy;
                if (cmd.texture) {
                    cmd.width = cmd.texture.sourceWidth;
                    cmd.height = cmd.texture.sourceHeight;
                }
                cmd.percent = false;
            }
        }
    }

    /**
     * @en Play the animation.
     * @zh 播放动画。
     */
    play(): void {
        if (this._playing)
            return;

        this._playing = true;
        this._elapsed = 0;
        this._reversed = this._wrapMode === AnimationWrapMode.Reverse;
    }

    /**
     * @en Stop playing the animation.
     * @zh 停止播放动画。
     */
    stop() {
        this._playing = false;
        if (!LayaEnv.isPlaying) {
            this._frame = this._index;
            this.drawFrame();
        }
    }

    protected _onEnable(): void {
        if (this._autoPlay)
            this.play();
    }

    protected _onDestroy(): void {
        super._onDestroy();

        this.frames = null;
        if (this._atlas) {
            if (!LayaEnv.isPlaying)
                this._atlas.off("reload", this, this.onAtlasReload);
            this._atlas = null;
        }
    }

    /**
     * @hidden
     */
    onUpdate(): void {
        if (!this._playing || this._count == 0)
            return;

        let dt: number = ILaya.timer.delta;
        if (dt > 100)
            dt = 100;
        if (this.timeScale != 1)
            dt *= this.timeScale;

        let frame = this._frame;
        this._elapsed += dt;
        let tt: number = this.interval;
        if (this._reversed) {
            if (frame > 0)
                tt += this._delays[frame - 1] || 0;
            else
                tt += this.repeatDelay;
        }
        else {
            tt += this._delays[frame] || 0;
            if (frame === this._count - 1)
                tt += this.repeatDelay;
        }

        if (this._elapsed < tt)
            return;

        this._elapsed -= tt;
        if (this._elapsed > this.interval)
            this._elapsed = this.interval;

        let emit = false;

        if (this._reversed) {
            frame--;
            if (frame < 0) {
                if (this._loop) {
                    if (this._wrapMode === AnimationWrapMode.PingPong) {
                        this._reversed = false;
                        frame = 1;
                    }
                    else
                        frame = this._count - 1;
                    emit = true;
                }
                else {
                    frame = 0;
                    this._playing = false;
                    emit = true;
                }
            }
        }
        else {
            frame++;
            if (frame > this._count - 1) {
                if (this._loop) {
                    if (this._wrapMode === AnimationWrapMode.PingPong) {
                        this._reversed = true;
                        frame = Math.max(0, this._count - 2);
                    }
                    else
                        frame = 0;
                    emit = true;
                }
                else {
                    frame = this._count - 1;
                    this._playing = false;
                    emit = true;
                }
            }
        }

        this._frame = frame;

        if (this._playing)
            this.drawFrame();

        if (emit)
            this.owner.event(Event.COMPLETE);
    }

    protected drawFrame(): void {
        let cmd = this._drawCmds[this._frame];
        if (cmd != this._drawCmd)
            this._drawCmd = this.owner.graphics.replaceCmd(this._drawCmd, cmd);
        if (this._drawCmd)
            this._drawCmd.color = this._color.getABGR();
    }

    /**
     * @en Atlas path.
     * @zh 图集路径。
     */
    get source(): string {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
        this.load();
    }

    /**
     * @en The image path array of the animation.
     * @zh 动画的图片路径数组。
     */
    get images(): string[] {
        return this._images;
    }

    set images(value: string[]) {
        this._images = value;
        this.load();
    }

    private load() {
        if (this._atlas) {
            if (!LayaEnv.isPlaying)
                this._atlas.off("reload", this, this.onAtlasReload);
            this._atlas = null;
        }

        if (this._source)
            this.loadAtlas(this._source);
        else if (this._images && this._images.length > 0)
            this.loadImages(this._images);
        else
            this.onLoaded(null, ++this._loadId);
    }

    protected loadImages(urls: string[]): this {
        let loadId = ++this._loadId;
        let textures = urls.map(url => Loader.getRes(url));
        if (textures.indexOf(null) === -1) {
            this.frames = textures;
            this.owner.event(Event.LOADED);
        }
        else {
            ILaya.loader.load(urls).then((textures: Array<Texture>) => {
                if (loadId != this._loadId || this.destroyed)
                    return;

                this.frames = textures;
                this.owner.event(Event.LOADED);
            });
        }

        return this;
    }

    protected loadAtlas(url: string): this {
        let loadId = ++this._loadId;
        let atlas: AtlasResource = Loader.getRes(url);
        if (atlas)
            this.onLoaded(atlas, loadId);
        else
            ILaya.loader.load(url, Loader.ATLAS).then(atlas => this.onLoaded(atlas, loadId));

        return this;
    }

    /**
     * @en Set the atlas for the frame animation.
     * @param res The atlas.
     * @zh 设置帧动画的图集。
     * @param res 图集。
     */
    setAtlas(res: AtlasResource) {
        this.onLoaded(res, ++this._loadId);
    }

    private onLoaded(atlas: AtlasResource, loadId: number) {
        if (loadId != this._loadId || this.destroyed)
            return;

        this._atlas = atlas;
        if (atlas) {
            if (!LayaEnv.isPlaying)
                this._atlas.on("reload", this, this.onAtlasReload);

            let ani = atlas.animation;
            if (ani) {
                this.interval = ani.interval;
                this.repeatDelay = ani.repeatDelay ?? 0;
                this.wrapMode = ani.wrapMode ?? 0;
                this._delays.length = 0;
                if (ani.frameDelays)
                    this._delays.push(...ani.frameDelays);
            }
            this.frames = atlas.frames;
        }
        else
            this.frames = null;
        this.owner.event(Event.LOADED);
    }

    private onAtlasReload() {
        this.onLoaded(this._atlas, this._loadId);
    }
}