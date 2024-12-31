
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { HideFlags } from "../Const";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { AlignType, LoaderFitMode, VAlignType } from "./Const";
import { GImage } from "./GImage";
import { GWidget } from "./GWidget";

export class GLoader extends GWidget {
    private _src: string;
    private _align: AlignType;
    private _valign: VAlignType;
    private _fitMode: LoaderFitMode;
    private _shrinkOnly: boolean;
    private _updatingLayout: boolean;
    private _content: GWidget;
    private _srcWidth: number = 0;
    private _srcHeight: number = 0;
    private _color: string;

    constructor() {
        super();

        this._src = "";
        this._color = "#FFFFFF";
        this._fitMode = LoaderFitMode.Contain;
        this._shrinkOnly = false;
        this._align = AlignType.Center;
        this._valign = VAlignType.Middle;
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
        if (this._content instanceof GImage)
            this._content.color = value;
    }

    public get texture(): Texture {
        return (<GImage>this._content)?.texture;
    }

    public set texture(value: Texture) {
        this._src = "";
        this.onLoaded(value);
    }

    protected async loadContent() {
        let src = this._src;
        let res = Loader.getRes(src);
        if (!res) {
            res = await ILaya.loader.load(src);
            if (src != this._src)
                return;
        }

        this.onLoaded(res);
    }

    protected onLoaded(value: any) {
        if (value instanceof Texture) {
            let image = <GImage>this._content;
            if (!image) {
                this._content = image = new GImage();
                image.hideFlags |= HideFlags.HideAndDontSave;
                image.color = this._color;
                if (!LayaEnv.isPlaying) {
                    image.on("resource_reload", () => {
                        this._srcWidth = image.texture.width;
                        this._srcHeight = image.texture.height;
                        this.updateLayout();
                    });
                }
            }
            if (image.texture == value && image.parent)
                return;

            this._srcWidth = value.width;
            this._srcHeight = value.height;
            image.texture = value;
            this.addChild(image);
            ILaya.timer.runCallLater(this, this.updateLayout, true);
        }
        else
            this.clearContent();
    }

    protected clearContent() {
        this._srcWidth = 0;
        this._srcHeight = 0;
        if (this._content) {
            (<GImage>this._content).src = null;
            this._content.removeSelf();
        }
    }

    protected updateLayout(): void {
        if (!this._content)
            return;

        this._updatingLayout = true;
        let sx = 1, sy = 1;
        let cw = this._srcWidth, ch = this._srcHeight;
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
}
