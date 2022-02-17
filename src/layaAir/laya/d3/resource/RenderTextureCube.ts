import { LayaGL } from "../../layagl/LayaGL";
import { RenderTargetFormat } from "../../resource/RenderTarget";
import { TextureDimension } from "../WebGL/InternalTexture";
import { RenderTexture } from "./RenderTexture";

export class RenderTextureCube extends RenderTexture {

    constructor(size: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, generateMipmap: boolean, multiSamples: number) {
        super(size, size, colorFormat, depthFormat, generateMipmap, multiSamples);
    }

    _createRenderTarget(): void {
        this._dimension = TextureDimension.Cube;
        this._renderTarget = LayaGL.layaContext.createRenderTargetCubeInternal(this.dimension, this.width, this._colorFormat, this._depthStencilFormat, this._generateMipmap, this._gammaSpace, this._multiSamples);

        this._texture = this._renderTarget._textures[0];
    }

}