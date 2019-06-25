import { Texture2D } from "././Texture2D";
import { EventDispatcher } from "../events/EventDispatcher";
import { Handler } from "../utils/Handler";
/**
 * 资源加载完成后调度。
 * @eventType Event.READY
 */
/**
 * <code>Texture</code> 是一个纹理处理类。
 */
export declare class Texture extends EventDispatcher {
    /**@private 默认 UV 信息。*/
    static DEF_UV: Float32Array;
    /**@private */
    static NO_UV: Float32Array;
    /**@private 反转 UV 信息。*/
    static INV_UV: Float32Array;
    /**@private */
    private static _rect1;
    /**@private */
    private static _rect2;
    /**@private uv的范围*/
    uvrect: any[];
    /**@private */
    private _destroyed;
    /**@private */
    private _bitmap;
    /**@private */
    _uv: ArrayLike<number>;
    /**@private */
    private _referenceCount;
    /** @private [NATIVE]*/
    _nativeObj: any;
    /**@private 唯一ID*/
    $_GID: number;
    /**沿 X 轴偏移量。*/
    offsetX: number;
    /**沿 Y 轴偏移量。*/
    offsetY: number;
    /** @private */
    private _w;
    /** @private */
    private _h;
    /**原始宽度（包括被裁剪的透明区域）。*/
    sourceWidth: number;
    /**原始高度（包括被裁剪的透明区域）。*/
    sourceHeight: number;
    /**图片地址*/
    url: string;
    /** @private */
    scaleRate: number;
    /**
     * 平移 UV。
     * @param offsetX 沿 X 轴偏移量。
     * @param offsetY 沿 Y 轴偏移量。
     * @param uv 需要平移操作的的 UV。
     * @return 平移后的UV。
     */
    static moveUV(offsetX: number, offsetY: number, uv: any[]): any[];
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
    static create(source: Texture2D | Texture, x: number, y: number, width: number, height: number, offsetX?: number, offsetY?: number, sourceWidth?: number, sourceHeight?: number): Texture;
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
    static _create(source: Texture2D | Texture, x: number, y: number, width: number, height: number, offsetX?: number, offsetY?: number, sourceWidth?: number, sourceHeight?: number, outTexture?: Texture): Texture;
    /**
     * 截取Texture的一部分区域，生成新的Texture，如果两个区域没有相交，则返回null。
     * @param	texture	目标Texture。
     * @param	x		相对于目标Texture的x位置。
     * @param	y		相对于目标Texture的y位置。
     * @param	width	截取的宽度。
     * @param	height	截取的高度。
     * @return 返回一个新的Texture。
     */
    static createFromTexture(texture: Texture, x: number, y: number, width: number, height: number): Texture;
    uv: ArrayLike<number>;
    /** 实际宽度。*/
    width: number;
    /** 实际高度。*/
    height: number;
    /**
     * 获取位图。
     * @return 位图。
     */
    /**
    * 设置位图。
    * @param 位图。
    */
    bitmap: Texture2D | Texture;
    /**
     * 获取是否已经销毁。
     * @return 是否已经销毁。
     */
    readonly destroyed: boolean;
    /**
     * 创建一个 <code>Texture</code> 实例。
     * @param	bitmap 位图资源。
     * @param	uv UV 数据信息。
     */
    constructor(bitmap?: Texture2D | Texture, uv?: ArrayLike<number>, sourceWidth?: number, sourceHeight?: number);
    /**
     * @private
     */
    _addReference(): void;
    /**
     * @private
     */
    _removeReference(): void;
    /**
     * @private
     */
    _getSource(cb?: Function): any;
    /**
     * @private
     */
    private _onLoaded;
    /**
     * 获取是否可以使用。
     */
    getIsReady(): boolean;
    /**
     * 设置此对象的位图资源、UV数据信息。
     * @param	bitmap 位图资源
     * @param	uv UV数据信息
     */
    setTo(bitmap?: Texture2D | Texture, uv?: ArrayLike<number>, sourceWidth?: number, sourceHeight?: number): void;
    /**
     * 加载指定地址的图片。
     * @param	url 图片地址。
     * @param	complete 加载完成回调
     */
    load(url: string, complete?: Handler): void;
    getTexturePixels(x: number, y: number, width: number, height: number): Uint8Array;
    /**
     * 获取Texture上的某个区域的像素点
     * @param	x
     * @param	y
     * @param	width
     * @param	height
     * @return  返回像素点集合
     */
    getPixels(x: number, y: number, width: number, height: number): Uint8Array;
    /**
     * 通过url强制恢复bitmap。
     */
    recoverBitmap(onok?: Function): void;
    /**
     * 强制释放Bitmap,无论是否被引用。
     */
    disposeBitmap(): void;
    /**
     * 销毁纹理。
     */
    destroy(force?: boolean): void;
}
