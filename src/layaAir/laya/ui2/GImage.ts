import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Draw9GridTextureCmd } from "../display/cmd/Draw9GridTextureCmd";
import { DrawTextureCmd } from "../display/cmd/DrawTextureCmd";
import { FillTextureCmd } from "../display/cmd/FillTextureCmd";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { GWidget } from "./GWidget";

export class GImage extends GWidget {
    private _src: string = "";
    private _source: Texture;
    private _useSourceSize: boolean;
    private _isChanged: boolean;
    private _color: string;
    private _tile: boolean;
    private _drawCmd: DrawTextureCmd | Draw9GridTextureCmd | FillTextureCmd;

    constructor() {
        super();

        this._color = "#FFFFFF";
        this._tile = false;
        this._useSourceSize = true;
    }

    public get src(): string {
        return this._src;
    }

    public set src(value: string) {
        if (this._src == value)
            return;

        this._src = value;
        if (value)
            ILaya.loader.load(value).then(res => this.onLoad(res, value));
        else
            this.onLoad(null, value);
    }

    public get texture(): Texture {
        return this._source;
    }

    public set texture(value: Texture) {
        this._src = "";
        this._source = value;
        this.onLoad(value, "");
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
        return this._useSourceSize;
    }

    set autoSize(value: boolean) {
        if (this._useSourceSize != value) {
            if (value && this._source)
                this.size(this._source.sourceWidth, this._source.sourceHeight);
            this._useSourceSize = value; //放最后，因为size会改变autoSize的值
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
            this._setChanged();
        }
    }

    protected onLoad(res: Texture, src: string) {
        if (src != this._src)
            return;

        if (res && !LayaEnv.isPlaying)
            res.off("reload", this, this._onTextureReload);
        this._source = res;
        if (res) {
            this._setChanged();
            if (!LayaEnv.isPlaying)
                res.on("reload", this, this._onTextureReload);
        } else {
            this._source = null;
            this._setDrawCmd(null);
        }

        if (this._useSourceSize) {
            if (res)
                this.size(res.width, res.height);
            else
                this.size(0, 0);
            this._useSourceSize = true;
        }
    }

    private _onTextureReload() {
        this.event("resource_reload");
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
        let source = this._source;
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
        this._setDrawCmd(cmd);
    }

    /**
     * @en Due to the possibility of other graphic commands, the original method of directly using clear() cannot be used.
     * @zh 由于可能有其他的graphic命令，因此不能用原来的直接clear()的方法
     */
    private _setDrawCmd(newcmd: any) {
        if (this._drawCmd) {
            this.graphics.removeCmd(this._drawCmd);
            this._drawCmd.recover();
        }
        this._drawCmd = newcmd;
        if (newcmd)
            this.graphics.addCmd(newcmd);
    }

    protected _sizeChanged(changeByLayout?: boolean): void {
        super._sizeChanged();

        if (!changeByLayout && !SerializeUtil.isDeserializing)
            this._useSourceSize = false;
    }

    protected onReload() {
        if (this._useSourceSize) {
            let tex = this._source;
            this.size(tex.width, tex.height);
            this._useSourceSize = true;
        }
    }
}
