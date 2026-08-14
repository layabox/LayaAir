import {
    CopyTextureInfo,
    IComputeCMD_Dispatch,
    IComputeCMD_DispatchIndirect,
    IComputeContext,
    IGPUBuffer,
} from "../../../DriverDesign/RenderDevice/ComputeShader/IComputeContext";
import { IDeviceBuffer } from "../../../DriverDesign/RenderDevice/IDeviceBuffer";
import { ShaderData, ShaderDataItem, ShaderDataType } from "../../../DriverDesign/RenderDevice/ShaderData";
import { Color } from "../../../../maths/Color";
import { Matrix3x3 } from "../../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { LayaXDeviceBuffer } from "../LayaXDeviceBuffer";
import { LayaXInternalTex } from "../LayaXInternalTex";
import { LayaXInternalRT } from "../LayaXInternalRT";
import { LayaXShaderData } from "../LayaXShaderData";
import { LayaXComputeShaderInstance } from "./LayaXComputeShaderInstance";

/**
 * LayaX Compute Context — 对标 GLESComputeContext
 *
 * TS 只传 _nativeObj 引用，C++ 提取 handle 和组装 POD。
 * executeCMDs() = schedule，实际 flush 在 layax_render 中由 FeatureManager 统一驱动。
 */
export class LayaXComputeContext implements IComputeContext {

    private _nativeObj: any;
    private _destroyed: boolean = false;

    constructor() {
        // C++ side pulls g_layaxDevice directly — no device ptr needed from TS.
        this._nativeObj = new (window as any).conchLayaXComputeContext();
    }

    clearCMDs(): void {
        if (this._destroyed) return;
        this._nativeObj.clear();
    }

    addDispatchCommand(cmd: IComputeCMD_Dispatch): void {
        if (this._destroyed) return;
        const shader = cmd.shader as LayaXComputeShaderInstance;
        if (!shader || !shader.compilete || !shader._nativeObj) return;

        // 传 _nativeObj 引用，不提取 handle
        const cmdMaps = shader.uniformCommandMap
            ? shader.uniformCommandMap.map(m => m._nativeObj)
            : [];
        const sdObjs = cmd.shaderData
            ? cmd.shaderData.map(sd => (sd as LayaXShaderData)._nativeObj)
            : [];
        const p = cmd.dispatchParams;
        this._nativeObj.dispatch(
            shader._nativeObj,
            cmdMaps,
            sdObjs,
            p.x | 0, (p.y | 0) || 1, (p.z | 0) || 1,
        );
    }

    addDispatchIndirectCommand(cmd: IComputeCMD_DispatchIndirect): void {
        if (this._destroyed) return;
        const shader = cmd.shader as LayaXComputeShaderInstance;
        if (!shader || !shader.compilete || !shader._nativeObj) return;

        const cmdMaps = shader.uniformCommandMap
            ? shader.uniformCommandMap.map(m => m._nativeObj)
            : [];
        const sdObjs = cmd.shaderData
            ? cmd.shaderData.map(sd => (sd as LayaXShaderData)._nativeObj)
            : [];

        const indirectBuf = cmd.indirectBuffer as any;
        if (!indirectBuf?._nativeObj) return;

        this._nativeObj.dispatchIndirect(
            shader._nativeObj,
            cmdMaps,
            sdObjs,
            indirectBuf._nativeObj,
            cmd.indirectOffset >>> 0,
        );
    }

    /**
     * 把"设置 ShaderData 值"作为命令录到 ComputeFeature 的命令流,
     * flush 时按录制顺序写回 ShaderDataBlock CPU 数据并更新 UBO。
     * 保证命令流的"录制+重放"语义 —— 同一个 ComputeCommandBuffer 被重复
     * execute 时每次都按原始值序列写。对标 WebGPUComputeContext 行为。
     *
     * DeviceBuffer / ReadOnlyDeviceBuffer 暂不走命令流(Rust ShaderDataValue
     * 未包含该变体),保留立即写到 ShaderDataBlock。
     */
    addSetShaderDataCommand(
        shaderData: ShaderData,
        propertyID: number,
        shaderDataType: ShaderDataType,
        value: ShaderDataItem,
    ): void {
        if (this._destroyed || !shaderData) return;
        const sdNative = (shaderData as LayaXShaderData)._nativeObj;
        if (!sdNative) return;
        // 标量/向量 setter 已拍平为传 handle（fast）；mat/texture/buffer 仍传 sdNative（raw）。
        // 复用 ShaderData 构造期缓存的 _handleId，避免每帧多次 getHandle FFI。
        const sdHandle = (shaderData as LayaXShaderData)._handleId;

        switch (shaderDataType) {
            case ShaderDataType.Int:
                this._nativeObj.setShaderDataInt(sdHandle, propertyID, (value as number) | 0);
                break;
            case ShaderDataType.Float:
                this._nativeObj.setShaderDataFloat(sdHandle, propertyID, value as number);
                break;
            case ShaderDataType.Bool:
                this._nativeObj.setShaderDataBool(sdHandle, propertyID, !!value);
                break;
            case ShaderDataType.Vector2: {
                const v = value as Vector2;
                this._nativeObj.setShaderDataVec2(sdHandle, propertyID, v.x, v.y);
                break;
            }
            case ShaderDataType.Vector3: {
                const v = value as Vector3;
                this._nativeObj.setShaderDataVec3(sdHandle, propertyID, v.x, v.y, v.z);
                break;
            }
            case ShaderDataType.Vector4: {
                const v = value as Vector4;
                this._nativeObj.setShaderDataVec4(sdHandle, propertyID, v.x, v.y, v.z, v.w);
                break;
            }
            case ShaderDataType.Color: {
                // Rust ShaderDataValue 只有 Vector4 变体,Color pack 成 (r,g,b,a) Vec4 下传。
                const c = value as Color;
                this._nativeObj.setShaderDataVec4(sdHandle, propertyID, c.r, c.g, c.b, c.a);
                break;
            }
            case ShaderDataType.Matrix3x3:
                this._nativeObj.setShaderDataMat3(sdNative, propertyID, value as Matrix3x3);
                break;
            case ShaderDataType.Matrix4x4:
                this._nativeObj.setShaderDataMat4(sdNative, propertyID, value as Matrix4x4);
                break;
            case ShaderDataType.Buffer:
                // jsbind 自动把 Float32Array → ArrayBuffer(带 byteOffset/byteLength)
                this._nativeObj.setShaderDataBuffer(sdNative, propertyID, value as Float32Array);
                break;
            case ShaderDataType.Texture2D:
            case ShaderDataType.StorageTexture2D: {
                // 复用 LayaXShaderData.setTexture 的解包逻辑:RT 取 colorTex[0],
                // 普通纹理取 _texture._nativeObj。
                let tex = value as BaseTexture;
                if (tex && (tex as any).bitmap) tex = (tex as any).bitmap;
                let texNative: any = null;
                if (tex && (tex as any)._texture) {
                    const t = (tex as any)._texture;
                    if (t instanceof LayaXInternalRT) {
                        const colorTex = t._textures?.[0];
                        texNative = colorTex ? (colorTex as LayaXInternalTex)._nativeObj : null;
                    } else {
                        texNative = (t as LayaXInternalTex)._nativeObj;
                    }
                }
                this._nativeObj.setShaderDataTexture(sdNative, propertyID, texNative);
                break;
            }
            case ShaderDataType.DeviceBuffer:
            case ShaderDataType.ReadOnlyDeviceBuffer:
                // 暂不走命令流,保留立即写(Rust 侧 ShaderDataValue 未加 DeviceBuffer 变体)。
                shaderData.setDeviceBuffer(propertyID, value as LayaXDeviceBuffer);
                break;
            default:
                break;
        }
    }

    addBufferToBufferCommand(
        src: IGPUBuffer, dest: IGPUBuffer,
        sourceOffset: number = 0, destinationOffset: number = 0, size?: number,
    ): void {
        if (this._destroyed) return;
        const srcNative = (src as any)?._nativeObj;
        const dstNative = (dest as any)?._nativeObj;
        if (!srcNative || !dstNative || !size || size <= 0) return;
        this._nativeObj.copyBuffer(
            srcNative, sourceOffset >>> 0,
            dstNative, destinationOffset >>> 0,
            size >>> 0,
        );
    }

    addBufferToTextureCommand(_src: IGPUBuffer, _srcInfo: any, _dstInfo: any, _copySize: any): void {
        // TODO: 等实际需要时三端补齐
    }

    addTextureToBufferCommand(_srcInfo: any, _dst: IGPUBuffer, _dstInfo: any, _copySize: Iterable<number>): void {
        // TODO: 等实际需要时三端补齐
    }

    addTextureToTextureCommand(
        srcTextureInfo: CopyTextureInfo,
        destTextureInfo: CopyTextureInfo,
        copySize: Iterable<number>,
    ): void {
        if (this._destroyed) return;
        const srcTex = srcTextureInfo?.texture as LayaXInternalTex | undefined;
        const dstTex = destTextureInfo?.texture as LayaXInternalTex | undefined;
        if (!srcTex?._nativeObj || !dstTex?._nativeObj) return;

        const so = srcTextureInfo.origin;
        const dco = destTextureInfo.origin;
        const ext = LayaXComputeContext._extentToTuple(copySize);

        this._nativeObj.copyTexture(
            srcTex._nativeObj, srcTextureInfo.mipLevel >>> 0,
            so.x | 0, so.y | 0, so.z | 0,
            dstTex._nativeObj, destTextureInfo.mipLevel >>> 0,
            dco.x | 0, dco.y | 0, dco.z | 0,
            ext[0], ext[1], ext[2],
        );
    }

    addClearBufferCommand(dest: IDeviceBuffer, destoffset: number, destCount: number): void {
        if (this._destroyed) return;
        const dstNative = (dest as any)?._nativeObj;
        if (!dstNative) return;
        this._nativeObj.clearBuffer(dstNative, destoffset >>> 0, destCount >>> 0);
    }

    executeCMDs(): void {
        if (this._destroyed) return;
        this._nativeObj.execute();
    }

    destroy(): void {
        if (this._destroyed) return;
        this._destroyed = true;
        this._nativeObj = null;
    }

    // ----------------------------------------------------------------
    // 内部工具
    // ----------------------------------------------------------------

    private static _extentToTuple(extent: Iterable<number> | { width: number; height: number; depthOrArrayLayers?: number }): [number, number, number] {
        if (extent && typeof (extent as any)[Symbol.iterator] === "function") {
            const arr: number[] = [];
            for (const v of extent as Iterable<number>) {
                arr.push(v >>> 0);
                if (arr.length === 3) break;
            }
            while (arr.length < 3) arr.push(arr.length === 2 ? 1 : 0);
            return [arr[0], arr[1], arr[2]];
        }
        const e = extent as any;
        return [(e.width >>> 0) || 0, (e.height >>> 0) || 0, ((e.depthOrArrayLayers ?? 1) >>> 0) || 1];
    }
}
