import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { GLESInternalTex } from "./GLESInternalTex";

/**
 * 共享属性块槽位，与 C++ `GLESInternalRT::bindPropertyBuffer` 的写入顺序一一对应。
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

export class GLESInternalRT implements InternalRenderTarget {
    _texturesRef: InternalTexture[];
    _depthTextureRef: InternalTexture;
    _nativeObj: any;

    /** @internal 共享属性块：C++ 成员为真相、bind 时播种、JS 读；槽位见 RTSlot */
    private _propBuf = new ArrayBuffer(RTSlot.Count * 4);
    private _propU32 = new Uint32Array(this._propBuf);
    private _propI32 = new Int32Array(this._propBuf);

    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
        this._nativeObj.bindPropertyBuffer(this._propBuf);
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

    get _textures(): InternalTexture[] {
        if (this._texturesRef) {
            return this._texturesRef;
        }
        else {
            this._texturesRef = [];
            let textures: any = this._nativeObj.getTextures();
            textures.forEach((element: any) => {
                this._texturesRef.push(new GLESInternalTex(element));
            });
            return this._texturesRef;
        }
    }
    get _depthTexture(): InternalTexture {
        if (this._depthTextureRef) {
            return this._depthTextureRef;
        }
        else {
            var nativeObj = this._nativeObj.getDepthTexture();
            if (nativeObj)
                this._depthTextureRef = new GLESInternalTex(nativeObj);
            return this._depthTextureRef;
        }
    }
    dispose(): void {
        this._nativeObj.dispose();
    }

}
