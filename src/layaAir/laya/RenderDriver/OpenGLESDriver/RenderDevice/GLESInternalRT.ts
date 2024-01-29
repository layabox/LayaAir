import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";


export class GLESInternalRT implements InternalRenderTarget {
    _isCube: boolean;
    _samples: number;
    _generateMipmap: boolean;
    _textures: InternalTexture[];
    _depthTexture: InternalTexture;
    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;
    isSRGB: boolean;
    gpuMemory: number;
    _nativeObj: any;
    constructor() {

    }
    dispose(): void {
        throw new Error("Method not implemented.");
    }

}