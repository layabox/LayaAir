import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Draw9GridTextureCmd } from "../display/cmd/Draw9GridTextureCmd";
import { DrawTextureCmd } from "../display/cmd/DrawTextureCmd";
import { FillTextureCmd } from "../display/cmd/FillTextureCmd";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { ColorUtils } from "../utils/ColorUtils";
import { GWidget } from "./GWidget";

export class GImage extends GWidget {
    private _src: string = "";
    private _tex: Texture;
    private _autoSize: boolean;
    private _isChanged: boolean;
    private _color: string;
    private _tile: boolean;
    private _drawCmd: DrawTextureCmd | Draw9GridTextureCmd | FillTextureCmd;
    private _loadID: number = 0;

    constructor() {
        super();

        this._color = "#ffffff";
        this._tile = false;
        this._autoSize = true;
    }

    public get src(): string {
        return this._src;
    }

    public set src(value: string) {
        if (this._src == value)
            return;

        this._src = value;
        let loadID = ++this._loadID;
        if (value) {
            let tex = Loader.getRes(value);
            if (tex)
                this.onLoad(tex, loadID);
            else
                ILaya.loader.load(value).then(res => this.onLoad(res, loadID));
        }
        else
            this.onLoad(null, loadID);
    }

    public get texture(): Texture {
        return this._tex;
    }

    public set texture(value: Texture) {
        this._src = "";
        this.onLoad(value, ++this._loadID);
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
        return this._autoSize;
    }

    set autoSize(value: boolean) {
        if (this._autoSize != value) {
            if (value && this._tex)
                this.size(this._tex.sourceWidth, this._tex.sourceHeight);
            this._autoSize = value; //放最后，因为size会改变autoSize的值
        }
    }

    public get tile(): boolean {
        return this._tile;
    }

    public set tile(value: boolean) {
        if (this._tile != value) {
            this._tile = value;
            this._setChanged();
        }
    }

    /**
     * @en The color of the object.
     * @zh 对象的颜色。
     */
    get color() {
        return this._color;
    }

    set color(value: string) {
        if (this._color != value) {
            this._color = value;
            if (this._drawCmd)
                this._drawCmd.color = ColorUtils.create(value).numColor;
        }
    }

    protected onLoad(res: Texture, loadID: number) {
        if (this._loadID != loadID)
            return;

        if (this._tex && !LayaEnv.isPlaying)
            this._tex.off("reload", this, this._onTextureReload);
        this._tex = res;
        if (res) {
            this._setChanged();
            if (!LayaEnv.isPlaying)
                res.on("reload", this, this._onTextureReload);
        } else {
            this._drawCmd = this.graphics.replaceCmd(this._drawCmd, null, true);
        }

        if (this._autoSize) {
            if (res)
                this.size(res.width, res.height);
            else
                this.size(0, 0);
            this._autoSize = true;
        }
    }

    private _onTextureReload() {
        if (this._autoSize) {
            let tex = this._tex;
            this.size(tex.width, tex.height);
            this._autoSize = true;
        }
        this._setChanged();
    }

    protected _setChanged(): void {
        if (!this._isChanged) {
            this._isChanged = true;
            ILaya.timer.callLater(this, this.changeSource);
        }
    }

    protected changeSource(): void {
        this._isChanged = false;
        let source = this._tex;
        if (!source || !source.bitmap || this._destroyed)
            return;

        let width = this.width;
        let height = this.height;
        let sw = source.sourceWidth;
        let sh = source.sourceHeight;

        //如果没有设置9宫格，或大小未改变，则直接用原图绘制
        let cmd: any;
        if (!source._sizeGrid || (sw === width && sh === height)) {
            if (this._tile)
                cmd = FillTextureCmd.create(source, 0, 0, 1, 1, "repeat", null, this._color, true);
            else
                cmd = DrawTextureCmd.create(source, 0, 0, 1, 1, null, 1, this._color, null, null, true);
        }
        else
            cmd = Draw9GridTextureCmd.create(source, 0, 0, 1, 1, source._sizeGrid, true, this._color);

        this._drawCmd = this.graphics.replaceCmd(this._drawCmd, cmd, true);
    }

    protected _sizeChanged(changeByLayout?: boolean): void {
        super._sizeChanged();

        if (!changeByLayout && !SerializeUtil.isDeserializing)
            this._autoSize = false;

        this._setChanged();
    }

    destroy(): void {
        super.destroy();
        if (this._tex && !LayaEnv.isPlaying) {
            this._tex.off("reload", this, this._onTextureReload);
            this._tex = null;
        }
    }
}
