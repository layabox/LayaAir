import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { LayaGL } from "../layagl/LayaGL";
import { RenderTexture } from "./RenderTexture";

/**
 * @en RenderTexture backed by a Texture2DArray. Render to a layer via `bindLayer(layer)`; sample as array.
 * @zh 基于 Texture2DArray 的渲染纹理。通过 `bindLayer(layer)` 渲染到指定层；作为数组纹理采样。
 */
export class RenderTexture2DArray extends RenderTexture {

    /**
     * @en Layer count.
     * @zh 数组层数。
     */
    depth: number;

    /**
     * @en Current render target layer.
     * @zh 当前渲染目标层。
     */
    layerIndex: number = 0;

    /**
     * @en Create a `RenderTexture2DArray`.
     * @param width Width of each layer.
     * @param height Height of each layer.
     * @param depth Layer count.
     * @param colorFormat Color format.
     * @param depthFormat Depth format.
     * @param generateMipmap Whether to generate mipmaps.
     * @param multiSamples MSAA samples (only 1 supported currently).
     * @param sRGB Whether sRGB color space.
     * @zh 创建 `RenderTexture2DArray`。
     * @param width 每层宽度。 @param height 每层高度。 @param depth 层数。
     * @param colorFormat 颜色格式。 @param depthFormat 深度格式。
     * @param generateMipmap 是否生成多级纹理。 @param multiSamples MSAA 采样数(当前仅 1)。 @param sRGB 是否 sRGB。
     */
    constructor(width: number, height: number, depth: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, generateMipmap: boolean = false, multiSamples: number = 1, sRGB: boolean = false) {
        super(width, height, colorFormat, depthFormat, generateMipmap, multiSamples, false, sRGB);
        // 基类构造已调用过一次 _createRenderTarget()，但那时 this.depth 未就绪(被守卫跳过)。
        this.depth = depth;
        this._createRenderTarget();
    }

    /**
     * @internal
     */
    _createRenderTarget(): void {
        // 基类构造触发的首次调用：depth 未就绪，空跑(不分配)。
        if (this.depth == null)
            return;
        this._dimension = TextureDimension.Texture2DArray;
        this._renderTarget = LayaGL.textureContext.createRenderTargetArrayInternal(
            this.width, this.height, this.depth, <RenderTargetFormat><any>this._format,
            this._depthStencilFormat, this._generateMipmap, this._gammaSpace, this._multiSamples);
        this._generateMipmap = this._renderTarget._generateMipmap;
        this._texture = this._renderTarget._textures[0];
    }

    /**
     * @en Switch render target to the given layer. Call before rendering that layer.
     * @param layer Layer index.
     * @zh 将渲染目标切到指定层。渲染该层前调用。
     * @param layer 目标层号。
     */
    bindLayer(layer: number): void {
        this.layerIndex = layer;
        LayaGL.textureContext.bindRenderTarget(this._renderTarget, layer);
    }
}
