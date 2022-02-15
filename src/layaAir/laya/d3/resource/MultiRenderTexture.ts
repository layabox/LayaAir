import { LayaGL } from "../../layagl/LayaGL";
import { BaseTexture } from "../../resource/BaseTexture";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { InternalRenderTarget } from "../WebGL/InternalRenderTarget";
import { TextureDimension } from "../WebGL/InternalTexture";
import { RenderTarget, RenderTargetFormat } from "../../resource/RenderTarget";
import { RenderTexture } from "./RenderTexture";

export class MultiRenderTexture extends RenderTexture {

    _isCameraTarget: boolean;

    colorCount: number;

    textures: BaseTexture[];
    colorFormats: RenderTargetFormat[];

    depthTexture: BaseTexture;

    _renderTarget: InternalRenderTarget;

    // todo multi color attachment count  depth color 在一起？
    constructor(width: number, height: number, count: number, colorFormats: RenderTargetFormat[], depthFormat: RenderTargetFormat, generateMipmap: boolean, multiSamples: number) {

        super(width, height, colorFormats[0], depthFormat, generateMipmap, multiSamples);
        // todo
        this.textures = [];
        // todo
        this.colorFormats = colorFormats;
        this.colorCount = count;

        this._dimension = TextureDimension.Tex2D;
        this._gammaSpace = true;
    }

    _createRenderTarget() {
        this._renderTarget = LayaGL.layaContext.createMultiRenderTargetInternal(this._dimension, this.width, this.height, this.colorCount, this.colorFormats, this.depthStencilFormat, this._generateMipmap, true, this.multiSamples);

        this.depthTexture = new BaseTexture(this.width, this.height, this.depthStencilFormat);
        // todo dimension 放在 basetexture 构造函数里？
        // @ts-ignore
        this.depthTexture._dimension = TextureDimension.Tex2D;
        // todo 默认全 texture? 
        this.depthTexture._texture = this._renderTarget._depthTexture;

        this._texture = this._renderTarget._textures[0];
    }

    _start(): void {
        RenderTexture._currentActive = this;

        LayaGL.layaContext.bindRenderTarget(this._renderTarget);
        (this._isCameraTarget) && (RenderContext3D._instance.invertY = true);
    }
    _end(): void {
        RenderTexture._currentActive = null;

        LayaGL.layaContext.unbindRenderTarget(this._renderTarget);
        (this._isCameraTarget) && (RenderContext3D._instance.invertY = false);
    }

}