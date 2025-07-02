import { BaseTexture } from "../../../resource/BaseTexture";
import { InternalRenderTarget } from "./InternalRenderTarget";

/** @blueprintIgnore */
export interface IRenderTarget {
    width: number;
    height: number;
    _renderTarget: InternalRenderTarget;
    _isCameraTarget: boolean;
    isCube: boolean;
    samples: number;
    generateMipmap: boolean;
    depthStencilTexture: BaseTexture | null;
}
