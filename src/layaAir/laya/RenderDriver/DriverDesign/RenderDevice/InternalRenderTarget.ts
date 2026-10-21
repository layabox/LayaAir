import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalTexture } from "./InternalTexture";

export interface InternalRenderTarget {

    _isCube: boolean;
    _samples: number;

    _generateMipmap: boolean;

    /** 颜色槽位与 Shader location 一一对应；MRT 的空槽为 null，不拥有纹理。 */
    _textures: (InternalTexture | null)[];
    _texturesResolve?: InternalTexture[]; //为了支持MSAA，需要这个纹理接口

    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    /** 固定 location 的 MRT 布局，附件 0 必须存在，中间空槽为 null；普通 RT 可省略。 */
    readonly colorFormats?: readonly (RenderTargetFormat | null)[];
    /** MRT 组内缓存的颜色 0 与共享深度绑定，不单独拥有附件存储。 */
    readonly _color0Target?: InternalRenderTarget;
    depthStencilFormat: RenderTargetFormat;

    isSRGB:boolean;

    gpuMemory:number;

    dispose(): void;
}
