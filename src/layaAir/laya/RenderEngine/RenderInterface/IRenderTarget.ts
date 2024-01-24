import { InternalRenderTarget } from "../../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { BaseTexture } from "../../resource/BaseTexture";

export interface IRenderTarget {
    _renderTarget: InternalRenderTarget;
    _isCameraTarget: boolean;
    isCube: boolean;
    samples: number;
    generateMipmap: boolean;
    depthStencilTexture: BaseTexture | null;
    // /**
    //  * @internal
    //  */
    // _start(): void;
    // /**
    //  * @internal
    //  */
    // _end(): void;
}
