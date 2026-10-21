import { BaseTexture } from "../../../resource/BaseTexture";
import { InternalRenderTarget } from "./InternalRenderTarget";

/** @blueprintIgnore */
export interface IRenderTarget {
    width: number;
    height: number;
    _renderTarget: InternalRenderTarget;
    _isCameraTarget: boolean;
    isCube: boolean;
    /**
     * @en Whether this is an MRT resource, even with a single color attachment. Omitted means false.
     * @zh 是否为 MRT 资源，即使只有一个颜色附件也为 true；未提供时视为 false。
     */
    readonly isMRT?: boolean;
    /**
     * 包含附件 0 和中间空槽的颜色槽位跨度，用于逐槽清除参数。
     * 目前仅 MRT 提供；未提供不代表没有颜色附件。
     */
    readonly colorAttachmentCount?: number;
    samples: number;
    generateMipmap: boolean;
    depthStencilTexture: BaseTexture | null;
}
