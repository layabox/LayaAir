import { GeometryElement } from "../d3/core/GeometryElement";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { DeviceBuffer } from "../d3/graphics/DeviceBuffer";
import { IndexBuffer3D } from "../d3/graphics/IndexBuffer3D";
import { Bounds } from "../d3/math/Bounds";
import { Vector3 } from "../maths/Vector3";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { VertexElement } from "../renders/VertexElement";
import { VertexElementFormat } from "../renders/VertexElementFormat";
import { BufferState } from "../webgl/utils/BufferState";
/**
 * VFXStripGeometry — Strip/Trail 渲染几何体
 *
 * GPU 端 Output Strip CS 生成顶点数据到 DeviceBuffer (RenderBuffer)，
 * 这里负责管理 VB/IB/BufferState 和 IndirectDraw 设置。
 *
 * 顶点布局（per vertex, stride=64 bytes）：
 *   attr 0: vec4 position (xyz + w=1)
 *   attr 1: vec4 color (rgba)
 *   attr 2: vec2 uv (xy)
 *   attr 3: vec3 normal (xyz)
 */

export class VFXStripGeometryParams {
    capacity: number;
    stripVertexBuffer: DeviceBuffer;
    indirectBuffer: DeviceBuffer;
    stripCapacity?: number;
    particlePerStripCount?: number;
}

export class VFXStripGeometry extends GeometryElement {

    static StripVertexDecl: VertexDeclaration;

    static init() {
        VFXStripGeometry.StripVertexDecl = new VertexDeclaration(64, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),   // position
            new VertexElement(16, VertexElementFormat.Vector4, 1),  // color
            new VertexElement(32, VertexElementFormat.Vector2, 2),  // uv
            new VertexElement(48, VertexElementFormat.Vector3, 3),  // normal
        ]);
    }

    readonly capacity: number;
    indirectBuffer: DeviceBuffer;

    // 渲染混合模式，由 VFXRenderer 读取选择材质
    blendMode: string = "Alpha";

    bounds: Bounds = new Bounds(
        new Vector3(-10, -10, -10),
        new Vector3(10, 10, 10)
    );

    constructor(params: VFXStripGeometryParams) {
        super(MeshTopology.Triangles, DrawType.DrawElementIndirect);

        if (!VFXStripGeometry.StripVertexDecl) {
            VFXStripGeometry.init();
        }

        this.capacity = params.capacity;

        // 设置 vertexDeclaration（通过 VB3D setter 传播到底层 WebGPUVertexBuffer）
        const vb3d = params.stripVertexBuffer.vertexBuffer;
        vb3d.vertexDeclaration = VFXStripGeometry.StripVertexDecl;

        // Index buffer: per-strip fixed layout
        // Each strip has ppsc particles (ppsc-1 quads), total = stripCapacity * (ppsc-1) * 6 indices
        const stripCapacity = params.stripCapacity || 1;
        const ppsc = params.particlePerStripCount || params.capacity;
        const quadsPerStrip = ppsc - 1;
        const indexCount = stripCapacity * quadsPerStrip * 6;
        const indexData = new Uint32Array(indexCount);
        for (let s = 0; s < stripCapacity; s++) {
            const stripVertBase = s * ppsc * 2; // 2 vertices per particle
            for (let i = 0; i < quadsPerStrip; i++) {
                const idx = (s * quadsPerStrip + i) * 6;
                const v = stripVertBase + i * 2;
                indexData[idx + 0] = v;
                indexData[idx + 1] = v + 1;
                indexData[idx + 2] = v + 2;
                indexData[idx + 3] = v + 2;
                indexData[idx + 4] = v + 1;
                indexData[idx + 5] = v + 3;
            }
        }

        const indexBuffer = new IndexBuffer3D(
            IndexFormat.UInt32,
            indexCount,
            BufferUsage.Static
        );
        indexBuffer.setData(indexData);
        this.indexFormat = IndexFormat.UInt32;

        // 使用 VertexBuffer3D 调用 applyState
        // 引擎的 BufferState 会提取 vb3d._deviceBuffer (WebGPUVertexBuffer)
        // [VFX Fix] 在 laya.core.js 的 BufferState.applyState 中添加了安全检查：
        // 如果 WebGPUVertexBuffer 有 vertexDeclaration 但缺少 verteBufferLayout，强制调用 _getCacheInfo
        this.bufferState = new BufferState();
        this.bufferState.applyState([vb3d], indexBuffer);

        // Indirect buffer
        this.indirectBuffer = params.indirectBuffer;
        const indirectData = new Uint32Array(5);
        indirectData[0] = 0; // indexCount (set by compute shader)
        indirectData[1] = 1; // instanceCount (always 1 for strip)
        indirectData[2] = 0; // firstIndex
        indirectData[3] = 0; // vertexOffset
        indirectData[4] = 0; // firstInstance
        this.indirectBuffer.deviceBuffer.setData(indirectData.buffer, 0, 0, indirectData.byteLength);
    }

    _updateRenderParams(state: RenderContext3D): void {
        this.clearRenderParams();
        this._geometryElementOBj.setIndirectDrawBuffer(this.indirectBuffer.deviceBuffer, 0);
    }

    destroy(): void {
        super.destroy();
        this.clearRenderParams();
        this.indirectBuffer = null;
        this.bufferState?.destroy();
    }
}
