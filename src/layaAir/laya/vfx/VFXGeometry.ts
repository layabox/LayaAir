import { GeometryElement } from "../d3/core/GeometryElement";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { DeviceBuffer } from "../d3/graphics/DeviceBuffer";
import { VertexBuffer3D } from "../d3/graphics/VertexBuffer3D";
import { Bounds } from "../d3/math/Bounds";
import { Mesh } from "../d3/resource/models/Mesh";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { VertexElement } from "../renders/VertexElement";
import { VertexElementFormat } from "../renders/VertexElementFormat";
import { BufferState } from "../webgl/utils/BufferState";

export class VFXGeometryParams {
    mesh: Mesh;
    capacity: number;
    particleBuffer: VertexBuffer3D;
    particleDeviceBuffer: DeviceBuffer;  // 用于获取底层 WebGPUVertexBuffer
    indirectBuffer: DeviceBuffer;
}

/**
 * 在对象自身属性中查找实现了 IVertexBuffer（具有 verteBufferLayout）的底层对象。
 * DeviceBuffer._vertexBuffer → WebGPUVertexBuffer（有 verteBufferLayout）
 * VertexBuffer3D._deviceBuffer → WebGPUVertexBuffer（有 verteBufferLayout）
 * Mesh._vertexBuffer._deviceBuffer → WebGPUVertexBuffer
 */
function findGpuVertexBuffer(...sources: any[]): any {
    for (const src of sources) {
        if (!src) continue;
        // 直接检查自身
        if ('verteBufferLayout' in src) return src;
        // 搜索自身属性
        for (const key of Object.getOwnPropertyNames(src)) {
            const val = (src as any)[key];
            if (val && typeof val === 'object' && 'verteBufferLayout' in val) {
                return val;
            }
        }
    }
    return sources[0];
}

export { findGpuVertexBuffer };

export class VFXGeometry extends GeometryElement {

    static ParticleDecl: VertexDeclaration;

    static init() {

        const particleAttris = [
            VertexElementFormat.Vector4, // position (xyz) + normalizedAge (w)
            VertexElementFormat.Vector4, // color (rgba)
            VertexElementFormat.Vector4, // rotation (combined quaternion xyzw)
            VertexElementFormat.Vector4, // scale (xyz) + texIndex (w)
            VertexElementFormat.Vector4, // pivot (xyz) + reserved (w)
        ];

        const createDecl = (attris: string[]) => {
            const vertexElements: VertexElement[] = [];
            let offset = 0;
            for (let i = 0; i < attris.length; i++) {
                const format = attris[i];
                const vertexElement = new VertexElement(offset, format, i + 8);
                vertexElements.push(vertexElement);

                switch (format) {
                    case VertexElementFormat.Vector4:
                        offset += 16;
                        break;
                    default:
                        throw "VFXGeometry: not support format.";
                }
            }
            return new VertexDeclaration(offset, vertexElements);
        }

        VFXGeometry.ParticleDecl = createDecl(particleAttris);
    }

    readonly capacity: number;

    indirectBuffer: DeviceBuffer;

    private _mesh: Mesh;

    // 保存 particle 实例顶点缓冲，供运行时 setMesh 重绑 bufferState（mesh 换、particle 实例缓冲不变）
    private _particleVertex: any = null;

    get mesh(): Mesh {
        return this._mesh;
    }

    bounds: Bounds = new Bounds(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5));

    // 渲染混合模式，由 VFXRenderer 读取覆盖材质 blend 状态
    blendMode: string = "Alpha";

    // 输出类型（"outputMesh" | "outputBillboard" | ...），用于 Renderer 选默认材质
    outputType: string = "outputMesh";

    // Soft Particle 淡出距离（0 = 关闭）
    softParticleFade: number = 0;

    // Flipbook UV 模式 + 图集尺寸
    uvMode: string = "Default";
    flipbookSize: Vector2 = new Vector2(4, 4);

    // Subpixel AA
    subpixelAA: boolean = false;

    // 自定义 Shader 名（空 = VFXUnlit）
    customShaderName: string = "";

    constructor(params: VFXGeometryParams) {
        super(MeshTopology.Triangles, DrawType.DrawElementIndirect);

        this.capacity = params.capacity;

        this._mesh = params.mesh;

        this.indexFormat = params.mesh.indexFormat;

        const particleVertex = params.particleBuffer;
        this._particleVertex = particleVertex;

        // 使用公开 API 访问 Mesh 的顶点/索引缓冲区（Mesh.vertexBuffer / indexBuffer）
        // 如公开 API 不可用则回退到私有属性（兼容旧引擎版本）
        const meshIndexBuffer = (params.mesh as any).indexBuffer ?? (params.mesh as any)._indexBuffer;
        const meshVertexBuffer = (params.mesh as any).vertexBuffer ?? (params.mesh as any)._vertexBuffer;

        // WebGPU BufferState.applyState 需要 IVertexBuffer（具有 verteBufferLayout / globalId）
        // meshVB: Mesh._vertexBuffer (VertexBuffer3D) → ._deviceBuffer 是 WebGPUVertexBuffer
        // particleVB: DeviceBuffer.vertexBuffer (VertexBuffer3D) → ._deviceBuffer 是 WebGPUDeviceBuffer（不对！）
        //   正确路径: DeviceBuffer._vertexBuffer → WebGPUVertexBuffer
        const meshGpuVB = findGpuVertexBuffer(meshVertexBuffer);
        const particleGpuVB = findGpuVertexBuffer(params.particleDeviceBuffer, particleVertex);

        // 确保底层 WebGPUVertexBuffer 的 vertexDeclaration 已设置（触发 verteBufferLayout 计算）
        // mesh VB 的 declaration 在 mesh 加载时已设置，但 particle VB（来自 DeviceBuffer）需要手动设置
        if (particleGpuVB && particleGpuVB !== particleVertex && 'vertexDeclaration' in particleGpuVB) {
            particleGpuVB.vertexDeclaration = VFXGeometry.ParticleDecl;
            particleGpuVB.instanceBuffer = true;
        }

        // 直接使用高层 VertexBuffer3D / IndexBuffer3D，让引擎的 BufferState 自行处理 WebGPU 转换
        this.bufferState = new BufferState();
        this.bufferState.applyState([meshVertexBuffer, particleVertex], meshIndexBuffer);

        this.indirectBuffer = params.indirectBuffer;
        const indirectData = new Uint32Array(5);
        indirectData[0] = meshIndexBuffer.indexCount; // indexCount
        indirectData[1] = 0; // instanceCount (set by output compute shader)
        indirectData[2] = 0; // firstIndex
        indirectData[3] = 0; // vertexOffset
        indirectData[4] = 0; // firstInstance
        this.indirectBuffer.deviceBuffer.setData(indirectData.buffer, 0, 0, indirectData.byteLength);
    }

    _updateRenderParams(state: RenderContext3D): void {
        this.clearRenderParams();

        this._geometryElementOBj.setIndirectDrawBuffer(this.indirectBuffer.deviceBuffer, 0);
    }

    /**
     * 运行时更换 mesh（VFX 组件级 Mesh 属性 override）。
     * 重绑新 mesh 的 GPU 顶点/索引缓冲到 bufferState（particle 实例缓冲不变），更新 indirect indexCount + indexFormat。
     * instanceCount 由 output compute shader 下一帧重写，故更换瞬间一帧不可见可接受。
     * 失败（新 mesh 无 VB/IB）时保持原 mesh 不变。
     */
    setMesh(mesh: Mesh): void {
        if (!mesh || mesh === this._mesh) return;
        const meshIndexBuffer = (mesh as any).indexBuffer ?? (mesh as any)._indexBuffer;
        const meshVertexBuffer = (mesh as any).vertexBuffer ?? (mesh as any)._vertexBuffer;
        if (!meshIndexBuffer || !meshVertexBuffer) {
            console.warn("[VFX] VFXGeometry.setMesh: 新 mesh 无 vertex/index buffer，跳过", mesh);
            return;
        }
        // 引用计数：新 mesh +1（防 GC），旧 mesh -1（释放占用）。destroy 会对当前 _mesh 再 -1。
        try { (mesh as any)._addReference?.(); } catch { }
        try { this._mesh?._removeReference?.(); } catch { }
        this._mesh = mesh;
        this.indexFormat = mesh.indexFormat;
        // 重绑 bufferState：新 mesh VB/IB + 原 particle 实例 VB
        const oldState = this.bufferState;
        this.bufferState = new BufferState();
        this.bufferState.applyState([meshVertexBuffer, this._particleVertex], meshIndexBuffer);
        try { oldState?.destroy(); } catch { }
        // 更新 indirect：indexCount 用新 mesh 的（instanceCount 由 output compute 下帧重写）
        const indirectData = new Uint32Array(5);
        indirectData[0] = meshIndexBuffer.indexCount;
        this.indirectBuffer.deviceBuffer.setData(indirectData.buffer, 0, 0, indirectData.byteLength);
    }

    destroy(): void {
        super.destroy();

        this.clearRenderParams();

        this.indirectBuffer = null;

        this._mesh._removeReference();

        this.bufferState?.destroy();
    }

}
