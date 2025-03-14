import { AnimationStretchMode, FrameAnimation } from "../components/FrameAnimation";
import { HideFlags } from "../Const";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { GWidget } from "./GWidget";

export class GMovieClip extends GWidget {
    readonly comp: FrameAnimation;

    private _color: string;

    constructor() {
        super();

        this._color = "#ffffff";
        this.comp = this.addComponent(FrameAnimation);
        this.comp.hideFlags |= HideFlags.HideAndDontSave;
        this.comp.stretchMode = AnimationStretchMode.ResizeToFit;
    }

    public get src(): string {
        return this.comp.source;
    }

    public set src(value: string) {
        this.comp.source = value;
    }

    public get icon(): string {
        return this.src;
    }

    public set icon(value: string) {
        this.src = value;
    }

    /**
     * @en Whether to use the original size of the resource.
     * @zh 是否使用资源的原始大小。
     */
    get autoSize(): boolean {
        return this.comp.stretchMode === AnimationStretchMode.ResizeToFit;
    }

    set autoSize(value: boolean) {
        this.comp.stretchMode = value ? AnimationStretchMode.ResizeToFit : AnimationStretchMode.Fill;
    }

    /**
     * @en The color of the object.
     * @zh 对象的颜色。
     */
    get color() {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        this.comp.color.parse(value);
        this.comp.color = this.comp.color;
    }

    /**
     * @en The index of the current frame in the animation.
     * @zh 动画当前帧的索引。
     */
    get index(): number {
        return this.comp.index;
    }

    set index(value: number) {
        this.comp.index = value;
    }

    /**
    * @en Whether to auto-play, default is false. If set to true, the animation will automatically play after being created and added to the stage.
    * @zh 是否自动播放，默认为false。如果设置为true，则动画被创建并添加到舞台后自动播放。
    */
    set autoPlay(value: boolean) {
        this.comp.autoPlay = value;
    }

    get autoPlay() {
        return this.comp.autoPlay;
    }

    /**
     * @en Whether to loop playback. Default is true.
     * @zh 是否循环播放。默认为 true。
     */
    get loop() {
        return this.comp.loop;
    }

    set loop(value: boolean) {
        this.comp.loop = value;
    }

    /**
     * @en Playback speed.
     * @zh 播放速率。
     */
    get timeScale() {
        return this.comp.timeScale;
    }

    set timeScale(value: number) {
        this.comp.timeScale = value;
    }

    protected _sizeChanged(changeByLayout?: boolean): void {
        super._sizeChanged();

        if (!changeByLayout && !SerializeUtil.isDeserializing)
            this.autoSize = false;
    }
}
