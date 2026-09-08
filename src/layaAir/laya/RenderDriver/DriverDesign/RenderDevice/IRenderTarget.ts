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
     * @en Color attachment count, including slot 0. Currently provided by MRT only; omitted does not mean zero.
     * @zh 包含附件 0 的颜色附件数量。目前仅 MRT 提供；未提供不代表没有颜色附件。
     */
    readonly colorAttachmentCount?: number;
    samples: number;
    generateMipmap: boolean;
    depthStencilTexture: BaseTexture | null;
}
