import { LayaGL } from "../layagl/LayaGL";
import { InternalTexture } from "../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { BaseTexture } from "./BaseTexture";
import { RenderTexture } from "./RenderTexture";

/**
 * @en Options for an owned, single-sampled, linear 2D MRT without mipmaps.
 * @zh 拥有全部附件的单采样、线性、无 mipmap 的 2D MRT 创建参数。
 */
export interface RenderTextureMRTOptions {
    /** @en Shared width. @zh 全部附件共用的宽度。 */
    width: number;
    /** @en Shared height. @zh 全部附件共用的高度。 */
    height: number;
    /** @en Ordered color formats, including slot 0. @zh 包含附件 0 的有序颜色格式列表。 */
    colorFormats: readonly RenderTargetFormat[];
    /** @en Shared depth/stencil format. Defaults to None. @zh 共享深度/模板格式，默认为 None。 */
    depthStencilFormat?: RenderTargetFormat;
}

/**
 * @en A render texture with multiple color attachments. Binding uses the complete MRT;
 * sampling this object and inherited texture properties address color attachment 0 only.
 * Callers must check device format support and provide a matching multi-output shader.
 * @zh 多颜色附件渲染纹理。绑定目标时使用完整 MRT；采样本对象及继承的纹理属性仅对应附件 0。
 * 调用方须确认设备格式支持并提供匹配的多输出 Shader。首版不支持池化、原地重建或可采样深度。
 */
export class RenderTextureMRT extends RenderTexture {
    private _colorFormats: readonly RenderTargetFormat[];
    private _colorTextures: MRTColorTexture[] = [];

    /** @en MRT pooling is not supported. @zh MRT 暂不支持对象池。 */
    static createFromPool(..._args: Parameters<typeof RenderTexture.createFromPool>): RenderTextureMRT {
        throw new Error("RenderTextureMRT pooling is not supported; construct a new instance.");
    }

    /**
     * @en Always true for an MRT resource, even with a single color attachment.
     * @zh MRT 资源始终为 true，即使只有一个颜色附件。
     */
    get isMRT(): boolean {
        return true;
    }

    /** @en Immutable ordered color formats. @zh 不可变的有序颜色格式列表。 */
    get colorFormats(): readonly RenderTargetFormat[] {
        return this._colorFormats;
    }

    /** @en Color attachment count, including slot 0. @zh 包含附件 0 的颜色附件总数。 */
    get colorAttachmentCount(): number {
        return this._colorFormats.length;
    }

    /** @inheritDoc */
    get width(): number { return this._width; }
    set width(value: number) {
        if (value !== this._width)
            throw new Error("RenderTextureMRT dimensions are immutable; construct a new instance.");
    }

    /** @inheritDoc */
    get height(): number { return this._height; }
    set height(value: number) {
        if (value !== this._height)
            throw new Error("RenderTextureMRT dimensions are immutable; construct a new instance.");
    }

    /** @en Sampleable MRT depth is not supported. @zh MRT 暂不支持可采样深度纹理。 */
    get generateDepthTexture(): boolean { return false; }
    set generateDepthTexture(value: boolean) {
        if (value)
            throw new Error("RenderTextureMRT does not support sampleable depth textures.");
    }

    /** @inheritDoc */
    get depthStencilTexture(): BaseTexture { return null; }

    /**
     * @en Creates all attachments once; dimensions and attachment layout remain fixed.
     * @param options Attachment creation parameters. Device support is checked by the caller.
     * @zh 一次性创建全部附件，尺寸和附件布局在生命周期内保持不变。
     * @param options 附件创建参数。设备格式支持由调用方预先确认。
     */
    constructor(options: RenderTextureMRTOptions) {
        if (!options || !Array.isArray(options.colorFormats) || options.colorFormats.length === 0)
            throw new RangeError("RenderTextureMRT requires a non-empty colorFormats array.");
        const { width, height } = options;
        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0)
            throw new RangeError("RenderTextureMRT dimensions must be positive integers.");
        const formats = Object.freeze(options.colorFormats.slice());
        super(width, height, formats[0], options.depthStencilFormat ?? RenderTargetFormat.None, false, 1, false, false, false);
        // The virtual call from RenderTexture's constructor was skipped before formats existed.
        this._colorFormats = formats;
        try {
            this._createRenderTarget();
        } catch (error) {
            // Also remove the failed wrapper from Resource's managed-resource registry.
            this.destroy();
            throw error;
        }
    }

    /** @internal */
    _createRenderTarget(): void {
        if (!this._colorFormats)
            return;
        if (this.destroyed || this._renderTarget)
            throw new Error("RenderTextureMRT cannot be recreated.");
        this._dimension = TextureDimension.Tex2D;
        this._renderTarget = LayaGL.textureContext.createMultiRenderTargetInternal(
            this.width, this.height, this._colorFormats, this._depthStencilFormat);
        this._texture = this._renderTarget._textures[0];
        for (let i = 0; i < this._colorFormats.length; i++)
            this._colorTextures.push(new MRTColorTexture(this, this._renderTarget._textures[i], this._colorFormats[i]));
    }

    /**
     * @en Returns a stable borrowed color texture. Its sampling state is per attachment.
     * Do not destroy the view; destroy the owner. Referencing a view keeps the owner alive.
     * @param index Zero-based color attachment index, not a depth attachment or array layer.
     * @zh 返回稳定的颜色附件借用视图，可分别设置采样状态。请统一销毁 owner，不要单独销毁视图。
     * 引用视图会保护 owner，防止被自动回收。
     * @param index 从 0 开始的颜色附件索引，不是深度附件或数组层。
     */
    getColorTexture(index: number): BaseTexture {
        this._checkAttachment(index);
        return this._colorTextures[index];
    }

    /**
     * @en Reads tightly packed RGBA from the selected attachment after the producing pass is submitted.
     * Byte formats require Uint8Array/Uint8ClampedArray; floating formats require Float32Array.
     * @param attachmentIndex Color attachment index. Defaults to 0.
     * @zh 在产生结果的 Pass 提交后，读取指定附件的紧密排列 RGBA 数据。
     * 字节格式使用 Uint8Array/Uint8ClampedArray，浮点格式使用 Float32Array。
     * @param attachmentIndex 颜色附件索引，默认为 0。
     */
    async getDataAsync(xOffset: number, yOffset: number, width: number, height: number,
        out: Uint8Array | Uint8ClampedArray | Float32Array, attachmentIndex: number = 0): Promise<ArrayBufferView> {
        this._checkAttachment(attachmentIndex);
        return LayaGL.textureContext.readRenderTargetPixelDataAsync(this._renderTarget, xOffset, yOffset, width, height, out, attachmentIndex);
    }

    /** @en Use getDataAsync instead. @zh 请使用 getDataAsync。 */
    getData(..._args: Parameters<RenderTexture["getData"]>): Uint8Array | Float32Array {
        throw new Error("RenderTextureMRT synchronous readback is not supported; use getDataAsync.");
    }

    /** @en Construct a new MRT instead. @zh 请新建 MRT 实例。 */
    recreate(..._args: Parameters<RenderTexture["recreate"]>): void {
        throw new Error("RenderTextureMRT cannot be recreated; construct a new instance.");
    }

    private _checkAttachment(index: number): void {
        if (this.destroyed || !this._renderTarget)
            throw new Error("Cannot access a destroyed RenderTextureMRT.");
        if (!Number.isInteger(index) || index < 0 || index >= this._colorFormats.length)
            throw new RangeError(`MRT color attachment index out of range: ${index}.`);
    }

    /** @internal */
    _getSource() {
        this._checkAttachment(0);
        return super._getSource();
    }

    /** @inheritDoc */
    protected _disposeResource(): void {
        for (const texture of this._colorTextures)
            texture.invalidate();
        this._colorTextures.length = 0;
        this._texture = null;
        if (this._renderTarget)
            super._disposeResource();
    }
}

/** A borrowed view, never an independent GPU resource owner or managed GC candidate. */
class MRTColorTexture extends BaseTexture {
    private _owner: RenderTextureMRT;

    constructor(owner: RenderTextureMRT, texture: InternalTexture, format: RenderTargetFormat) {
        super(owner.width, owner.height, format);
        this._owner = owner;
        try {
            this._dimension = TextureDimension.Tex2D;
            this._texture = texture;
            this.unmanaged();
        } catch (error) {
            this.invalidate();
            throw error;
        }
    }

    get width(): number { return this._width; }
    set width(value: number) {
        if (value !== this._width) throw new Error("MRT attachment dimensions are immutable.");
    }

    get height(): number { return this._height; }
    set height(value: number) {
        if (value !== this._height) throw new Error("MRT attachment dimensions are immutable.");
    }

    _addReference(count: number = 1): void {
        if (this.destroyed || this._owner.destroyed)
            throw new Error("Cannot reference a destroyed MRT attachment.");
        this._referenceCount += count;
        this._owner._addReference(count);
    }

    _removeReference(count: number = 1): void {
        // Only the owner participates in automatic destruction. It may invalidate this view here.
        this._referenceCount -= count;
        this._owner?._removeReference(count);
    }

    _clearReference(): void {
        const count = this._referenceCount;
        this._referenceCount = 0;
        if (count) this._owner?._removeReference(count);
    }

    _getSource() {
        if (this.destroyed)
            throw new Error("Cannot sample a destroyed MRT attachment.");
        return super._getSource();
    }

    destroy(): void {
        if (!this.destroyed)
            throw new Error("MRT attachment views cannot be destroyed independently; destroy their owner.");
    }

    invalidate(): void {
        super.destroy();
    }

    protected _disposeResource(): void {
        const owner = this._owner;
        this._owner = null;
        this._texture = null;
        // Detach forwarded references once; later material cleanup only adjusts this dead view.
        if (this._referenceCount) owner._removeReference(this._referenceCount);
    }
}
