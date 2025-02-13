
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { HideFlags } from "../Const";
import { DrawTextureCmd } from "../display/cmd/DrawTextureCmd";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { ColorUtils } from "../utils/ColorUtils";
import { AlignType, LoaderFitMode, VAlignType } from "./Const";
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
    private _tex: Texture;
    private _drawCmd: DrawTextureCmd;
    private _loadID: number = 0;

    constructor() {
        super();

        this._src = "";
        this._color = "#ffffff";
        this._fitMode = LoaderFitMode.Contain;
        this._shrinkOnly = false;
        this._align = AlignType.Center;
        this._valign = VAlignType.Middle;
        this._content = new GWidget();
        this._content.hideFlags |= HideFlags.HideAndDontSave;
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
        if (this._drawCmd)
            this._drawCmd.color = ColorUtils.create(value).numColor;
    }

    public get texture(): Texture {
        return this._tex;
    }

    public set texture(value: Texture) {
        this._src = "";
        this.onLoaded(value, ++this._loadID);
    }

    protected async loadContent() {
        let loadID = ++this._loadID;
        let res = Loader.getRes(this._src);
        if (!res)
            res = await ILaya.loader.load(this._src);
        this.onLoaded(res, loadID);
    }

    protected onLoaded(value: Texture, loadID: number) {
        if (this._loadID != loadID)
            return;

        if (this._tex && !LayaEnv.isPlaying)
            this._tex.off("reload", this, this._onTextureReload);
        this._tex = value;
        if (value) {
            if (!LayaEnv.isPlaying)
                value.on("reload", this, this._onTextureReload);

            let cmd = DrawTextureCmd.create(value, 0, 0, 1, 1, null, 1, this._color, null, null, true);
            this._drawCmd = this._content.graphics.replaceCmd(this._drawCmd, cmd, true);
            this._srcWidth = value.sourceWidth;
            this._srcHeight = value.sourceHeight;
            ILaya.timer.runCallLater(this, this.updateLayout, true);
        }
        else {
            this._drawCmd = this._content.graphics.replaceCmd(this._drawCmd, null, true);
            this._srcWidth = 0;
            this._srcHeight = 0;
        }
    }

    private _onTextureReload() {
        this._srcWidth = this._tex.sourceWidth;
        this._srcHeight = this._tex.sourceHeight;
        ILaya.timer.runCallLater(this, this.updateLayout, true);
    }

    protected clearContent() {
        this._srcWidth = 0;
        this._srcHeight = 0;
        this._loadID++;
        if (this._tex && !LayaEnv.isPlaying) {
            this._tex.off("reload", this, this._onTextureReload);
            this._tex = null;
        }
        this._drawCmd = this._content.graphics.replaceCmd(this._drawCmd, null, true);
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

    destroy(): void {
        super.destroy();
        if (this._tex && !LayaEnv.isPlaying) {
            this._tex.off("reload", this, this._onTextureReload);
            this._tex = null;
        }
    }
}
