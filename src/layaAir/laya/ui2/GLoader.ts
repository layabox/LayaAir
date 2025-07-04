
import { ILaya } from "../../ILaya";
import { AnimationStretchMode, FrameAnimation } from "../components/FrameAnimation";
import { HideFlags } from "../Const";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { AtlasResource } from "../resource/AtlasResource";
import { Texture } from "../resource/Texture";
import { AlignType, LoaderFitMode, VAlignType } from "./Const";
import { GWidget } from "./GWidget";
import { ImageRenderer } from "./ImageRenderer";
import { IMeshFactory } from "../display/mesh/MeshFactory";

/**
 * @en GLoader is a widget that displays an image or animation resource.
 * @zh GLoader 是一个显示图像或动画资源的小部件。
 * @blueprintInheritable
 */
export class GLoader extends GWidget {
    private _src: string;
    private _align: AlignType;
    private _valign: VAlignType;
    private _fitMode: LoaderFitMode;
    private _shrinkOnly: boolean;
    private _color: string;
    private _frame: number = 0;
    private _autoPlay: boolean = true;
    private _loop: boolean = true;

    private _updatingLayout: boolean;
    private _content: Sprite;
    private _srcWidth: number = 0;
    private _srcHeight: number = 0;
    private _loadId: number = 0;

    private _renderer: ImageRenderer;
    private _ani: FrameAnimation;

    constructor() {
        super();

        this._src = "";
        this._color = "#ffffff";
        this._fitMode = LoaderFitMode.Contain;
        this._shrinkOnly = false;
        this._align = AlignType.Center;
        this._valign = VAlignType.Middle;
        this._content = new Sprite();
        this._content.hideFlags |= HideFlags.HideAndDontSave;
        this._renderer = new ImageRenderer(this._content);
        this._renderer._onReload = () => this.onTextureReload();
        this.addChild(this._content);
    }

    /**
     * @en The source URL of the image or animation resource.
     * @zh 图像或动画资源的源 URL。
     */
    get src(): string {
        return this._src;
    }

    set src(value: string) {
        if (value == null)
            value = "";
        if (this._src == value)
            return;
        this._src = value;
        if (value)
            this.loadContent();
        else
            this.clearContent();
    }

    /** @ignore */
    get icon(): string {
        return this._src;
    }

    set icon(value: string) {
        this.src = value;
    }

    /**
     * @en The alignment of the content within the loader.
     * @zh 加载器内内容的对齐方式。
     */
    get align(): AlignType {
        return this._align;
    }

    set align(value: AlignType) {
        if (this._align != value) {
            this._align = value;
            ILaya.timer.callLater(this, this.updateLayout);
        }
    }

    /**
     * @en The vertical alignment of the content within the loader.
     * @zh 加载器内内容的垂直对齐方式。
     */
    get valign(): VAlignType {
        return this._valign;
    }

    set valign(value: VAlignType) {
        if (this._valign != value) {
            this._valign = value;
            ILaya.timer.callLater(this, this.updateLayout);
        }
    }

    /**
     * @en The fit mode of the loader, which determines how the content is scaled to fit the loader's size.
     * @zh 加载器的适配模式，决定内容如何缩放以适应加载器的大小。
     */
    get fitMode(): LoaderFitMode {
        return this._fitMode;
    }

    set fitMode(value: LoaderFitMode) {
        if (this._fitMode != value) {
            this._fitMode = value;
            ILaya.timer.callLater(this, this.updateLayout);
        }
    }

    /**
     * @en Whether to only shrink the content to fit the loader's size, without enlarging it.
     * @zh 是否仅缩小内容以适应加载器的大小，而不放大它。
     */
    get shrinkOnly(): boolean {
        return this._shrinkOnly;
    }

    set shrinkOnly(value: boolean) {
        if (this._shrinkOnly != value) {
            this._shrinkOnly = value;
            ILaya.timer.callLater(this, this.updateLayout);
        }
    }

    /**
     * @en The color applied to the content of the loader.
     * @zh 应用于加载器内容的颜色。
     */
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        this._renderer.setColor(value);
        if (this._ani)
            this._ani.color = this._ani.color.parse(value);
    }

    /**
     * @en The FrameAnimation component used for animations.
     * @zh 用于动画的 FrameAnimation 组件。
     */
    get ani(): FrameAnimation | null {
        return this._ani;
    }

    /**
     * @en The index of the current frame in the animation.
     * @zh 动画当前帧的索引。
     */
    get frame(): number {
        return this._frame;
    }

    set frame(value: number) {
        this._frame = value;
        if (this._ani)
            this._ani.frame = value;
    }

    /**
    * @en Whether to auto-play, default is false. If set to true, the animation will automatically play after being created and added to the stage.
    * @zh 是否自动播放，默认为false。如果设置为true，则动画被创建并添加到舞台后自动播放。
    */
    get autoPlay() {
        return this._autoPlay;
    }

    set autoPlay(value: boolean) {
        this._autoPlay = value;
        if (this._ani)
            this._ani.autoPlay = value;
    }

    /**
     * @en Whether to loop playback. Default is true.
     * @zh 是否循环播放。默认为 true。
     */
    get loop() {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
        if (this._ani)
            this._ani.loop = value;
    }

    /**
     * @en The texture of the image.
     * @zh 图像的纹理。
     */
    get texture(): Texture {
        return this._renderer._tex;
    }

    set texture(value: Texture) {
        this._src = "instance-0";
        this.onLoaded(value, ++this._loadId);
    }

    /**
     * @en The mesh factory used for customizing the mesh of the image.
     * @zh 用于自定义图像网格的网格工厂。
     */
    get mesh(): IMeshFactory {
        return this._renderer._meshFactory;
    }

    set mesh(value: IMeshFactory) {
        this._renderer.setMesh(value);
    }

    protected loadContent() {
        let loadID = ++this._loadId;
        let res = Loader.getRes(this._src, Loader.IMAGE);
        if (!res)
            ILaya.loader.load(this._src, { maybeType: Loader.IMAGE }).then(res => this.onLoaded(res, loadID));
        else
            this.onLoaded(res, loadID);
    }

    protected onLoaded(value: Texture | AtlasResource, loadID: number) {
        if (this._loadId != loadID || this.destroyed)
            return;

        if (value instanceof Texture) {
            if (this._ani)
                this._ani.setAtlas(null);
            this._renderer.setTexture(value);

            this._srcWidth = value.sourceWidth;
            this._srcHeight = value.sourceHeight;
        }
        else if (value instanceof AtlasResource) {
            this._renderer.setTexture(null);
            if (!this._ani) {
                this._ani = this._content.addComponent(FrameAnimation);
                this._ani.color = this._ani.color.parse(this._color);
                this._ani.stretchMode = AnimationStretchMode.Fill;
                this._ani.autoPlay = this._autoPlay;
                this._ani.loop = this._loop;
                this._ani.frame = this._frame;
            }
            this._ani.setAtlas(value);
            this._srcWidth = this._ani.width;
            this._srcHeight = this._ani.height;
        }
        else {
            this._renderer.setTexture(null);
            if (this._ani)
                this._ani.setAtlas(null);
            this._srcWidth = 0;
            this._srcHeight = 0;
        }

        ILaya.timer.runCallLater(this, this.updateLayout, true);
        this.event(Event.LOADED);
    }

    private onTextureReload() {
        let tex = this._renderer._tex;
        this._srcWidth = tex.sourceWidth;
        this._srcHeight = tex.sourceHeight;
        ILaya.timer.runCallLater(this, this.updateLayout, true);
        this.event(Event.LOADED);
    }

    protected clearContent() {
        this._srcWidth = 0;
        this._srcHeight = 0;
        this._loadId++;
        this._renderer.setTexture(null);
        if (this._ani)
            this._ani.source = null;
    }

    protected updateLayout(): void {
        let cw = this._srcWidth, ch = this._srcHeight;
        if (cw == 0 || ch == 0)
            return;

        this._updatingLayout = true;
        let sx = 1, sy = 1;
        if (this._fitMode != LoaderFitMode.None && cw != 0 && ch != 0) {
            sx = this.width / cw;
            sy = this.height / ch;

            if (sx != 1 || sy != 1) {
                if (this._fitMode == LoaderFitMode.CoverHeight)
                    sx = sy;
                else if (this._fitMode == LoaderFitMode.CoverWidth)
                    sy = sx;
                else if (this._fitMode == LoaderFitMode.Contain) {
                    if (sx > sy)
                        sx = sy;
                    else
                        sy = sx;
                }
                else if (this._fitMode == LoaderFitMode.Cover) {
                    if (sx > sy)
                        sy = sx;
                    else
                        sx = sy;
                }

                if (this._shrinkOnly) {
                    if (sx > 1)
                        sx = 1;
                    if (sy > 1)
                        sy = 1;
                }

                cw = cw * sx;
                ch = ch * sy;
            }
        }

        this._content.size(cw, ch);

        let nx: number, ny: number;
        if (this._align == AlignType.Center)
            nx = Math.floor((this.width - cw) / 2);
        else if (this._align == AlignType.Right)
            nx = this.width - cw;
        else
            nx = 0;
        if (this._valign == VAlignType.Middle)
            ny = Math.floor((this.height - ch) / 2);
        else if (this._valign == VAlignType.Bottom)
            ny = this.height - ch;
        else
            ny = 0;

        this._content.pos(nx, ny);
        this._updatingLayout = false;
    }

    protected _sizeChanged(): void {
        super._sizeChanged();

        if (!this._updatingLayout)
            ILaya.timer.callLater(this, this.updateLayout);
    }

    /** @ignore */
    destroy(): void {
        super.destroy();
        this._renderer.destroy();
    }

    /** @internal @blueprintEvent */
    GLoader_bpEvent: {
        [Event.LOADED]: () => void;
    };
}
