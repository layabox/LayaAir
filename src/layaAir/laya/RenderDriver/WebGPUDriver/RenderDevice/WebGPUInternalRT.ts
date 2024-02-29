import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { WebGPUInternalTex } from "./WebGPUInternalTex";

export class WebGPUInternalRT implements InternalRenderTarget {
    _isCube: boolean;
    _samples: number;
    _generateMipmap: boolean;
    _textures: WebGPUInternalTex[];
    _depthTexture: WebGPUInternalTex;
    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;
    isSRGB: boolean;
    gpuMemory: number;

    constructor(colorFormat: RenderTargetFormat,
        depthStencilFormat: RenderTargetFormat,
        isCube: boolean, generateMipmap: boolean,
        samples: number) {
            this._isCube = isCube;
            this._generateMipmap = generateMipmap;
            this.colorFormat = colorFormat;
            this.depthStencilFormat = depthStencilFormat;
            this._samples = samples;
            this._textures = [];

    }
    
    dispose(): void {
        //TODO
    }

}