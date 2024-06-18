import { BaseTexture } from "../../../resource/BaseTexture";
import { InternalRenderTarget } from "./InternalRenderTarget";


export interface IRenderTarget {
    _renderTarget: InternalRenderTarget;
    _isCameraTarget: boolean;
    isCube: boolean;
    samples: number;
    generateMipmap: boolean;
    depthStencilTexture: BaseTexture | null;
}
