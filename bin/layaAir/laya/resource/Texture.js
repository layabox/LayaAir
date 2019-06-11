import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Rectangle } from "../maths/Rectangle";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
/**
 * 资源加载完成后调度。
 * @eventType Event.READY
 */
/*[Event(name = "ready", type = "laya.events.Event")]*/
/**
 * <code>Texture</code> 是一个纹理处理类。
 */
export class Texture extends EventDispatcher {
    /**
     * 创建一个 <code>Texture</code> 实例。
     * @param	bitmap 位图资源。
     * @param	uv UV 数据信息。
     */
    constructor(bitmap = null, uv = null, sourceWidth = 0, sourceHeight = 0) {
        super();
        /**@private uv的范围*/
        this.uvrect = [0, 0, 1, 1]; //startu,startv, urange,vrange
        /**@private */
        this._destroyed = false;
        /**@private */
        this._referenceCount = 0;
        /**@private 唯一ID*/
        this.$_GID = 0;
        /**沿 X 轴偏移量。*/
        this.offsetX = 0;
        /**沿 Y 轴偏移量。*/
        this.offsetY = 0;
        /** @private */
        this._w = 0;
        /** @private */
        this._h = 0;
        /**原始宽度（包括被裁剪的透明区域）。*/
        this.sourceWidth = 0;
        /**原始高度（包括被裁剪的透明区域）。*/
        this.sourceHeight = 0;
        /**图片地址*/
        this.url = null;
        /** @private */
        this.scaleRate = 1;
        this.setTo(bitmap, uv, sourceWidth, sourceHeight);
    }
    /**
     * 平移 UV。
     * @param offsetX 沿 X 轴偏移量。
     * @param offsetY 沿 Y 轴偏移量。
     * @param uv 需要平移操作的的 UV。
     * @return 平移后的UV。
     */
    static moveUV(offsetX, offsetY, uv) {
        for (var i = 0; i < 8; i += 2) {
            uv[i] += offsetX;
            uv[i + 1] += offsetY;
        }
        return uv;
    }
    /**
     *  根据指定资源和坐标、宽高、偏移量等创建 <code>Texture</code> 对象。
     * @param	source 绘图资源 Texture2D 或者 Texture对象。
     * @param	x 起始绝对坐标 x 。
     * @param	y 起始绝对坐标 y 。
     * @param	width 宽绝对值。
     * @param	height 高绝对值。
     * @param	offsetX X 轴偏移量（可选）。	就是[x,y]相对于原始小图片的位置。一般都是正的，表示裁掉了空白边的大小，如果是负的一般表示加了保护边
     * @param	offsetY Y 轴偏移量（可选）。
     * @param	sourceWidth 原始宽度，包括被裁剪的透明区域（可选）。
     * @param	sourceHeight 原始高度，包括被裁剪的透明区域（可选）。
     * @return  <code>Texture</code> 对象。
     */
    static create(source, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = 0, sourceHeight = 0) {
        return Texture._create(source, x, y, width, height, offsetX, offsetY, sourceWidth, sourceHeight);
    }
    /**
     * @private
     * 根据指定资源和坐标、宽高、偏移量等创建 <code>Texture</code> 对象。
     * @param	source 绘图资源 Texture2D 或者 Texture 对象。
     * @param	x 起始绝对坐标 x 。
     * @param	y 起始绝对坐标 y 。
     * @param	width 宽绝对值。
     * @param	height 高绝对值。
     * @param	offsetX X 轴偏移量（可选）。
     * @param	offsetY Y 轴偏移量（可选）。
     * @param	sourceWidth 原始宽度，包括被裁剪的透明区域（可选）。
     * @param	sourceHeight 原始高度，包括被裁剪的透明区域（可选）。
     * @param	outTexture 返回的Texture对象。
     * @return  <code>Texture</code> 对象。
     */
    static _create(source, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = 0, sourceHeight = 0, outTexture = null) {
        var btex = source instanceof Texture;
        var uv = btex ? source.uv : Texture.DEF_UV;
        var bitmap = btex ? source.bitmap : source;
        if (bitmap.width && (x + width) > bitmap.width)
            width = bitmap.width - x;
        if (bitmap.height && (y + height) > bitmap.height)
            height = bitmap.height - y;
        var tex;
        if (outTexture) {
            tex = outTexture;
            tex.setTo(bitmap, null, sourceWidth || width, sourceHeight || height);
        }
        else {
            tex = new Texture(bitmap, null, sourceWidth || width, sourceHeight || height);
        }
        tex.width = width;
        tex.height = height;
        tex.offsetX = offsetX;
        tex.offsetY = offsetY;
        var dwidth = 1 / bitmap.width;
        var dheight = 1 / bitmap.height;
        x *= dwidth;
        y *= dheight;
        width *= dwidth;
        height *= dheight;
        var u1 = tex.uv[0], v1 = tex.uv[1], u2 = tex.uv[4], v2 = tex.uv[5];
        var inAltasUVWidth = (u2 - u1), inAltasUVHeight = (v2 - v1);
        var oriUV = Texture.moveUV(uv[0], uv[1], [x, y, x + width, y, x + width, y + height, x, y + height]);
        tex.uv = new Float32Array([u1 + oriUV[0] * inAltasUVWidth, v1 + oriUV[1] * inAltasUVHeight,
            u2 - (1 - oriUV[2]) * inAltasUVWidth, v1 + oriUV[3] * inAltasUVHeight,
            u2 - (1 - oriUV[4]) * inAltasUVWidth, v2 - (1 - oriUV[5]) * inAltasUVHeight,
            u1 + oriUV[6] * inAltasUVWidth, v2 - (1 - oriUV[7]) * inAltasUVHeight]);
        var bitmapScale = bitmap.scaleRate;
        if (bitmapScale && bitmapScale != 1) {
            tex.sourceWidth /= bitmapScale;
            tex.sourceHeight /= bitmapScale;
            tex.width /= bitmapScale;
            tex.height /= bitmapScale;
            tex.scaleRate = bitmapScale;
        }
        else {
            tex.scaleRate = 1;
        }
        return tex;
    }
    /**
     * 截取Texture的一部分区域，生成新的Texture，如果两个区域没有相交，则返回null。
     * @param	texture	目标Texture。
     * @param	x		相对于目标Texture的x位置。
     * @param	y		相对于目标Texture的y位置。
     * @param	width	截取的宽度。
     * @param	height	截取的高度。
     * @return 返回一个新的Texture。
     */
    static createFromTexture(texture, x, y, width, height) {
        var texScaleRate = texture.scaleRate;
        if (texScaleRate != 1) {
            x *= texScaleRate;
            y *= texScaleRate;
            width *= texScaleRate;
            height *= texScaleRate;
        }
        var rect = Rectangle.TEMP.setTo(x - texture.offsetX, y - texture.offsetY, width, height);
        var result = rect.intersection(Texture._rect1.setTo(0, 0, texture.width, texture.height), Texture._rect2);
        if (result)
            var tex = Texture.create(texture, result.x, result.y, result.width, result.height, result.x - rect.x, result.y - rect.y, width, height);
        else
            return null;
        return tex;
    }
    get uv() {
        return this._uv;
    }
    set uv(value) {
        this.uvrect[0] = Math.min(value[0], value[2], value[4], value[6]);
        this.uvrect[1] = Math.min(value[1], value[3], value[5], value[7]);
        this.uvrect[2] = Math.max(value[0], value[2], value[4], value[6]) - this.uvrect[0];
        this.uvrect[3] = Math.max(value[1], value[3], value[5], value[7]) - this.uvrect[1];
        this._uv = value;
    }
    /** 实际宽度。*/
    get width() {
        if (this._w)
            return this._w;
        if (!this.bitmap)
            return 0;
        return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[2] - this.uv[0]) * this.bitmap.width : this.bitmap.width;
    }
    set width(value) {
        this._w = value;
        this.sourceWidth || (this.sourceWidth = value);
    }
    /** 实际高度。*/
    get height() {
        if (this._h)
            return this._h;
        if (!this.bitmap)
            return 0;
        return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[5] - this.uv[1]) * this.bitmap.height : this.bitmap.height;
    }
    set height(value) {
        this._h = value;
        this.sourceHeight || (this.sourceHeight = value);
    }
    /**
     * 获取位图。
     * @return 位图。
     */
    get bitmap() {
        return this._bitmap;
    }
    /**
     * 设置位图。
     * @param 位图。
     */
    set bitmap(value) {
        this._bitmap && this._bitmap._removeReference(this._referenceCount);
        this._bitmap = value;
        value && (value._addReference(this._referenceCount));
    }
    /**
     * 获取是否已经销毁。
     * @return 是否已经销毁。
     */
    get destroyed() {
        return this._destroyed;
    }
    /**
     * @private
     */
    _addReference() {
        this._bitmap && this._bitmap._addReference();
        this._referenceCount++;
    }
    /**
     * @private
     */
    _removeReference() {
        this._bitmap && this._bitmap._removeReference();
        this._referenceCount--;
    }
    /**
     * @private
     */
    _getSource(cb = null) {
        if (this._destroyed || !this._bitmap)
            return null;
        this.recoverBitmap(cb);
        return this._bitmap.destroyed ? null : this.bitmap._getSource();
    }
    /**
     * @private
     */
    _onLoaded(complete, context) {
        if (!context) {
        }
        else if (context == this) {
        }
        else if (context instanceof Texture) {
            var tex = context;
            Texture._create(context, 0, 0, tex.width, tex.height, 0, 0, tex.sourceWidth, tex.sourceHeight, this);
        }
        else {
            this.bitmap = context;
            this.sourceWidth = this._w = context.width;
            this.sourceHeight = this._h = context.height;
        }
        complete && complete.run();
        this.event(Event.READY, this);
    }
    /**
     * 获取是否可以使用。
     */
    getIsReady() {
        return this._destroyed ? false : (this._bitmap ? true : false);
    }
    /**
     * 设置此对象的位图资源、UV数据信息。
     * @param	bitmap 位图资源
     * @param	uv UV数据信息
     */
    setTo(bitmap = null, uv = null, sourceWidth = 0, sourceHeight = 0) {
        this.bitmap = bitmap;
        this.sourceWidth = sourceWidth;
        this.sourceHeight = sourceHeight;
        if (bitmap) {
            this._w = bitmap.width;
            this._h = bitmap.height;
            this.sourceWidth = this.sourceWidth || bitmap.width;
            this.sourceHeight = this.sourceHeight || bitmap.height;
        }
        this.uv = uv || Texture.DEF_UV;
    }
    /**
     * 加载指定地址的图片。
     * @param	url 图片地址。
     * @param	complete 加载完成回调
     */
    load(url, complete = null) {
        if (!this._destroyed)
            ILaya.loader.load(url, Handler.create(this, this._onLoaded, [complete]), null, "htmlimage", 1, false, null, true);
    }
    getTexturePixels(x, y, width, height) {
        var st, dst, i;
        var tex2d = this.bitmap;
        var texw = tex2d.width;
        var texh = tex2d.height;
        if (x + width > texw)
            width -= (x + width) - texw;
        if (y + height > texh)
            height -= (y + height) - texh;
        if (width <= 0 || height <= 0)
            return null;
        var wstride = width * 4;
        var pix = null;
        try {
            pix = tex2d.getPixels();
        }
        catch (e) {
        }
        if (pix) {
            if (x == 0 && y == 0 && width == texw && height == texh)
                return pix;
            //否则只取一部分
            var ret = new Uint8Array(width * height * 4);
            wstride = texw * 4;
            st = x * 4;
            dst = (y + height - 1) * wstride + x * 4;
            for (i = height - 1; i >= 0; i--) {
                ret.set(dt.slice(dst, dst + width * 4), st);
                st += wstride;
                dst -= wstride;
            }
            return ret;
        }
        // 如果无法直接获取，只能先渲染出来
        var ctx = new ILaya.Context();
        ctx.size(width, height);
        ctx.asBitmap = true;
        var uv = null;
        if (x != 0 || y != 0 || width != texw || height != texh) {
            uv = uv.concat(); // 复制一份uv
            var stu = uv[0];
            var stv = uv[1];
            var uvw = uv[2] - stu;
            var uvh = uv[7] - stv;
            var uk = uvw / texw;
            var vk = uvh / texh;
            uv = [stu + x * uk, stv + y * vk,
                stu + (x + width) * uk, stv + y * vk,
                stu + (x + width) * uk, stv + (y + height) * vk,
                stu + x * uk, stv + (y + height) * vk];
        }
        ctx._drawTextureM(this, 0, 0, width, height, null, 1.0, uv);
        //ctx.drawTexture(value, -x, -y, x + width, y + height);
        ctx._targets.start();
        ctx.flush();
        ctx._targets.end();
        ctx._targets.restore();
        var dt = ctx._targets.getData(0, 0, width, height);
        ctx.destroy();
        // 上下颠倒一下
        ret = new Uint8Array(width * height * 4);
        st = 0;
        dst = (height - 1) * wstride;
        for (i = height - 1; i >= 0; i--) {
            ret.set(dt.slice(dst, dst + wstride), st);
            st += wstride;
            dst -= wstride;
        }
        return ret;
    }
    /**
     * 获取Texture上的某个区域的像素点
     * @param	x
     * @param	y
     * @param	width
     * @param	height
     * @return  返回像素点集合
     */
    getPixels(x, y, width, height) {
        if (window.conch) {
            return this._nativeObj.getImageData(x, y, width, height);
        }
        else {
            return this.getTexturePixels(x, y, width, height);
        } // canvas 不支持
    }
    /**
     * 通过url强制恢复bitmap。
     */
    recoverBitmap(onok = null) {
        var url = this._bitmap.url;
        if (!this._destroyed && (!this._bitmap || this._bitmap.destroyed) && url) {
            ILaya.loader.load(url, Handler.create(this, function (bit) {
                this.bitmap = bit;
                onok && onok();
            }), null, "htmlimage", 1, false, null, true);
        }
    }
    /**
     * 强制释放Bitmap,无论是否被引用。
     */
    disposeBitmap() {
        if (!this._destroyed && this._bitmap) {
            this._bitmap.destroy();
        }
    }
    /**
     * 销毁纹理。
     */
    destroy(force = false) {
        if (!this._destroyed) {
            this._destroyed = true;
            var bit = this._bitmap;
            if (bit) {
                bit._removeReference(this._referenceCount);
                if (bit.referenceCount === 0 || force)
                    bit.destroy();
                bit = null;
            }
            if (this.url && this === ILaya.loader.getRes(this.url))
                ILaya.loader.clearRes(this.url);
        }
    }
}
/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
/**@private 默认 UV 信息。*/
Texture.DEF_UV = new Float32Array([0, 0, 1.0, 0, 1.0, 1.0, 0, 1.0]);
/**@private */
Texture.NO_UV = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
/**@private 反转 UV 信息。*/
Texture.INV_UV = new Float32Array([0, 1, 1.0, 1, 1.0, 0.0, 0, 0.0]);
/**@private */
Texture._rect1 = new Rectangle();
/**@private */
Texture._rect2 = new Rectangle();
