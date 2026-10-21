import { LayaGL } from "../layagl/LayaGL";
import { InternalTexture } from "../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { InternalRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { BaseTexture } from "./BaseTexture";
import { RenderTexture } from "./RenderTexture";

/** 单采样、无 mipmap 的 2D MRT 布局。 */
export interface RenderTextureMRTOptions {
    /** 全部附件共用的宽度。 */
    width: number;
    /** 全部附件共用的高度。 */
    height: number;
    /** 索引即固定 location；附件 0 必须存在，null 槽不分配纹理。 */
    colorFormats: readonly (RenderTargetFormat | null)[];
    /** 共享深度/模板格式，默认为 None。 */
    depthStencilFormat?: RenderTargetFormat;
    /** 是否提供共享深度的采样纹理。 */
    depthTexture?: boolean;
    /** 附件 0 是否使用 sRGB，其他附件始终保持线性。 */
    sRGB?: boolean;
}

/**
 * 多颜色附件渲染纹理。绑定目标时使用完整 MRT；采样本对象及继承的纹理属性仅对应附件 0。
 * 颜色和深度整组入池、销毁，布局不可重建；业务数据由 Shader 写入。
 */
export class RenderTextureMRT extends RenderTexture {
    private _colorFormats: readonly (RenderTargetFormat | null)[];
    private _colorTextures: (MRTAttachmentTexture | null)[] = [];
    private _poolLayout: string;

    /** 按完整、有序的附件布局借用整组 MRT，使用后调用 RenderTexture.recoverToPool。 */
    static createFromPool(options: RenderTextureMRTOptions): RenderTextureMRT;
    /** 兼容 RT 的单附件调用形式；MRT 仍限于单采样、无 mipmap、非存储纹理。 */
    static createFromPool(...args: Parameters<typeof RenderTexture.createFromPool>): RenderTextureMRT;
    static createFromPool(optionsOrWidth: RenderTextureMRTOptions | number, height?: number, colorFormat?: RenderTargetFormat,
        depthFormat?: RenderTargetFormat, mipmap: boolean = false, multiSamples: number = 1,
        depthTexture: boolean = false, sRGB: boolean = false, storage: boolean = false): RenderTextureMRT {
        if (typeof optionsOrWidth === "number" && (mipmap || multiSamples !== 1 || storage))
            throw new Error("RenderTextureMRT requires single sampling, no mipmaps and no storage usage.");
        const options = typeof optionsOrWidth === "number"
            ? { width: optionsOrWidth, height, colorFormats: [colorFormat], depthStencilFormat: depthFormat, depthTexture, sRGB }
            : optionsOrWidth;
        const formats = RenderTextureMRT._getFormats(options);
        // 空槽位置与格式顺序均参与池匹配，不能压缩或按位拼接。
        const layout = formats.join(",");
        const depth = options.depthStencilFormat ?? RenderTargetFormat.None;
        const sampledDepth = !!options.depthTexture && depth !== RenderTargetFormat.None;
        const gammaSpace = !!options.sRGB;
        for (let index = 0; index < RenderTexture._pool.length; index++) {
            const rt = RenderTexture._pool[index];
            if (rt instanceof RenderTextureMRT && !rt.destroyed && rt._poolLayout === layout
                && rt.width === options.width && rt.height === options.height && rt.depthStencilFormat === depth
                && rt.generateDepthTexture === sampledDepth && rt._gammaSpace === gammaSpace) {
                const last = RenderTexture._pool.pop();
                if (index < RenderTexture._pool.length) RenderTexture._pool[index] = last;
                RenderTexture._poolMemory -= rt._renderTarget.gpuMemory / 1024 / 1024;
                rt._inPool = false;
                return rt;
            }
        }
        const rt = new RenderTextureMRT({ ...options, colorFormats: formats });
        rt.lock = true;
        return rt;
    }

    private static _getFormats(options: RenderTextureMRTOptions): (RenderTargetFormat | null)[] {
        if (!options || !Array.isArray(options.colorFormats) || options.colorFormats.length === 0)
            throw new RangeError("RenderTextureMRT requires a non-empty colorFormats array.");
        if (!Number.isInteger(options.width) || !Number.isInteger(options.height) || options.width <= 0 || options.height <= 0)
            throw new RangeError("RenderTextureMRT dimensions must be positive integers.");
        if (options.depthTexture && options.depthStencilFormat === RenderTargetFormat.STENCIL_8)
            throw new Error("A stencil-only MRT attachment cannot be sampled as depth.");
        if (options.colorFormats[0] == null)
            throw new Error("RenderTextureMRT requires a color attachment at location 0.");
        // 数组空洞统一为显式 null，保留中间位置；末尾空槽不占设备槽位或资源池布局。
        const formats = Array.from(options.colorFormats, format => format == null ? null : RenderTexture._getCompatibleColorFormat(format));
        while (formats[formats.length - 1] === null) formats.pop();
        return formats;
    }

    /** 单颜色附件仍属于 MRT，不能与普通 RT 混池。 */
    get isMRT(): boolean {
        return true;
    }

    /** 不可变的固定槽位格式列表，未分配的槽位为 null。 */
    get colorFormats(): readonly (RenderTargetFormat | null)[] {
        return this._colorFormats;
    }

    /** 包含空槽的颜色槽位跨度，用于 Shader 输出位置和逐槽清除参数。 */
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

    /** 深度采样视图借用组内存储，不能独立销毁。 */
    get generateDepthTexture(): boolean { return this._generateDepthTexture; }
    set generateDepthTexture(value: boolean) {
        if (value && this.depthStencilFormat === RenderTargetFormat.STENCIL_8)
            throw new Error("A stencil-only MRT attachment cannot be sampled as depth.");
        if (this.depthStencilFormat === RenderTargetFormat.None) value = false;
        if (value && !this._depthStencilTexture) {
            const texture = LayaGL.textureContext.createRenderTargetDepthTexture(this._renderTarget, TextureDimension.Tex2D, this.width, this.height);
            this._depthStencilTexture = new MRTAttachmentTexture(this, texture, this.depthStencilFormat);
        }
        this._generateDepthTexture = value;
    }

    constructor(options: RenderTextureMRTOptions) {
        const formats = Object.freeze(RenderTextureMRT._getFormats(options));
        const { width, height } = options;
        const context = LayaGL.textureContext;
        if (!context.createMultiRenderTargetInternal)
            throw new Error("The active render backend does not support MRT.");
        // 设备先校验并创建整组，成功后再登记 Resource，避免无效参数残留包装对象。
        const target = context.createMultiRenderTargetInternal(
            width, height, formats, options.depthStencilFormat ?? RenderTargetFormat.None, !!options.sRGB);
        super(width, height, formats[0], options.depthStencilFormat ?? RenderTargetFormat.None, false, 1, !!options.depthTexture, !!options.sRGB, false);
        this._colorFormats = formats;
        this._poolLayout = formats.join(",");
        this._dimension = TextureDimension.Tex2D;
        this._renderTarget = target;
        this._texture = this._renderTarget._textures[0];
        for (let i = 0; i < this._colorFormats.length; i++) {
            const format = this._colorFormats[i];
            this._colorTextures.push(format === null ? null : new MRTAttachmentTexture(this, this._renderTarget._textures[i], format));
        }
        this.generateDepthTexture = this._generateDepthTexture;
    }

    /** @internal 基类构造时跳过单 RT 分配；整组由本类构造函数创建。 */
    _createRenderTarget(): void {
        if (this.destroyed || this._renderTarget)
            throw new Error("RenderTextureMRT cannot be recreated.");
    }

    /** @internal 完整 MRT 与仅主颜色绑定共用同一组颜色和深度，不分配或复制纹理。 */
    _getRenderTarget(colorAttachment0Only: boolean = false): InternalRenderTarget {
        this._checkAttachment(0);
        const target = colorAttachment0Only ? this._renderTarget._color0Target : this._renderTarget;
        if (!target) throw new Error("The MRT backend does not provide a color-0 binding.");
        return target;
    }

    /**
     * 返回稳定的颜色附件借用视图，未分配的槽位返回 null。请统一销毁 owner，不要单独销毁视图。
     * 引用视图会保护 owner，防止被自动回收。
     * 整组归池后不得继续使用旧视图；再次借用整组后重新获取。
     * @param index 从 0 开始的颜色附件索引，不是深度附件或数组层。
     */
    getColorTexture(index: number): BaseTexture | null {
        this._checkAttachment(index);
        return this._colorTextures[index];
    }

    /**
     * Pass 提交后按附件格式读取紧密排列的数据；字节使用 Uint8Array，浮点使用 Float32Array。
     * @param attachmentIndex 颜色附件索引，默认为 0。
     */
    async getDataAsync(xOffset: number, yOffset: number, width: number, height: number,
        out: Uint8Array | Uint8ClampedArray | Float32Array, attachmentIndex: number = 0): Promise<ArrayBufferView> {
        this._checkAttachment(attachmentIndex);
        if (this._colorFormats[attachmentIndex] === null)
            throw new Error(`MRT color attachment ${attachmentIndex} is not allocated.`);
        return LayaGL.textureContext.readRenderTargetPixelDataAsync(this._renderTarget, xOffset, yOffset, width, height, out, attachmentIndex);
    }

    /** 请使用 getDataAsync。 */
    getData(..._args: Parameters<RenderTexture["getData"]>): Uint8Array | Float32Array {
        throw new Error("RenderTextureMRT synchronous readback is not supported; use getDataAsync.");
    }

    /** 尺寸或布局变化时请归还旧组并重新借用。 */
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
            texture?.invalidate();
        this._colorTextures.length = 0;
        (this._depthStencilTexture as MRTAttachmentTexture)?.invalidate();
        this._depthStencilTexture = null;
        this._texture = null;
        if (this._renderTarget)
            super._disposeResource();
    }
}

/** 借用组内颜色或深度的视图，不独立拥有 GPU 资源，也不参与自动 GC。 */
class MRTAttachmentTexture extends BaseTexture {
    private _owner: RenderTextureMRT;

    constructor(owner: RenderTextureMRT, texture: InternalTexture, format: RenderTargetFormat) {
        super(owner.width, owner.height, format);
        this._owner = owner;
        this._dimension = TextureDimension.Tex2D;
        this._texture = texture;
        this.unmanaged();
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
        // 只有整组参与自动销毁；释放引用时可能使本视图一并失效。
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
        // 只解除一次转发给 owner 的引用；之后的材质清理仅调整失效视图自身的计数。
        if (this._referenceCount) owner._removeReference(this._referenceCount);
    }
}
