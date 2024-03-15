import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUInternalRT implements InternalRenderTarget {
    _isCube: boolean;
    _samples: number;
    _generateMipmap: boolean;
    _textures: WebGPUInternalTex[];
    _depthTexture: WebGPUInternalTex;
    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;
    isSRGB: boolean = false;
    gpuMemory: number = 0;

    formatId: number = 0;

    _colorState: GPUColorTargetState[];
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
        this._colorState = [];
        this._renderPassDescriptor = { colorAttachments: [] };
        this.formatId = (this.depthStencilFormat << 10) + this.colorFormat;

        this.globalId = WebGPUGlobal.getId(this);
    }

    dispose(): void {
        //TODO
        WebGPUGlobal.releaseId(this);
    }
}