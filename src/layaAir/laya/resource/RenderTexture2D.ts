import { Texture2D } from "./Texture2D"
import { BaseTexture } from "./BaseTexture"
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "../maths/Color";
import { LayaGL } from "../layagl/LayaGL";
import { InternalRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
/**
 * @en RenderTexture2D class used to create 2D render targets.
 * @zh RenderTexture2D 类用于创建2D渲染目标。
 */
export class RenderTexture2D extends BaseTexture implements IRenderTarget {
    private static _currentActive: RenderTexture2D;
    static _clearColor: Color = new Color(0, 0, 0, 0);
    static _clear: boolean = false;
    static _clearLinearColor: Color = new Color();

    //为push,pop 用的。以后和上面只保留一份。
    //由于可能递归，所以不能简单的用save，restore
    /**
     * @en Default UV coordinates.
     * @zh 默认的UV坐标。
     */
    static defuv: any[] = [0, 0, 1, 0, 1, 1, 0, 1];
    /**
     * @en Default flipped UV coordinates.
     * @zh 默认翻转的UV坐标。
     */
    static flipyuv: any[] = [0, 1, 1, 1, 1, 0, 0, 0];
    /**
     * @en The currently active RenderTexture.
     * @zh 当前激活的渲染纹理。
     */
    static get currentActive(): RenderTexture2D {
        return RenderTexture2D._currentActive;
    }

    private _depthStencilFormat: number;
    private _colorFormat: RenderTargetFormat;

    /**@internal */
    _mgrKey: number = 0;	//给WebGLRTMgr用的
    /**@internal */
    _invertY: boolean = false;
    /**
     * @en Depth format.
     * @zh 深度格式。
     */
    get depthStencilFormat(): number {
        return this._depthStencilFormat;
    }

    /**
     * @en The default texture.
     * @zh 默认纹理。
     */
    get defaultTexture(): BaseTexture {
        return Texture2D.grayTexture;
    }

    /**
     * @en Checks whether the RenderTexture2D is ready.
     * @zh 检查2D渲染纹理是否准备好。
     */
    getIsReady(): boolean {
        return true;
    }

    /**
     * @en get the colorFormat from RenderInternalRT
     * @zh 得到此渲染纹理的颜色格式
     */
    getColorFormat(): RenderTargetFormat {
        return this._colorFormat;
    }
    
    /**
     * @en The source width of the RenderTexture2D.
     * @zh 2D渲染纹理的源宽度。
     */
    get sourceWidth(): number {
        return this._width;
    }

    /**
     * @en The source height of the RenderTexture2D.
     * @zh 2D渲染纹理的源高度。
     */
    get sourceHeight(): number {
        return this._height;
    }

    /**
     * @en The X-axis offset of the RenderTexture2D.
     * @zh 2D渲染纹理的X轴偏移。
     */
    get offsetX(): number {
        return 0;
    }

    /**
     * @en The Y-axis offset of the RenderTexture2D.
     * @zh 2D渲染纹理的Y轴偏移。
     */
    get offsetY(): number {
        return 0;
    }

    /**
     * @en Depth stencil texture
     * @zh 深度模板纹理
     */
    depthStencilTexture: BaseTexture;

    /**
     * @ignore
     * @en The RenderTarget.
     * @zh 渲染目标。
     */
    _renderTarget: InternalRenderTarget;
    /**
     * @en Whether the RenderTexture2D is a CameraTarget.
     * @zh 是否是CameraTarget
     */
    _isCameraTarget: boolean;


    /**
     * @en Creates an instance of RenderTexture2D.
     * @param width The width.
     * @param height The height.
     * @param format The texture format.
     * @param depthStencilFormat The depth format.
     * @zh 创建 RenderTexture2D 类的实例。
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     */
    constructor(width: number, height: number, format: RenderTargetFormat = RenderTargetFormat.R8G8B8, depthStencilFormat: RenderTargetFormat = RenderTargetFormat.None) {//TODO:待老郭清理

        super(width, height, format);
        this._colorFormat = format;
        this._depthStencilFormat = depthStencilFormat;
        if (width != 0 && height != 0) {
            this._create();
        }
        this.lock = true;
    }

    /**
     * @en Whether the render target is a cube render target.
     * @zh 渲染目标是否是立方体贴图渲染目标。
     */
    get isCube(): boolean {
        return this._renderTarget._isCube;
    }

    /**
     * @en The number of samples for the render target.
     * @zh 渲染目标的采样数。
     */
    get samples(): number {
        return this._renderTarget._samples;
    }

    /**
     * @en Checks if mipmaps are generated for the render target.
     * @zh 检查是否为渲染目标生成了mipmaps。
     */
    get generateMipmap(): boolean {
        return this._renderTarget._generateMipmap;
    }

    /**
     * @internal
     */
    _start(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * @internal
     */
    _end(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * @internal
     */
    _create() {
        // todo  mipmap
        this._renderTarget = LayaGL.textureContext.createRenderTargetInternal(this.width, this.height, this._colorFormat, this.depthStencilFormat, false, false, 1);
        this._texture = this._renderTarget._textures[0];
        this._texture.gammaCorrection = 2.2;
    }

    /**
     * @en Clears the render texture.
     * @param r The red component.
     * @param g The green component.
     * @param b The blue component.
     * @param a The alpha component, default is 1.0 for full opacity.
     * @zh 清理渲染纹理。
     * @param r 红色分量。
     * @param g 绿色分量。
     * @param b 蓝色分量。
     * @param a 透明度分量，默认为1.0表示完全不透明。
     */
    clear(r: number = 0.0, g: number = 0.0, b: number = 0.0, a: number = 1.0): void {
        RenderTexture2D._clearColor.r = r;
        RenderTexture2D._clearColor.g = g;
        RenderTexture2D._clearColor.b = b;
        RenderTexture2D._clearColor.a = a;
        RenderTexture2D._clear = true;
    }

    /**
     * @en Gets the pixel data from the render texture within the specified area.
     * @param x The X coordinate of the pixel area.
     * @param y The Y coordinate of the pixel area.
     * @param width The width of the pixel area.
     * @param height The height of the pixel area.
     * @returns The pixel data from the specified area.
     * @zh 从指定区域获取渲染纹理的像素数据。
     * @param x 像素区域的X坐标。
     * @param y 像素区域的Y坐标。
     * @param width 像素区域的宽度。
     * @param height 像素区域的高度。
     * @returns 指定区域的像素数据。
     */
    getData(x: number, y: number, width: number, height: number): ArrayBufferView {
        return LayaGL.textureContext.getRenderTextureData(this._renderTarget, x, y, width, height);
    }

    /**
     * @en Asynchronously retrieves pixel data from the RenderTexture.
     * @param xOffset The x-offset value.
     * @param yOffset The y-offset value.
     * @param width The width of the area to retrieve.
     * @param height The height of the area to retrieve.
     * @param out The array to hold the output data.
     * @returns binary data
     * @zh 异步获取渲染纹理的像素数据。
     * @param xOffset x偏移值
     * @param yOffset y偏移值
     * @param width 要检索的区域的宽度。
     * @param height 要检索的区域的高度。
     * @param out 用于保存输出数据的数组。
     * @returns 二进制数据
     */
    getDataAsync(xOffset: number, yOffset: number, width: number, height: number, out: Uint8Array | Float32Array) { //兼容WGSL
        return LayaGL.textureContext.readRenderTargetPixelDataAsync(this._renderTarget, xOffset, yOffset, width, height, out);
    }

    /**
     * @internal
     * @en Recycles the RenderTexture2D.
     * @zh 回收渲染纹理。
     */
    recycle(): void {
    }

    /**
     * @internal
     */
    _disposeResource(): void {
        //width 和height为0的时候不会创建资源
        this._renderTarget && this._renderTarget.dispose();
    }

}