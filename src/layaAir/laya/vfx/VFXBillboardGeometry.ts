import { GeometryElement } from "../d3/core/GeometryElement";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { DeviceBuffer } from "../d3/graphics/DeviceBuffer";
import { VertexBuffer3D } from "../d3/graphics/VertexBuffer3D";
import { Bounds } from "../d3/math/Bounds";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { VertexElement } from "../renders/VertexElement";
import { VertexElementFormat } from "../renders/VertexElementFormat";
import { BufferState } from "../webgl/utils/BufferState";
/**
 * VFXBillboardGeometry — 对齐 Unity VFXPlanarPrimitiveOutput
 *
 * Procedural billboard 渲染：不依赖 mesh 资源，vertex shader 根据 gl_VertexID
 * 生成 Quad(6)/Triangle(3)/Octagon(18) 的顶点。配合 per-particle instance buffer。
 *
 * 每粒子 1 instance，每 instance 生成 vertexCount 个顶点。
 * 使用 DrawArrayIndirect：[vertexCount, instanceCount, firstVertex, firstInstance]
 *  - vertexCount: 编译时固定（Quad=6 / Triangle=3 / Octagon=18）
 *  - instanceCount: output compute shader 原子累加（offset 4）
 */

export class VFXBillboardGeometryParams {
    capacity: number;
    /** 每 instance 的顶点数（Quad=6, Triangle=3, Octagon=18）*/
    vertexCount: number;
    particleBuffer: VertexBuffer3D;
    particleDeviceBuffer: DeviceBuffer;
    indirectBuffer: DeviceBuffer;
}

export class VFXBillboardGeometry extends GeometryElement {

    static ParticleDecl: VertexDeclaration;

    static init() {
        // 和 VFXGeometry.ParticleDecl 完全一致（共用 particle attribute 布局）
        const vertexElements: VertexElement[] = [];
        let offset = 0;
        for (let i = 0; i < 5; i++) {
            vertexElements.push(new VertexElement(offset, VertexElementFormat.Vector4, i + 8));
            offset += 16;
        }
        VFXBillboardGeometry.ParticleDecl = new VertexDeclaration(offset, vertexElements);
    }

    readonly capacity: number;
    indirectBuffer: DeviceBuffer;

    bounds: Bounds = new Bounds(new Vector3(-10, -10, -10), new Vector3(10, 10, 10));

    blendMode: string = "Alpha";
    outputType: string = "outputBillboard";
    softParticleFade: number = 0;
    uvMode: string = "Default";
    flipbookSize: Vector2 = new Vector2(4, 4);
    /** Atlas 模式专属资源，VFXRenderer 加载后设到 BillboardMaterial.u_AlbedoTexture */
    mainTexture: string = "";
    subpixelAA: boolean = false;
    customShaderName: string = "";

    /** Primitive 类型：Quad / Triangle / Octagon */
    primitive: string = "Quad";
    /** Octagon 裁角因子 [0, 0.5]，0=方形 / 0.146=正八边形 / 0.5=圆形 */
    cropFactor: number = 0.146;

    constructor(params: VFXBillboardGeometryParams) {
        // DrawArrayIndirect：无 index buffer，vertex shader 用 gl_VertexID 生成顶点
        super(MeshTopology.Triangles, DrawType.DrawArrayIndirect);

        if (!VFXBillboardGeometry.ParticleDecl) {
            VFXBillboardGeometry.init();
        }

        this.capacity = params.capacity;

        const particleVertex = params.particleBuffer;

        // 复用 VFXGeometry 的 findGpuVertexBuffer 思路（params 中 particleDeviceBuffer 可能承载底层 GpuVB）
        const particleGpuVB: any = (() => {
            for (const src of [params.particleDeviceBuffer, particleVertex]) {
                if (!src) continue;
                if ('verteBufferLayout' in src) return src;
                for (const key of Object.getOwnPropertyNames(src)) {
                    const val = (src as any)[key];
                    if (val && typeof val === 'object' && 'verteBufferLayout' in val) return val;
                }
            }
            return particleVertex;
        })();
        if (particleGpuVB && particleGpuVB !== particleVertex && 'vertexDeclaration' in particleGpuVB) {
            particleGpuVB.vertexDeclaration = VFXBillboardGeometry.ParticleDecl;
            particleGpuVB.instanceBuffer = true;
        }

        // 只绑 instance buffer，index buffer 传 null（procedural draw）
        this.bufferState = new BufferState();
        this.bufferState.applyState([particleVertex], null);

        this.indirectBuffer = params.indirectBuffer;
        // DrawArrayIndirect: [vertexCount, instanceCount, firstVertex, firstInstance]
        // vertexCount 编译时固定，output compute shader 原子累加 instanceCount (offset 4)
        const indirectData = new Uint32Array(5);
        indirectData[0] = params.vertexCount;  // vertexCount 固定
        indirectData[1] = 0;                    // instanceCount（compute 写）
        indirectData[2] = 0;                    // firstVertex
        indirectData[3] = 0;                    // firstInstance
        indirectData[4] = 0;                    // reserved
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
