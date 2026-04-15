import { EDeviceBufferUsage, IDeviceBuffer } from "../../DriverDesign/RenderDevice/IDeviceBuffer";
import { IGPUBuffer } from "../../DriverDesign/RenderDevice/ComputeShader/IComputeContext";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { LayaXReadbackDispatcher } from "./LayaXReadbackDispatcher";
import { LayaXVertexBuffer } from "./LayaXVertexBuffer";

/**
 * LayaX 后端 DeviceBuffer (Storage Buffer) 薄包装。
 *
 * - native 对象由 `conchLayaXDeviceBuffer(rhiUsage, heapType)` 构造，持有 GpuDeviceBufferId (u32)
 * - 越界 setData 由 Rust FFI 自动 destroy + recreate 扩容（与 VB/IB 一致）
 * - 扩容后已绑定到 ShaderData 的旧 handle 不会自动刷新，调用方需重新 `setDeviceBuffer`
 */
export class LayaXDeviceBuffer implements IDeviceBuffer, IGPUBuffer {
    _nativeObj: any;

    private _usage: EDeviceBufferUsage;
    private _size: number = 0;
    private _destroyed: boolean = false;

    constructor(usage: EDeviceBufferUsage) {
        this._usage = usage;
        this._nativeObj = new (window as any).conchLayaXDeviceBuffer(
            LayaXDeviceBuffer._convertUsage(usage),
            LayaXDeviceBuffer._convertHeapType(usage),
        );
    }

    /**
     * EDeviceBufferUsage(LayaAir) → rhi_resource::buffer_usage(Rust) 位映射。
     *
     * Rust bit:  VERTEX=0, INDEX=1, UNIFORM=2, STORAGE=3, INDIRECT=4, COPY_SRC=5, COPY_DST=6
     * MAP_READ / MAP_WRITE 不在 usage flags 中，它们决定 heap_type。
     */
    private static _convertUsage(usage: EDeviceBufferUsage): number {
        let r = 0;
        if (usage & EDeviceBufferUsage.VERTEX) r |= 1 << 0;
        if (usage & EDeviceBufferUsage.STORAGE) r |= 1 << 3;
        if (usage & EDeviceBufferUsage.INDIRECT) r |= 1 << 4;
        if (usage & EDeviceBufferUsage.COPY_SRC) r |= 1 << 5;
        if (usage & EDeviceBufferUsage.COPY_DST) r |= 1 << 6;
        return r;
    }

    /**
     * MAP_READ → 2 (Readback) / MAP_WRITE → 1 (Upload) / 否则 0 (DeviceLocal)
     */
    private static _convertHeapType(usage: EDeviceBufferUsage): number {
        if (usage & EDeviceBufferUsage.MAP_READ) return 2;
        if (usage & EDeviceBufferUsage.MAP_WRITE) return 1;
        return 0;
    }

    getNativeBuffer(): any {
        return this._nativeObj;
    }

    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        this._nativeObj.setData(buffer, bufferOffset, dataStartIndex, dataCount);
        const required = bufferOffset + dataCount;
        if (required > this._size) this._size = required;
    }

    setDataLength(byteLength: number): void {
        if (byteLength !== this._size) {
            this._size = byteLength;
            this._nativeObj.setDataLength(byteLength);
        }
    }

    copyToBuffer(buffer: IVertexBuffer | IDeviceBuffer, sourceOffset: number, destOffset: number, byteLength: number): void {
        if (buffer instanceof LayaXVertexBuffer) {
            this._nativeObj.copyToVertexBuffer((buffer as LayaXVertexBuffer)._nativeObj, sourceOffset, destOffset, byteLength);
        } else if (buffer instanceof LayaXDeviceBuffer) {
            this._nativeObj.copyToDeviceBuffer((buffer as LayaXDeviceBuffer)._nativeObj, sourceOffset, destOffset, byteLength);
        } else {
            throw new Error("LayaXDeviceBuffer.copyToBuffer() invalid buffer type");
        }
    }

    copyToTexture(): void {
        // TODO: 与 Compute Pass 一起补
    }

    readData(dest: ArrayBuffer, destOffset: number, srcOffset: number, byteLength: number): Promise<void> {
        return new Promise((resolve, reject) => {
            // --- 参数校验（尽早 reject，避免把垃圾请求交给底层）---
            if (this._destroyed) {
                reject(new Error("LayaXDeviceBuffer.readData: buffer destroyed"));
                return;
            }
            if (!dest) {
                reject(new Error("LayaXDeviceBuffer.readData: dest is null"));
                return;
            }
            if (!Number.isFinite(byteLength) || byteLength <= 0) {
                reject(new Error("LayaXDeviceBuffer.readData: byteLength must be > 0"));
                return;
            }
            if (!Number.isFinite(destOffset) || destOffset < 0 ||
                !Number.isFinite(srcOffset) || srcOffset < 0) {
                reject(new Error("LayaXDeviceBuffer.readData: offsets must be >= 0"));
                return;
            }
            if (destOffset + byteLength > dest.byteLength) {
                reject(new Error(
                    "LayaXDeviceBuffer.readData: destOffset + byteLength (" +
                    (destOffset + byteLength) + ") exceeds dest.byteLength (" +
                    dest.byteLength + ")",
                ));
                return;
            }
            if (this._size > 0 && srcOffset + byteLength > this._size) {
                reject(new Error(
                    "LayaXDeviceBuffer.readData: srcOffset + byteLength (" +
                    (srcOffset + byteLength) + ") exceeds buffer size (" +
                    this._size + ")",
                ));
                return;
            }

            // native 返回 request_id（double；>0 表示已提交，0=失败）
            const id: number = this._nativeObj.readData(dest, destOffset, srcOffset, byteLength);
            if (!id || id <= 0) {
                reject(new Error("LayaXDeviceBuffer.readData: submit failed"));
                return;
            }
            // 关键：resolve/reject 闭包显式持 dest 引用，防止回读未完成前 dest 被 GC
            // 回收（FFI 只拿了裸指针，不对 JS GC 可见）。
            const keepalive = dest;
            LayaXReadbackDispatcher.register(
                id,
                () => { void keepalive; resolve(); },
                (e) => { void keepalive; reject(e); },
            );
        });
    }

    destroy(): void {
        if (this._destroyed) return;
        if (this._nativeObj) this._nativeObj.destroy();
        this._destroyed = true;
    }

    get destroyed(): boolean { return this._destroyed; }
    get size(): number { return this._size; }
    get usage(): EDeviceBufferUsage { return this._usage; }
}
