import { IIndexBuffer } from "./IIndexBuffer";
import { IVertexBuffer } from "./IVertexBuffer";

/**
 * 释放设备缓冲区上保留的 CPU 副本（若有）。
 *
 * 背景：WebGPU 后端曾在每次 setData 时把上传的 ArrayBuffer 存到驱动缓冲的 buffer 字段，
 * 使 JS 堆在 GPUBuffer 生命周期内长期保留一份与 GPU 副本等大的 CPU 数据（相对 WebGL 约翻倍）。
 * 新版 WebGPU 驱动改为 keepCPUData opt-in，并提供 releaseCPUData()；本辅助函数对新旧驱动都安全：
 * 优先调用 releaseCPUData()，否则直接清空旧版驱动公开的 buffer/bufferoffset 字段。
 *
 * @en Release the CPU copy retained on a device buffer (if any).
 * The WebGPU driver used to cache the uploaded ArrayBuffer on the buffer field in setData, keeping a
 * full CPU copy alive for the GPUBuffer's lifetime (about 2x memory vs WebGL). New driver versions make
 * retention opt-in (keepCPUData) and expose releaseCPUData(); this helper works with both old and new
 * drivers: it calls releaseCPUData() when present, otherwise clears the legacy public buffer/bufferoffset fields.
 */
export function releaseDeviceBufferCPUData(buffer: IVertexBuffer | IIndexBuffer): void {
    if (!buffer)
        return;
    const dev = buffer as any;
    if (typeof dev.releaseCPUData === "function") {
        dev.releaseCPUData();
    } else {
        if ("buffer" in dev)
            dev.buffer = null;
        if ("bufferoffset" in dev)
            dev.bufferoffset = 0;
    }
}
