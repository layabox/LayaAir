import { Graphics } from "../display/Graphics";
import { Texture } from "../resource/Texture";
import { Utils } from "../utils/Utils";
/**
 * <code>AutoBitmap</code> 类是用于表示位图图像或绘制图形的显示对象。
 * <p>封装了位置，宽高及九宫格的处理，供UI组件使用。</p>
 */
export class AutoBitmap extends Graphics {
    constructor() {
        super(...arguments);
        /**@private 是否自动缓存命令*/
        this.autoCacheCmd = true;
        /**@private 宽度*/
        this._width = 0;
        /**@private 高度*/
        this._height = 0;
        //override public function clear(recoverCmds:Boolean = true):void {
        ////重写clear，防止缓存被清理
        //super.clear(recoverCmds);
        //_key && WeakObject.I.del(_key);
        //}
    }
    ///**@private */
    //private var _key:String;
    /**@inheritDoc */
    /*override*/ destroy() {
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
    get sizeGrid() {
        return this._sizeGrid;
    }
    set sizeGrid(value) {
        this._sizeGrid = value.map((v) => { return +v; });
        this._setChanged();
    }
    /**
     * 表示显示对象的宽度，以像素为单位。
     */
    get width() {
        if (this._width)
            return this._width;
        if (this._source)
            return this._source.sourceWidth;
        return 0;
    }
    set width(value) {
        if (this._width != value) {
            this._width = value;
            this._setChanged();
        }
    }
    /**
     * 表示显示对象的高度，以像素为单位。
     */
    get height() {
        if (this._height)
            return this._height;
        if (this._source)
            return this._source.sourceHeight;
        return 0;
    }
    set height(value) {
        if (this._height != value) {
            this._height = value;
            this._setChanged();
        }
    }
    /**
     * 对象的纹理资源。
     * @see laya.resource.Texture
     */
    get source() {
        return this._source;
    }
    set source(value) {
        if (value) {
            this._source = value;
            this._setChanged();
        }
        else {
            this._source = null;
            this.clear();
        }
    }
    /** @private */
    _setChanged() {
        if (!this._isChanged) {
            this._isChanged = true;
            window.Laya.timer.callLater(this, this.changeSource);
        }
    }
    /**
     * @private
     * 修改纹理资源。
     */
    changeSource() {
        this._isChanged = false;
        var source = this._source;
        if (!source || !source.bitmap)
            return;
        var width = this.width;
        var height = this.height;
        var sizeGrid = this._sizeGrid;
        var sw = source.sourceWidth;
        var sh = source.sourceHeight;
        //如果没有设置9宫格，或大小未改变，则直接用原图绘制
        if (!sizeGrid || (sw === width && sh === height)) {
            this.clear();
            this.drawTexture(source, this._offset ? this._offset[0] : 0, this._offset ? this._offset[1] : 0, width, height);
        }
        else {
            //从缓存中读取渲染命令(和回收冲突，暂时去掉)
            //source.$_GID || (source.$_GID = Utils.getGID());
            //_key = source.$_GID + "." + width + "." + height + "." + sizeGrid.join(".");
            //if (Utils.isOKCmdList(WeakObject.I.get(_key))) {
            //this.cmds = WeakObject.I.get(_key);
            //return;
            //}
            this.clear();
            var top = sizeGrid[0];
            var right = sizeGrid[1];
            var bottom = sizeGrid[2];
            var left = sizeGrid[3];
            var repeat = sizeGrid[4];
            var needClip = false;
            if (width == sw) {
                left = right = 0;
            }
            if (height == sh) {
                top = bottom = 0;
            }
            //处理进度条不好看的问题
            if (left + right > width) {
                var clipWidth = width;
                needClip = true;
                width = left + right;
                this.save();
                this.clipRect(0, 0, clipWidth, height);
            }
            //绘制四个角
            left && top && this.drawImage(AutoBitmap.getTexture(source, 0, 0, left, top), 0, 0, left, top);
            right && top && this.drawImage(AutoBitmap.getTexture(source, sw - right, 0, right, top), width - right, 0, right, top);
            left && bottom && this.drawImage(AutoBitmap.getTexture(source, 0, sh - bottom, left, bottom), 0, height - bottom, left, bottom);
            right && bottom && this.drawImage(AutoBitmap.getTexture(source, sw - right, sh - bottom, right, bottom), width - right, height - bottom, right, bottom);
            //绘制上下两个边
            top && this.drawBitmap(repeat, AutoBitmap.getTexture(source, left, 0, sw - left - right, top), left, 0, width - left - right, top);
            bottom && this.drawBitmap(repeat, AutoBitmap.getTexture(source, left, sh - bottom, sw - left - right, bottom), left, height - bottom, width - left - right, bottom);
            //绘制左右两边
            left && this.drawBitmap(repeat, AutoBitmap.getTexture(source, 0, top, left, sh - top - bottom), 0, top, left, height - top - bottom);
            right && this.drawBitmap(repeat, AutoBitmap.getTexture(source, sw - right, top, right, sh - top - bottom), width - right, top, right, height - top - bottom);
            //绘制中间
            this.drawBitmap(repeat, AutoBitmap.getTexture(source, left, top, sw - left - right, sh - top - bottom), left, top, width - left - right, height - top - bottom);
            if (needClip)
                this.restore();
            //缓存命令
            //if (autoCacheCmd) WeakObject.I.set(_key, this.cmds);
        }
        this._repaint();
    }
    drawBitmap(repeat, tex, x, y, width = 0, height = 0) {
        if (width < 0.1 || height < 0.1)
            return;
        if (repeat && (tex.width != width || tex.height != height))
            this.fillTexture(tex, x, y, width, height);
        else
            this.drawImage(tex, x, y, width, height);
    }
    static getTexture(tex, x, y, width, height) {
        if (width <= 0)
            width = 1;
        if (height <= 0)
            height = 1;
        tex.$_GID || (tex.$_GID = Utils.getGID());
        //var key:String = tex.$_GID + "." + x + "." + y + "." + width + "." + height;
        //var texture:Texture = WeakObject.I.get(key);
        var texture;
        if (!texture || !texture._getSource()) {
            texture = Texture.createFromTexture(tex, x, y, width, height);
            //WeakObject.I.set(key, texture);
        }
        return texture;
    }
}
