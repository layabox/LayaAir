import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { RenderTexture } from "../../../resource/RenderTexture";

/**
 * @en Configuration of the camera's opaque-only auxiliary outputs.
 * @zh 相机仅不透明队列的辅助输出配置。
 */
export interface CameraOpaqueMRTOptions {
    /**
     * @en Auxiliary index i maps to fragment output location i + 1.
     * @zh 辅助索引 i 对应片元输出 location i + 1，location 0 由相机管理。
     */
    readonly auxiliaryAttachments: readonly {
        readonly format: RenderTargetFormat;
        /**
         * @en Linear data value; defaults to transparent black. Cleared every frame.
         * @zh 线性数据清除值，默认透明黑色，每帧清除。
         */
        readonly clearColor?: Color;
    }[];
}

/** @internal Owns auxiliary textures, but only borrows the camera's main color/depth. */
export class CameraOpaqueMRT {
    readonly options: CameraOpaqueMRTOptions;
    private readonly _clearColors: (Color | null)[];
    textures: RenderTexture[] = [];
    target: InternalRenderTarget = null;

    constructor(options: CameraOpaqueMRTOptions) {
        if (!LayaGL.renderEngine.getCapable(RenderCapable.MRT))
            throw new Error("Camera opaque MRT requires MRT support.");
        const attachments = options.auxiliaryAttachments;
        const max = LayaGL.renderEngine.getParams(RenderParams.Max_Color_Attachment_Count);
        if (!attachments || !attachments.length || attachments.length + 1 > max)
            throw new Error(`Camera opaque MRT requires 1 to ${max - 1} auxiliary attachments.`);
        this.options = Object.freeze({ auxiliaryAttachments: Object.freeze(attachments.map(attachment => {
            const clearColor = attachment.clearColor ? attachment.clearColor.clone() : new Color(0, 0, 0, 0);
            return Object.freeze({ format: attachment.format, clearColor: Object.freeze(clearColor) });
        })) });
        this._clearColors = [null];
        for (const attachment of this.options.auxiliaryAttachments) this._clearColors.push(attachment.clearColor);
    }

    getClearColors(mainColor: Color | null): readonly (Color | null)[] {
        // Auxiliary colors belong to the immutable configuration; only the main clear/load changes per frame.
        this._clearColors[0] = mainColor;
        return this._clearColors;
    }

    prepare(main: RenderTexture): InternalRenderTarget {
        this.releaseTarget();
        if (main.samples !== 1)
            throw new Error("Camera opaque MRT does not support MSAA.");
        if (this.textures.length && (this.textures[0].width !== main.width || this.textures[0].height !== main.height))
            this.destroyTextures();
        try {
            if (!this.textures.length) {
                for (const attachment of this.options.auxiliaryAttachments) {
                    const texture = new RenderTexture(main.width, main.height, attachment.format, RenderTargetFormat.None, false, 1, false, false);
                    // Camera-owned, not pooled: remains valid for postprocess and between frames.
                    texture._addReference();
                    this.textures.push(texture);
                }
            }
            this.target = LayaGL.textureContext.createMultiRenderTargetViewInternal([
                main._renderTarget, ...this.textures.map(texture => texture._renderTarget)
            ]);
            return this.target;
        } catch (error) {
            this.destroyTextures();
            throw error;
        }
    }

    releaseTarget(): void {
        this.target?.dispose();
        this.target = null;
    }

    private destroyTextures(): void {
        for (const texture of this.textures) {
            texture._removeReference();
            texture.destroy();
        }
        this.textures.length = 0;
    }

    destroy(): void {
        this.releaseTarget();
        this.destroyTextures();
    }
}
