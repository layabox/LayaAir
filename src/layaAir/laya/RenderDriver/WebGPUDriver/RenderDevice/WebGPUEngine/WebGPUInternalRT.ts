
import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "../../../../maths/Color";
import { InternalRenderTarget } from "../../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebGPUEngine } from "./WebGPUEngine";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPUObject } from "./WebGPUObject";

interface WGPRenderPassDesCache{
    clearFlag:number;
    clearColor:Color;
    clearDepth:number;
}

export interface GPURTSourceGroup {
    texture: WebGPUInternalTex;
    view: GPUTextureView;
}

export class WebGPUInternalRT extends WebGPUObject implements InternalRenderTarget {
    _isCube: boolean;
    _samples: number;
    _generateMipmap: boolean;
    _textures: WebGPUInternalTex[];
    _depthTexture: WebGPUInternalTex;
    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;
    gpuMemory: number;
    isSRGB: boolean;
    loadClear:boolean;
    clearDes:WGPRenderPassDesCache;
    isOffscreenRT:boolean = false;
    constructor(engine: WebGPUEngine, colorFormat: RenderTargetFormat,
        depthStencilFormat: RenderTargetFormat,
        isCube: boolean, generateMipmap: boolean,
        samples: number,
    ) {
        super(engine);
        this.colorFormat = colorFormat;
        this.depthStencilFormat = depthStencilFormat
        this._isCube = isCube;
        this._generateMipmap = generateMipmap;
        this._samples = samples;//TODO
        this._textures = [];
    }
    

    dispose(): void {
        super.destroy();
        this._textures.length && this._textures.forEach(element => {
            element.destroy();
        });
        this._depthTexture && this._depthTexture.destroy();

    }

}