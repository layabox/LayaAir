
import { ILaya } from "../../ILaya";
import { AnimationStretchMode, FrameAnimation } from "../components/FrameAnimation";
import { HideFlags } from "../Const";
import { Sprite } from "../display/Sprite";
import { Loader } from "../net/Loader";
import { AtlasResource } from "../resource/AtlasResource";
import { Texture } from "../resource/Texture";
import { AlignType, LoaderFitMode, VAlignType } from "./Const";
import { GWidget } from "./GWidget";
import { ImageRenderer } from "./render/ImageRenderer";
import { IMeshFactory } from "./render/MeshFactory";

export class GLoader extends GWidget {
    private _src: string;
    private _align: AlignType;
    private _valign: VAlignType;
    private _fitMode: LoaderFitMode;
    private _shrinkOnly: boolean;
    private _updatingLayout: boolean;
    private _content: Sprite;
    private _srcWidth: number = 0;
    private _srcHeight: number = 0;
    private _color: string;
    private _loadID: number = 0;

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

    public get src(): string {
        return this._src;
    }

    public set src(value: string) {
        if (this._src == value)
            return;
        this._src = value;
        if (value)
            this.loadContent();
        else
            this.clearContent();
    }

    public get icon(): string {
        return this._src;
    }

    public set icon(value: string) {
        this.src = value;
    }

    public get align(): AlignType {
        return this._align;
    }

    public set align(value: AlignType) {
        if (this._align != value) {
            this._align = value;
            ILaya.timer.callLater(this, this.updateLayout);
        }
    }

    public get valign(): VAlignType {
        return this._valign;
    }

    public set valign(value: VAlignType) {
        if (this._valign != value) {
            this._valign = value;
            ILaya.timer.callLater(this, this.updateLayout);
        }
    }

    public get fitMode(): LoaderFitMode {
        return this._fitMode;
    }

    public set fitMode(value: LoaderFitMode) {
        if (this._fitMode != value) {
            this._fitMode = value;
            ILaya.timer.callLater(this, this.updateLayout);
        }
    }

    public get shrinkOnly(): boolean {
        return this._shrinkOnly;
    }

    public set shrinkOnly(value: boolean) {
        if (this._shrinkOnly != value) {
            this._shrinkOnly = value;
            ILaya.timer.callLater(this, this.updateLayout);
        }
    }

    public get color(): string {
        return this._color;
    }

    public set color(value: string) {
        this._color = value;
        this._renderer.setColor(value);
        if (this._ani)
            this._ani.color = this._ani.color.parse(value);
    }

    public get texture(): Texture {
        return this._renderer._tex;
    }

    public set texture(value: Texture) {
        this._src = "";
        this.onLoaded(value, ++this._loadID);
    }

    public get mesh(): IMeshFactory {
        return this._renderer._meshFactory;
    }

    public set mesh(value: IMeshFactory) {
        this._renderer.setMesh(value);
    }

    public updateMesh() {
        this._renderer.updateMesh();
    }

    protected async loadContent() {
        let loadID = ++this._loadID;
        let res = Loader.getRes(this._src);
        if (!res)
            res = await ILaya.loader.load(this._src);
        this.onLoaded(res, loadID);
    }

    protected onLoaded(value: Texture | AtlasResource, loadID: number) {
        if (this._loadID != loadID)
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
                this._ani.stretchMode = AnimationStretchMode.Fill;
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
    }

    private onTextureReload() {
        let tex = this._renderer._tex;
        this._srcWidth = tex.sourceWidth;
        this._srcHeight = tex.sourceHeight;
        ILaya.timer.runCallLater(this, this.updateLayout, true);
    }

    protected clearContent() {
        this._srcWidth = 0;
        this._srcHeight = 0;
        this._loadID++;
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
        this._renderer.updateMesh(false);

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

    destroy(): void {
        super.destroy();
        this._renderer.destroy();
    }
}
