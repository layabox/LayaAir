import { LayaGL } from "../../layagl/LayaGL";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { BaseTexture } from "./BaseTexture";
import { InternalRenderTarget } from "./InternalRenderTarget";
import { TextureDimension } from "./InternalTexture";
import { RenderTarget, RenderTargetFormat } from "./RenderTarget";


export class RenderTexture extends BaseTexture implements RenderTarget {

    // todo 记录当前 绑定 rt  位置不放在这里
    protected static _currentActive: RenderTexture = null;

    static get currentActive(): RenderTexture {
        return RenderTexture._currentActive;
    }

    _isCameraTarget: boolean = false;

    _renderTarget: InternalRenderTarget;

    _generateMipmap: boolean;

    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;

    multiSamples: number;

    // todo format
    constructor(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, generateMipmap: boolean, multiSamples: number) {
        super(width, height, colorFormat);

        this._dimension = TextureDimension.Tex2D;
        this._gammaSpace = true;

        this.colorFormat = colorFormat;
        this.depthStencilFormat = depthFormat;
        this._generateMipmap = generateMipmap;
        this.multiSamples = multiSamples;

        // todo format 
        this._renderTarget = LayaGL.layaContext.createRenderTargetInternal(this._dimension, this.width, this.height, this.colorFormat, this._generateMipmap, true, this.depthStencilFormat, this.multiSamples);

        this._texture = this._renderTarget._textures[0];
    }


    _start() {
        RenderTexture._currentActive = this;

        LayaGL.layaContext.bindRenderTarget(this._renderTarget);
        (this._isCameraTarget) && (RenderContext3D._instance.invertY = true);
    }

    _end() {
        RenderTexture._currentActive = null;

        LayaGL.layaContext.unbindRenderTarget(this._renderTarget);
        (this._isCameraTarget) && (RenderContext3D._instance.invertY = false);
    }

}