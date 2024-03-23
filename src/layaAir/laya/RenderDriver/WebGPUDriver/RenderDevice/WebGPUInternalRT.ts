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
        this.formatId = (this.depthStencilFormat << 10) + this.colorFormat;

        this.globalId = WebGPUGlobal.getId(this);
        //WebGPUGlobal.addTextureStatis(this);
    }

    dispose(): void {
        WebGPUGlobal.releaseId(this);
    }
}