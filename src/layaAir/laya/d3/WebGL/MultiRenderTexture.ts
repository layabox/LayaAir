import { LayaGL } from "../../layagl/LayaGL";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { BaseTexture } from "./BaseTexture";
import { InternalRenderTarget } from "./InternalRenderTarget";
import { TextureDimension } from "./InternalTexture";
import { RenderTarget, RenderTargetFormat } from "./RenderTarget";
import { RenderTexture } from "./RenderTexture";

export class MultiRenderTexture extends BaseTexture implements RenderTarget {

    _isCameraTarget: boolean;

    textureCount: number;

    textures: BaseTexture[];

    depthTexture: BaseTexture;

    _renderTarget: InternalRenderTarget;

    depthStencilFormat: RenderTargetFormat;

    // todo multi color attachment count  depth color 在一起？
    constructor(width: number, height: number, count: number, colorFormats: RenderTargetFormat[], depthFormat: RenderTargetFormat, generateMipmap: boolean, multiSamples: number) {

        super(width, height, colorFormats[0]);
        this.textureCount = count;
        this.textures = new Array<BaseTexture>(count - 1);

        this._dimension = TextureDimension.Tex2D;
        this._gammaSpace = true;

        this.depthStencilFormat = depthFormat;

        this._renderTarget = LayaGL.layaContext.createMultiRenderTargetInternal(this._dimension, this.width, this.height, count, colorFormats, depthFormat, generateMipmap, true, multiSamples);

        this.depthTexture = new BaseTexture(width, height, depthFormat);
        // @ts-ignore
        this.depthTexture._dimension = TextureDimension.Tex2D;
        this.depthTexture._texture = this._renderTarget._depthTexture;

        this._texture = this._renderTarget._textures[0];

    }
    _start(): void {
        LayaGL.layaContext.bindRenderTarget(this._renderTarget);
        (this._isCameraTarget) && (RenderContext3D._instance.invertY = true);
    }
    _end(): void {
        LayaGL.layaContext.unbindRenderTarget(this._renderTarget);
        (this._isCameraTarget) && (RenderContext3D._instance.invertY = false);
    }

}