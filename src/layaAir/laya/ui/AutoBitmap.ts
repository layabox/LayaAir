import { Graphics } from "../display/Graphics"
import { Texture } from "../resource/Texture"
import { Utils } from "../utils/Utils"
import { ClassUtils } from "../utils/ClassUtils";
import { ILaya } from "../../ILaya";
import { Draw9GridTexture } from "../display/cmd/Draw9GridTexture";
import { DrawTextureCmd } from "../display/cmd/DrawTextureCmd";
import { SpriteConst } from "../display/SpriteConst";
import { Matrix } from "../maths/Matrix";

/**
 * <code>AutoBitmap</code> 类是用于表示位图图像或绘制图形的显示对象。
 * <p>封装了位置，宽高及九宫格的处理，供UI组件使用。</p>
 */
export class AutoBitmap extends Graphics {
    /**@private 是否自动缓存命令*/
    autoCacheCmd = true;
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
    /**@internal */
    _offset: any[];
    uv: number[] = null;
    ///**@private */
    //private var _key:String;
    private  _drawGridCmd:Draw9GridTexture|null;

    /**@inheritDoc 
     * @override
    */
    destroy(): void {
        super.destroy();
        this._source = null;
        this._sizeGrid = null;
        this._offset = null;
    }

    /**
     * 当前实例的有效缩放网格数据。
     * <p>如果设置为null,则在应用任何缩放转换时，将正常缩放整个显示对象。</p>
     * <p>数据格式：[上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)]。
     * <ul><li>例如：[4,4,4,4,1]</li></ul></p>
     * <p> <code>sizeGrid</code> 的值如下所示：
     * <ol>
     * <li>上边距</li>
     * <li>右边距</li>
     * <li>下边距</li>
     * <li>左边距</li>
     * <li>是否重复填充(值为0：不重复填充，1：重复填充)</li>
     * </ol></p>
     * <p>当定义 <code>sizeGrid</code> 属性时，该显示对象被分割到以 <code>sizeGrid</code> 数据中的"上边距,右边距,下边距,左边距" 组成的矩形为基础的具有九个区域的网格中，该矩形定义网格的中心区域。网格的其它八个区域如下所示：
     * <ul>
     * <li>矩形上方的区域</li>
     * <li>矩形外的右上角</li>
     * <li>矩形左侧的区域</li>
     * <li>矩形右侧的区域</li>
     * <li>矩形外的左下角</li>
     * <li>矩形下方的区域</li>
     * <li>矩形外的右下角</li>
     * <li>矩形外的左上角</li>
     * </ul>
     * 同时也支持3宫格，比如0,4,0,4,1为水平3宫格，4,0,4,0,1为垂直3宫格，3宫格性能比9宫格高。
     * </p>
     */
    get sizeGrid(): number[] {
        return this._sizeGrid;
    }

    set sizeGrid(value: number[]) {
        this._sizeGrid = value.map((v) => { return +v; });
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
        if (this._source) return this._source.sourceHeight;
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
     * @see laya.resource.Texture
     */
    get source(): Texture {
        return this._source;
    }

    set source(value: Texture) {
        if (value) {
            this._source = value
            this._setChanged();
        } else {
            this._source = null;
            //this.clear();     可能有其他graphic命令，不能直接clear
            if(this._drawGridCmd){
                // 去掉 this._drawGridCmd
                if(this._one){
                    if(this._one == this._drawGridCmd){
						this.clear();
					}
                }
                let cmds = this.cmds;
                if(cmds && cmds.length>0){
                    // 只处理第一个
                    if(cmds[0]==this._drawGridCmd){
                        cmds.splice(0,1);
                    }
                }
            }
        }
    }

    /** @private */
    protected _setChanged(): void {
        if (!this._isChanged) {
            this._isChanged = true;
            ILaya.timer.callLater(this, this.changeSource);
        }
    }

    private   _createDrawTexture(texture: Texture|null, x: number = 0, y: number = 0, width: number = 0, height: number = 0, matrix: Matrix|null = null, alpha: number = 1, color: string|null = null, blendMode: string|null = null, uv?: number[]): DrawTextureCmd|null {
        if (!texture || alpha < 0.01) return null;
        if (!texture.getIsReady()) return null;
        if (!width) width = texture.sourceWidth;
        if (!height) height = texture.sourceHeight;
        if (texture.getIsReady()) {
            var wRate = width / texture.sourceWidth;
            var hRate = height / texture.sourceHeight;
            width = texture.width * wRate;
            height = texture.height * hRate;
            if (width <= 0 || height <= 0) return null;

            x += texture.offsetX * wRate;
            y += texture.offsetY * hRate;
        }

        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }

        return DrawTextureCmd.create.call(this, texture, x, y, width, height, matrix, alpha, color, blendMode, uv);
    }

    /**
     * @private
     * 修改纹理资源。
     */
    protected changeSource(): void {
        this._isChanged = false;
        var source = this._source;
        if (!source || !source.bitmap) return;

        var width = this.width;
        var height = this.height;
        var sizeGrid = this._sizeGrid;
        var sw = source.sourceWidth;
        var sh = source.sourceHeight;

        //如果没有设置9宫格，或大小未改变，则直接用原图绘制
        if (!sizeGrid || (sw === width && sh === height)) {
            let cmd = this._createDrawTexture(source, this._offset ? this._offset[0] : 0, this._offset ? this._offset[1] : 0, width, height, null, 1, null, null, this.uv);
            cmd && this._setDrawGridCmd(cmd);
        } else {
            let cmd = Draw9GridTexture.create(source, 0, 0, width, height, sizeGrid);
            this._setDrawGridCmd(cmd);
        }
        this._repaint();
    }

    private drawBitmap(repeat: boolean, tex: Texture, x: number, y: number, width: number = 0, height: number = 0): void {
        if (width < 0.1 || height < 0.1) return;
        if (repeat && (tex.width != width || tex.height != height)) this.fillTexture(tex, x, y, width, height);
        else this.drawImage(tex, x, y, width, height);
    }

    private static getTexture(tex: Texture, x: number, y: number, width: number, height: number): Texture {
        if (width <= 0) width = 1;
        if (height <= 0) height = 1;
        tex.$_GID || (tex.$_GID = Utils.getGID())
        //var key:String = tex.$_GID + "." + x + "." + y + "." + width + "." + height;
        //var texture:Texture = WeakObject.I.get(key);
        var texture: Texture;
        if (!texture || !texture._getSource()) {
            texture = Texture.createFromTexture(tex, x, y, width, height);
            //WeakObject.I.set(key, texture);
        }
        return texture;
    }

    /**
     *  由于可能有其他的graphic命令，因此不能用原来的直接clear()的方法
     */
    private _setDrawGridCmd(newcmd:any){
        var source = this._source;
        if (!source || !source.bitmap){
            return;
        } 

        //let newcmd = Draw9GridTexture.create(source, 0, 0, width, height, sizeGrid);
        let cmds = this.cmds;
        if(!this._one && (!cmds || cmds.length<=0)){
            // 如果没有，直接添加
            this._saveToCmd(null,newcmd);
        }else{
            // 如果只有一个
            let lastOne = this._one;
            if(lastOne){
                if(lastOne==this._drawGridCmd){
                    // 如果one就是drawgrid，则替换
                    this._one = newcmd;
                }else{
                    // 否则，就是两个命令
                    this.clear();
                    this._saveToCmd(null,newcmd);
                    this._saveToCmd(null,lastOne);
                }
            }else{
                // 本身就有多个命令，则把自己插入到第一个
                cmds.splice(0,0,newcmd);
            }
        }
        this._drawGridCmd=newcmd;
    }
}

ClassUtils.regClass("laya.ui.AutoBitmap", AutoBitmap);
ClassUtils.regClass("Laya.AutoBitmap", AutoBitmap);