import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { LayaXInternalTex } from "./LayaXInternalTex";

/**
 * 共享属性块槽位，与 C++ `LayaXInternalRT_JS::Props` 结构体字段顺序一一对应。
 * 改任一侧必须同步改另一侧。bool 字段用 Int32 槽 0/1 表示。
 */
const enum RTSlot {
    Samples = 0,
    IsCube = 1,
    GenerateMipmap = 2,
    ColorFormat = 3,
    DepthStencilFormat = 4,
    IsSRGB = 5,
    GpuMemory = 6,
    Count = 7,
}

export class LayaXInternalRT implements InternalRenderTarget {
    _texturesRef: (InternalTexture | null)[];
    _depthTextureRef: InternalTexture;
    _nativeObj: any;
    readonly colorFormats?: readonly (RenderTargetFormat | null)[];
    readonly _owner: LayaXInternalRT;
    private _color0TargetRef: LayaXInternalRT;
    private _disposed = false;

    /** @internal 共享属性块：C++ 创建时写、bind 时播种、JS 读；槽位见 RTSlot */
    private _propBuf = new ArrayBuffer(RTSlot.Count * 4);
    private _propU32 = new Uint32Array(this._propBuf);
    private _propI32 = new Int32Array(this._propBuf);

    constructor(nativeObj: any, owner: LayaXInternalRT = null) {
        if (!nativeObj)
            throw new Error("Cannot wrap a missing LayaX render target.");
        this._nativeObj = nativeObj;
        this._nativeObj.bindPropertyBuffer(this._propBuf);
        this._owner = owner;
        if (owner) {
            this._texturesRef = [owner._textures[0]];
        } else {
            const formats: number[] = nativeObj.getColorFormats();
            if (formats.length)
                this.colorFormats = Object.freeze(formats.map(format => format === RenderTargetFormat.None ? null : format));
        }
    }

    get destroyed(): boolean {
        return this._disposed || !!this._owner?.destroyed;
    }

    get _color0Target(): LayaXInternalRT {
        if (this.destroyed)
            return null;
        if (!this._color0TargetRef && this.colorFormats) {
            const target = this._nativeObj.getColor0Target();
            if (target)
                this._color0TargetRef = new LayaXInternalRT(target, this);
        }
        return this._color0TargetRef;
    }

    get _isCube(): boolean {
        return this._propI32[RTSlot.IsCube] !== 0;
    }
    set _isCube(value: boolean) {
        this._propI32[RTSlot.IsCube] = value ? 1 : 0;
    }

    get _samples(): number {
        return this._propU32[RTSlot.Samples];
    }
    set _samples(value: number) {
        this._propU32[RTSlot.Samples] = value;
    }

    get _generateMipmap(): boolean {
        return this._propI32[RTSlot.GenerateMipmap] !== 0;
    }
    set _generateMipmap(value: boolean) {
        this._propI32[RTSlot.GenerateMipmap] = value ? 1 : 0;
    }

    get colorFormat(): RenderTargetFormat {
        return this._propI32[RTSlot.ColorFormat];
    }
    set colorFormat(value: RenderTargetFormat) {
        this._propI32[RTSlot.ColorFormat] = value;
    }

    get depthStencilFormat(): RenderTargetFormat {
        return this._propI32[RTSlot.DepthStencilFormat];
    }
    set depthStencilFormat(value: RenderTargetFormat) {
        this._propI32[RTSlot.DepthStencilFormat] = value;
    }

    get isSRGB(): boolean {
        return this._propI32[RTSlot.IsSRGB] !== 0;
    }
    set isSRGB(value: boolean) {
        this._propI32[RTSlot.IsSRGB] = value ? 1 : 0;
    }

    get gpuMemory(): number {
        return this._propU32[RTSlot.GpuMemory];
    }
    set gpuMemory(value: number) {
        this._propU32[RTSlot.GpuMemory] = value;
    }

    get _textures(): (InternalTexture | null)[] {
        if (this._texturesRef) {
            return this._texturesRef;
        } else {
            this._texturesRef = [];
            let textures: any = this._nativeObj.getTextures();
            textures.forEach((element: any) => {
                this._texturesRef.push(element ? new LayaXInternalTex(element) : null);
            });
            return this._texturesRef;
        }
    }

    get _depthTexture(): InternalTexture {
        if (this._owner)
            return this._owner._depthTexture;
        if (this._depthTextureRef) {
            return this._depthTextureRef;
        } else {
            var nativeObj = this._nativeObj.getDepthTexture();
            if (nativeObj)
                this._depthTextureRef = new LayaXInternalTex(nativeObj);
            return this._depthTextureRef;
        }
    }

    dispose(): void {
        if (this._disposed)
            return;
        this._disposed = true;
        this._nativeObj.dispose();
        this._texturesRef = null;
        this._depthTextureRef = null;
        if (this._color0TargetRef) {
            this._color0TargetRef._disposed = true;
            this._color0TargetRef._texturesRef = null;
            this._color0TargetRef._depthTextureRef = null;
        }
    }
}
