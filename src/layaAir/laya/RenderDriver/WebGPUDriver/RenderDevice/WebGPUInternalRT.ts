import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUInternalRT implements InternalRenderTarget {
    _isCube: boolean;
    _samples: number; //>1表示启用多重采样
    _generateMipmap: boolean;
    _textures: WebGPUInternalTex[];
    _texturesResolve: WebGPUInternalTex[]; //当启用多重采样时，用于解析的纹理
    _depthTexture: WebGPUInternalTex;
    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;
    isSRGB: boolean = false;
    gpuMemory: number = 0;

    formatId: number = 0;

    _colorStates: GPUColorTargetState[];
    _depthState: GPUColorTargetState;

    _renderPassDescriptor: GPURenderPassDescriptor;
    _renderBundleDescriptor: GPURenderBundleEncoderDescriptor;

    globalId: number;
    objectName: string = 'WebGPUInternalRT';

    constructor(colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat,
        isCube: boolean, generateMipmap: boolean, samples: number) {
        this._isCube = isCube;
        this._samples = samples;
        this._generateMipmap = generateMipmap;
        this.colorFormat = colorFormat;
        this.depthStencilFormat = depthStencilFormat;
        this._textures = [];
        if (samples > 1)
            this._texturesResolve = [];
        this._colorStates = [];
        this._renderPassDescriptor = { colorAttachments: [] };
        this._renderBundleDescriptor = { colorFormats: [] };
        this.formatId = (this.depthStencilFormat << 10) + this.colorFormat;

        this.globalId = WebGPUGlobal.getId(this);
        //WebGPUGlobal.addTextureStatis(this);
    }

    dispose(): void {
        WebGPUGlobal.releaseId(this);

        if (this._textures) {
            for (let i = this._textures.length - 1; i > -1; i--)
                this._textures[i].dispose();
            this._textures.length = 0;
        }
        if (this._texturesResolve) {
            for (let i = this._texturesResolve.length - 1; i > -1; i--)
                this._texturesResolve[i].dispose();
            this._texturesResolve.length = 0;
        }
        if (this._depthTexture) {
            this._depthTexture.dispose();
            this._depthTexture = null;
        }
    }
}