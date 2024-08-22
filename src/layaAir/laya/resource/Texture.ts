import { Texture2D } from "./Texture2D";
import { Event } from "../events/Event"
import { Rectangle } from "../maths/Rectangle"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { BaseTexture } from "./BaseTexture";
import { Resource } from "./Resource";
import { RenderTexture2D } from "./RenderTexture2D";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";

const _rect1 = new Rectangle();
const _rect2 = new Rectangle();

/**
 * @en The Texture is a texture processing class.
 * @zh Texture 是一个纹理处理类。
 */
export class Texture extends Resource {
    /**
     * @private 
     * @en Default UV information.
     * @zh 默认 UV 信息。
     */
    static readonly DEF_UV = new Float32Array([0, 0, 1.0, 0, 1.0, 1.0, 0, 1.0]);
    /**
     * @private 
     * @en No UV information.
     * @zh 无 UV 信息
     */
    static readonly NO_UV = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
    /**
     * @private 
     * @en Inverse UV information.
     * @zh 反转 UV 信息。
     */
    static readonly INV_UV = new Float32Array([0, 1, 1.0, 1, 1.0, 0.0, 0, 0.0]);

    /**
     * @private
     * @en Range of UV
     * @zh uv的范围
     */
    uvrect: number[] = [0, 0, 1, 1]; //startu,startv, urange,vrange
    /**@private */
    private _bitmap: BaseTexture;
    /**@internal */
    public _uv: ArrayLike<number>;
    /** @private */
    private _w: number = 0;
    /** @private */
    private _h: number = 0;

    /**
     * @en The offset along the X-axis.
     * @zh 沿 X 轴的偏移量。
     */
    offsetX: number = 0;
    /**
     * @en The offset along the Y-axis.
     * @zh 沿 Y 轴的偏移量。
     */
    offsetY: number = 0;
    /**
     * @en The original width of the texture, including any transparent areas that have been cropped out.
     * @zh 包括已被裁剪掉的透明区域的纹理原始宽度。
     */
    sourceWidth: number = 0;
    /**
     * @en The original height of the texture, including any transparent areas that have been cropped out.
     * @zh 包括已被裁剪掉的透明区域的纹理原始高度。
     */
    sourceHeight: number = 0;
    /**
     * @en The URL of the texture image.
     * @zh 纹理图片的地址。
     */
    url: string;
    /**
     * @en The UUID of the texture.
     * @zh 纹理的 UUID。
     */
    uuid: string;
    /**
     * @private 
     * @en The scale rate of the texture.
     * @zh 纹理的缩放率。
     */
    scaleRate: number = 1;

    /**
     * 九宫格
     * @internal
     */
    _sizeGrid?: Array<number>;
    /**
     * 状态数量
     * @internal
     */
    _stateNum?: number;

    /**@internal */
    _clipCache: Map<string, Texture>;

    /**
     * @en Creates a `Texture` object based on the specified source, coordinates, dimensions, and offsets.
     * @param source The source texture, either a `Texture2D` or a `Texture` object.
     * @param x The starting absolute x coordinate.
     * @param y The starting absolute y coordinate.
     * @param width The absolute width.
     * @param height The absolute height.
     * @param offsetX The offset on the X-axis (optional). It is the position of [x, y] relative to the original small image. Generally, it is positive, indicating that the size of the blank edge has been cut off. If it is negative, it usually indicates that a protective edge has been added
     * @param offsetY The offset on the Y-axis (optional).
     * @param sourceWidth The original width, including any cropped transparent areas (optional).
     * @param sourceHeight The original height, including any cropped transparent areas (optional).
     * @returns A `Texture` object.
     * @zh 根据指定的资源、坐标、宽高和偏移量等创建 `Texture` 对象。
     * @param source 资源，可以是 `Texture2D` 或 `Texture` 对象。
     * @param x 绝对坐标 x 。
     * @param y 绝对坐标 y 。
     * @param width 绝对宽度。
     * @param height 绝对高度。
     * @param offsetX X 轴偏移量（可选）。 就是[x,y]相对于原始小图片的位置。一般都是正的，表示裁掉了空白边的大小，如果是负的一般表示加了保护边
     * @param offsetY Y 轴偏移量（可选）。
     * @param sourceWidth 原始宽度，包括被裁剪的透明区域（可选）。
     * @param sourceHeight 原始高度，包括被裁剪的透明区域（可选）。
     * @return `Texture` 对象。
     */
    static create(source: Texture | BaseTexture, x: number, y: number, width: number, height: number,
        offsetX: number = 0, offsetY: number = 0,
        sourceWidth: number = 0, sourceHeight: number = 0): Texture {
        return Texture._create(source, x, y, width, height, offsetX, offsetY, sourceWidth, sourceHeight);
    }

    /**
     * @internal
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
    static _create(source: Texture | BaseTexture, x: number, y: number, width: number, height: number,
        offsetX: number = 0, offsetY: number = 0,
        sourceWidth: number = 0, sourceHeight: number = 0, outTexture: Texture = null): Texture {
        var btex: boolean = source instanceof Texture;
        var uv = btex ? ((<Texture>source)).uv : Texture.DEF_UV;
        var bitmap = btex ? ((<Texture>source)).bitmap : <Texture2D>source;

        if (bitmap.width && (x + width) > bitmap.width)
            width = bitmap.width - x;
        if (bitmap.height && (y + height) > bitmap.height)
            height = bitmap.height - y;
        var tex: Texture;
        if (outTexture) {
            tex = outTexture;
            tex.setTo(bitmap, null, sourceWidth || width, sourceHeight || height);
        } else {
            tex = new Texture(bitmap, null, sourceWidth || width, sourceHeight || height)
        }
        tex.width = width;
        tex.height = height;
        tex.offsetX = offsetX;
        tex.offsetY = offsetY;

        var dwidth: number = 1 / bitmap.width;
        var dheight: number = 1 / bitmap.height;
        x *= dwidth;
        y *= dheight;
        width *= dwidth;
        height *= dheight;

        var u1: number = tex.uv[0], v1: number = tex.uv[1], u2: number = tex.uv[4], v2: number = tex.uv[5];
        var inAltasUVWidth: number = (u2 - u1), inAltasUVHeight: number = (v2 - v1);
        var oriUV: any[] = moveUV(uv[0], uv[1], [x, y, x + width, y, x + width, y + height, x, y + height]);
        tex.uv = new Float32Array([u1 + oriUV[0] * inAltasUVWidth, v1 + oriUV[1] * inAltasUVHeight,
        u2 - (1 - oriUV[2]) * inAltasUVWidth, v1 + oriUV[3] * inAltasUVHeight,
        u2 - (1 - oriUV[4]) * inAltasUVWidth, v2 - (1 - oriUV[5]) * inAltasUVHeight,
        u1 + oriUV[6] * inAltasUVWidth, v2 - (1 - oriUV[7]) * inAltasUVHeight]);

        var bitmapScale: number = (<Texture>source).scaleRate;
        if (bitmapScale && bitmapScale != 1) {
            tex.sourceWidth /= bitmapScale;
            tex.sourceHeight /= bitmapScale;
            tex.width /= bitmapScale;
            tex.height /= bitmapScale;
            tex.scaleRate = bitmapScale;
            tex.offsetX /= bitmapScale;
            tex.offsetY /= bitmapScale;
        } else {
            tex.scaleRate = 1;
        }
        return tex;
    }

    /**
     * @en Creates a new `Texture` by cropping a part of an existing `Texture`. If the two areas do not intersect, it returns null.
     * @param texture The target `Texture` to crop.
     * @param x The x position relative to the target `Texture`.
     * @param y The y position relative to the target `Texture`.
     * @param width The width to crop.
     * @param height The height to crop.
     * @returns A new `Texture` or null if the areas do not intersect.
     * @zh 截取 `Texture` 的一部分区域，生成一个新的 `Texture`，如果两个区域没有相交，则返回 null。
     * @param texture 目标 `Texture` 。
     * @param x 相对于目标 `Texture` 的 x 位置。
     * @param y 相对于目标 `Texture` 的 y 位置。
     * @param width 截取的宽度。
     * @param height 截取的高度。
     * @return 一个新的 `Texture` 或 null，如果两个区域没有相交。
     */
    static createFromTexture(texture: Texture, x: number, y: number, width: number, height: number): Texture {
        var texScaleRate: number = texture.scaleRate;
        if (texScaleRate != 1) {
            x *= texScaleRate;
            y *= texScaleRate;
            width *= texScaleRate;
            height *= texScaleRate;
        }
        var rect: Rectangle = Rectangle.TEMP.setTo(x - texture.offsetX, y - texture.offsetY, width, height);
        var result = rect.intersection(_rect1.setTo(0, 0, texture.width, texture.height), _rect2);
        if (result)
            return Texture.create(texture, result.x, result.y, result.width, result.height, result.x - rect.x, result.y - rect.y, width, height);
        else
            return null;
    }

    /**
     * @en The UV coordinates of the texture.
     * @zh 纹理的 UV 坐标。
     */
    get uv(): ArrayLike<number> {
        return this._uv;
    }

    set uv(value: ArrayLike<number>) {
        this.uvrect[0] = Math.min(value[0], value[2], value[4], value[6]);
        this.uvrect[1] = Math.min(value[1], value[3], value[5], value[7]);
        this.uvrect[2] = Math.max(value[0], value[2], value[4], value[6]) - this.uvrect[0];
        this.uvrect[3] = Math.max(value[1], value[3], value[5], value[7]) - this.uvrect[1];
        this._uv = value;
    }

    /**
     * @en The actual width of the texture.
     * @zh 纹理的实际宽度。
     */
    get width(): number {
        if (this._w)
            return this._w;
        if (!this.bitmap) return 0;
        return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[2] - this.uv[0]) * this.bitmap.width : this.bitmap.width;
    }

    set width(value: number) {
        this._w = value;
        this.sourceWidth || (this.sourceWidth = value);
    }

    /**
     * @en The actual height of the texture.
     * @zh 纹理的实际高度。
     */
    get height(): number {
        if (this._h)
            return this._h;
        if (!this.bitmap) return 0;
        return (this.uv && this.uv !== Texture.DEF_UV) ? (this.uv[5] - this.uv[1]) * this.bitmap.height : this.bitmap.height;
    }

    set height(value: number) {
        this._h = value;
        this.sourceHeight || (this.sourceHeight = value);
    }

    /**
     * @en The bitmap of the texture.
     * @zh 纹理的位图。
     */
    get bitmap(): BaseTexture {
        return this._bitmap;
    }

    set bitmap(value: BaseTexture) {
        if (this._bitmap == value)
            return;
        this._bitmap && this._bitmap._removeReference(this._referenceCount);
        this._bitmap = value;
        value && (value._addReference(this._referenceCount));
    }

    /**
     * @en Constructor method.
     * @param bitmap Bitmap resource.
     * @param uv UV data information.
     * @zh 构造方法。
     * @param bitmap 位图资源。
     * @param uv UV 数据信息。
     */
    constructor(source: Texture | BaseTexture = null, uv: ArrayLike<number> = null,
        sourceWidth: number = 0, sourceHeight: number = 0) {
        super(false);
        let bitmap = (source instanceof Texture) ? source.bitmap : source;
        this.setTo(bitmap, uv, sourceWidth, sourceHeight);
    }

    /**
     * @internal
     */
    _addReference(count: number = 1): void {
        super._addReference(count);
        this._bitmap && this._bitmap._addReference(count);
    }

    /**
     * @internal
     */
    _removeReference(count: number = 1): void {
        this._bitmap && this._bitmap._removeReference(count);
        super._removeReference(count);
    }

    /**
     * @internal
     */
    _getSource(cb: () => void = null): any {
        if (this._destroyed || !this._bitmap)
            return null;
        this.recoverBitmap(cb);
        return this._bitmap.destroyed ? null : this.bitmap._getSource();
    }

    /**
     * @en Sets the bitmap resource and UV data information for this object.
     * @param bitmap The bitmap resource.
     * @param uv The UV data information.
     * @param sourceWidth The original width of the texture.
     * @param sourceHeight The original height of the texture.
     * @zh 设置此对象的位图资源和 UV 数据信息。
     * @param bitmap 位图资源。
     * @param uv UV 数据信息。
     * @param sourceWidth 纹理原始宽度。
     * @param sourceHeight 纹理原始高度。
     */
    setTo(bitmap: BaseTexture = null, uv: ArrayLike<number> = null,
        sourceWidth: number = 0, sourceHeight: number = 0): void {
        this.bitmap = bitmap;
        this.sourceWidth = sourceWidth;
        this.sourceHeight = sourceHeight;

        if (bitmap) {
            this._w = bitmap.width;
            this._h = bitmap.height;
            this.sourceWidth = this.sourceWidth || bitmap.width;
            this.sourceHeight = this.sourceHeight || bitmap.height
        }
        this.uv = uv || Texture.DEF_UV;
    }

    /**
     * @en Loads an image from the specified URL.
     * @param url The URL of the image to load.
     * @param complete An optional callback function that is called when the image is loaded.
     * @returns A promise that resolves to the loaded image.
     * @zh 从指定的 URL 加载图片。
     * @param url 图片地址。    
     * @param complete 加载完成回调。
     * @returns 一个 Promise 对象，解析为加载的图片。
     */
    load(url: string, complete?: Handler): Promise<void> {
        if (this._destroyed)
            return Promise.resolve();

        return ILaya.loader.load(url).then((tex: Texture) => {
            let bit = tex.bitmap;
            this.bitmap = bit;
            this.sourceWidth = this._w = bit.width;
            this.sourceHeight = this._h = bit.height;
            complete && complete.run();
            this.event(Event.READY, this);
        });
    }

    /**
     * @en Retrieves the pixel data from a region of the texture.
     * @param x The x-coordinate of the region.
     * @param y The y-coordinate of the region.
     * @param width The width of the region.
     * @param height The height of the region.
     * @returns A Uint8Array containing the pixel data.
     * @zh 从纹理的特定区域获取像素数据。
     * @param x 区域的 x 坐标。
     * @param y 区域的 y 坐标。
     * @param width 区域的宽度。
     * @param height 区域的高度。
     * @return 一个 Uint8Array 对象，包含了像素数据。   
     */
    getTexturePixels(x: number, y: number, width: number, height: number): Uint8Array {
        var st: number, dst: number, i: number;
        var tex2d = this.bitmap;
        // 适配图集
        var texw = this._w;
        var texh = this._h;
        var sourceWidth = this.sourceWidth;
        var sourceHeight = this.sourceHeight;
        var tex2dw = tex2d.width;
        var tex2dh = tex2d.height;
        var offsetX = this.offsetX;
        var offsetY = this.offsetY;
        let draww = width;
        let drawh = height;
        if (x + width > texw + offsetX) draww -= (x + width) - texw - offsetX;
        if (x + width > sourceWidth) width -= (x + width) - sourceWidth;
        if (y + height > texh + offsetY) drawh -= (y + height) - texh - offsetY;
        if (y + height > sourceHeight) height -= (y + height) - sourceHeight;
        if (width <= 0 || height <= 0) return null;
        let marginL = offsetX > x ? offsetX - x : 0; // 考虑图集的情况，只渲染图集中的图片，左侧可能需要补充空白
        let marginT = offsetY > y ? offsetY - y : 0;
        let rePosX = x > offsetX ? x - offsetX : 0; // 考虑图集的情况，只渲染图集中的图片，不渲染 offset，需要重新定位 x 坐标
        let rePosY = y > offsetY ? y - offsetY : 0;
        draww -= marginL; // 考虑图集的情况，只渲染图集中的图片，其大小要减去空白
        drawh -= marginT;

        var wstride = width * 4;
        var pix: Uint8Array = null;
        try {
            pix = <Uint8Array>(tex2d as Texture2D).getPixels();
        } catch (e) {
        }
        if (pix) {
            if (x == 0 && y == 0 && width == tex2dw && height == tex2dh)
                return pix;
            //否则只取一部分
            let uv = (this._uv as Array<number>).slice();
            let atlasPosX = Math.round(uv[0] * tex2dw); // 计算图片在图集中的位置
            let atlasPosY = Math.round(uv[1] * tex2dh);
            var ret: Uint8Array = new Uint8Array(width * height * 4);
            wstride = tex2dw * 4;
            dst = (atlasPosY + rePosY) * wstride;
            st = atlasPosX * 4 + rePosX * 4 + dst;
            for (i = 0; i < drawh; i++) {
                ret.set(pix.slice(st, st + draww * 4), width * 4 * (i + marginT) + marginL * 4);
                st += wstride;
            }
            return ret;
        }

        // 如果无法直接获取，只能先渲染出来
        var ctx = new ILaya.Context();
        ctx.size(width, height);
        let rt = new RenderTexture2D(width,height,RenderTargetFormat.R8G8B8A8);
        ctx.render2D = ctx.render2D.clone(rt)
        var uv: number[] = null;
        if (x != 0 || y != 0 || width != tex2dw || height != tex2dh) {
            uv = (this._uv as number[]).slice();	// 复制一份uv
            var stu = uv[0];
            var stv = uv[1];
            var uvw = uv[2] - stu;
            var uvh = uv[7] - stv;
            var uk = uvw / texw;
            var vk = uvh / texh;
            uv = [stu + rePosX * uk, stv + rePosY * vk,
            stu + (rePosX + draww) * uk, stv + rePosY * vk,
            stu + (rePosX + draww) * uk, stv + (rePosY + drawh) * vk,
            stu + rePosX * uk, stv + (rePosY + drawh) * vk];
        }
        ctx.startRender();
        ctx._drawTextureM(this, marginL, marginT, draww, drawh, null, 1.0, uv, 0xffffffff);
        ctx.endRender();
        var dt: Uint8Array = rt.getData(0, 0, width, height) as Uint8Array;
        ctx.destroy();
        rt.destroy();
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
     * @en Retrieves the pixel data from a specific area of the `Texture`.
     * @param x The x-coordinate of the area.
     * @param y The y-coordinate of the area.
     * @param width The width of the area.
     * @param height The height of the area.
     * @returns A `Uint8Array` containing the pixel data.
     * @zh 从 `Texture` 的特定区域获取像素点集合。
     * @param x 区域的 x 坐标。
     * @param y 区域的 y 坐标。
     * @param width 区域的宽度。
     * @param height 区域的高度。
     * @return 一个 `Uint8Array` 对象，包含了像素点集合。
     */
    getPixels(x: number, y: number, width: number, height: number): Uint8Array {
        return this.getTexturePixels(x, y, width, height);
        // canvas 不支持
    }

    /**
     * @en Forces the recovery of the `bitmap` from the URL.
     * @param callback An optional callback function to call after the bitmap is recovered.
     * @zh 通过 URL 强制恢复 `bitmap`。
     * @param callback 位图恢复后调用的可选回调函数。
     */
    recoverBitmap(callback?: () => void): void {
        var url = this._bitmap.url;
        if (!this._destroyed && (!this._bitmap || this._bitmap.destroyed) && url) {
            ILaya.loader.load(url).then((tex: Texture) => {
                this.bitmap = tex.bitmap;
                callback && callback();
            });
        }
    }

    /**
     * @en Forces the disposal of the `bitmap`, regardless of references.
     * @zh 强制释放 `bitmap`，无论它是否被引用。
     */
    disposeBitmap(): void {
        if (!this._destroyed && this._bitmap) {
            this._bitmap.destroy();
        }
    }

    /**
     * @en Whether the texture is valid.
     * @zh 纹理是否有效。
     */
    get valid(): boolean {
        return !this._destroyed && this._bitmap && !this._bitmap.destroyed;
    }

    /**
     * @en Whether the texture is considered obsolete.
     * @zh 纹理是否被认为是过时的。
     */
    public get obsolute(): boolean {
        return this._obsolute || !this._bitmap || this._bitmap.destroyed || this._bitmap.obsolute;
    }

    public set obsolute(value: boolean) {
        this._obsolute = value;
    }

    /**
     * 销毁资源
     * @internal
     */
    protected _disposeResource(): void {
        let bit = this._bitmap;
        this._bitmap = null;
        if (bit)
            bit._removeReference(this._referenceCount);
    }

    /**
     * @en Retrieves a clipped sub-texture from this texture and caches it for future access.
     * @param x The x-coordinate of the clip area.
     * @param y The y-coordinate of the clip area.
     * @param width The width of the clip area.
     * @param height The height of the clip area.
     * @returns A `Texture` object representing the clipped sub-texture, or null if the clip area is out of bounds.
     * @zh 从当前纹理获取裁剪后的子纹理，并将其缓存以供将来访问。
     * @param x 裁剪区域的 x 坐标。
     * @param y 裁剪区域的 y 坐标。
     * @param width 裁剪区域的宽度。
     * @param height 裁剪区域的高度。
     * @return 一个 `Texture` 对象，表示裁剪后的子纹理，如果裁剪区域越界，则返回 null。
     */
    public getCachedClip(x: number, y: number, width: number, height: number): Texture {
        let key = `${x}_${y}_${width}_${height}`;
        if (!this._clipCache)
            this._clipCache = new Map();

        let tex = this._clipCache.get(key);
        if (tex)
            return tex;
        tex = Texture.createFromTexture(this, x, y, width, height);
        if (tex)
            tex._sizeGrid = this._sizeGrid;

        if (this._clipCache.size > 100)
            this._clipCache.clear();

        this._clipCache.set(key, tex);

        return tex;
    }
}

/**
 * @en Translates UV coordinates by a specified offset.
 * @param offsetX The offset distance along the X-axis.
 * @param offsetY The offset distance along the Y-axis.
 * @param uv The UV coordinates to be translated. Expected to be an array of at least 8 numbers.
 * @returns The translated UV coordinates.
 * @zh 按指定的偏移量平移 UV 坐标。
 * @param offsetX X 轴上的偏移量。
 * @param offsetY Y 轴上的偏移量。
 * @param uv 待平移的 UV 坐标。期望是一个包含 8 个元素的数组。
 * @returns 平移后的 UV 坐标。
 */
function moveUV(offsetX: number, offsetY: number, uv: any[]): any[] {
    for (var i: number = 0; i < 8; i += 2) {
        uv[i] += offsetX;
        uv[i + 1] += offsetY;
    }
    return uv;
}
