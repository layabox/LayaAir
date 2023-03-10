import { Graphics } from "../display/Graphics"
import { Texture } from "../resource/Texture"
import { ILaya } from "../../ILaya";
import { Draw9GridTextureCmd } from "../display/cmd/Draw9GridTextureCmd";
import { DrawTextureCmd } from "../display/cmd/DrawTextureCmd";
import { LayaEnv } from "../../LayaEnv";

/**
 * <code>AutoBitmap</code> 类是用于表示位图图像或绘制图形的显示对象。
 * <p>封装了位置，宽高及九宫格的处理，供UI组件使用。</p>
 */
export class AutoBitmap extends Graphics {
    /**@private 宽度*/
    private _width = 0;
    /**@private 高度*/
    private _height = 0;
    /**@private 源数据*/
    private _source: Texture;
    /**@private 网格数据*/
    private _sizeGrid: number[];
    /**@private */
    protected _isChanged: boolean;

    protected _stateIndex: number;
    protected _stateNum: number;

    /**@internal */
    _offset: any[];
    uv: number[] = null;

    _color: string = "#ffffff";

    /**@private */
    private _drawGridCmd: Draw9GridTextureCmd | DrawTextureCmd;

    /**@inheritDoc 
     * @override
    */
    destroy(): void {
        super.destroy();
        if (this._source && !LayaEnv.isPlaying)
            this._source.off("reload", this, this._setChanged);
        this._source = null;
        this._sizeGrid = null;
        this._offset = null;
    }

    get sizeGrid(): number[] {
        return this._sizeGrid;
    }

    set sizeGrid(value: number[]) {
        this._sizeGrid = value ? value.map((v) => { return +v; }) : null;
        this._setChanged();
    }

    /**
     * 表示显示对象的宽度，以像素为单位。
     */
    get width(): number {
        if (this._width) return this._width;
        if (this._source) return this._source.sourceWidth;
        return 0;
    }

    set width(value: number) {
        if (this._width != value) {
            this._width = value;
            this._setChanged();
        }
    }

    /**
     * 表示显示对象的高度，以像素为单位。
     */
    get height(): number {
        if (this._height) return this._height;
        if (this._source) return this._source.sourceHeight / (this._source._stateNum || this._stateNum || 1);
        return 0;
    }

    set height(value: number) {
        if (this._height != value) {
            this._height = value;
            this._setChanged();
        }
    }

    /**
     * 对象的纹理资源。
     */
    get source(): Texture {
        return this._source;
    }

    set source(value: Texture) {
        if (this._source && !LayaEnv.isPlaying)
            this._source.off("reload", this, this._setChanged);
        if (value) {
            this._source = value;
            this._setChanged();
            if (!LayaEnv.isPlaying)
                value.on("reload", this, this._setChanged);
        } else {
            this._source = null;
            this._setDrawGridCmd(null);
        }
    }

    setState(index: number, numStates: number) {
        this._stateIndex = index;
        this._stateNum = numStates;
        this._setChanged();
    }

    get color() {
        return this._color;
    }

    set color(value: string) {
        if (this._color != value) {
            this._color = value;
            this._setChanged();
        }
    }

    /** @private */
    protected _setChanged(): void {
        if (!this._isChanged) {
            this._isChanged = true;
            ILaya.timer.callLater(this, this.changeSource);
        }
    }

    /**
     * @private
     * 修改纹理资源。
     */
    protected changeSource(): void {
        this._isChanged = false;
        let source = this._source;
        if (!source || !source.bitmap || !this._sp)
            return;

        let width = this.width;
        let height = this.height;
        let sizeGrid = this._sizeGrid || source._sizeGrid;
        let stateIndex = this._stateIndex;
        if (stateIndex != null) {
            let stateNum = source._stateNum || this._stateNum || 1;
            if (stateNum == 1)
                stateIndex = 0;
            else if (stateNum == 2) {
                if (stateIndex == 2)
                    stateIndex = 1;
                else
                    stateIndex = 0;
            }
            else if (stateNum == 3) {
                if (stateIndex == 3)
                    stateIndex = 0;
            }

            let h = source.height / stateNum;
            source = source.getCachedClip(0, h * stateIndex, source.width, h)
            if (!source)
                return;
        }

        let sw = source.sourceWidth;
        let sh = source.sourceHeight;

        //如果没有设置9宫格，或大小未改变，则直接用原图绘制
        let cmd: any;
        if (!sizeGrid || (sw === width && sh === height))
            cmd = DrawTextureCmd.create(source, this._offset ? this._offset[0] : 0, this._offset ? this._offset[1] : 0, width, height, null, 1, this._color, null, this.uv)
        else
            cmd = Draw9GridTextureCmd.create(source, 0, 0, width, height, sizeGrid, false, this._color);
        this._setDrawGridCmd(cmd);
        this._repaint();
    }

    /**
     *  由于可能有其他的graphic命令，因此不能用原来的直接clear()的方法
     */
    private _setDrawGridCmd(newcmd: any) {
        if (this._drawGridCmd)
            this.removeCmd(this._drawGridCmd);
        this._drawGridCmd = newcmd;
        if (newcmd)
            this.addCmd(newcmd);
    }
}
