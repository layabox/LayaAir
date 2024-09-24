import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { LayaGL } from "../layagl/LayaGL";
import { RenderTexture } from "./RenderTexture";


/**
 * @en The `RenderTextureCube` class is used for creating cube map render textures.
 * @zh `RenderTextureCube` 类用于创建立方体贴图渲染纹理。
 */
export class RenderTextureCube extends RenderTexture {

    /**
     * @en The index of the cube face, which can be +x, -x, +y, -y, +z, or -z.
     * @zh 立方体贴图的面索引，可以是 +x, -x, +y, -y, +z 或 -z。
     */
    faceIndex: number;

    /**
     * @en Create a new instance of `RenderTextureCube`.
     * @param size The size of the texture.
     * @param colorFormat The color format of the render target.
     * @param depthFormat The depth format of the render target.
     * @param generateMipmap Whether to generate mipmaps for the render texture.
     * @param multiSamples The number of samples for multi-sampling.
     * @zh 创建一个 `RenderTextureCube` 实例。
     * @param size 纹理的尺寸。
     * @param colorFormat 渲染目标的颜色格式。
     * @param depthFormat 渲染目标的深度格式。
     * @param generateMipmap 是否为渲染纹理生成 mipmaps。
     * @param multiSamples 多采样的样本数量。
     */
    constructor(size: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, generateMipmap: boolean, multiSamples: number) {
        super(size, size, colorFormat, depthFormat, generateMipmap, multiSamples);
        this.faceIndex = 0;
    }

    /**
     * @internal
     */
    _createRenderTarget(): void {
        this._dimension = TextureDimension.Cube;
        this._renderTarget = LayaGL.textureContext.createRenderTargetCubeInternal(this.width, <RenderTargetFormat><any>this._format, this._depthStencilFormat, this._generateMipmap, this._gammaSpace, this._multiSamples);

        this._texture = this._renderTarget._textures[0];
    }

    // _start() {
    //     RenderTexture._configInstance.invertY = this._isCameraTarget;
    //     if (RenderTexture._currentActive != this) {
    //         RenderTexture._currentActive && RenderTexture._currentActive._end();
    //         RenderTexture._currentActive = this;
    //         LayaGL.textureContext.bindRenderTarget(this._renderTarget, this.faceIndex);
    //     }
    // }

}