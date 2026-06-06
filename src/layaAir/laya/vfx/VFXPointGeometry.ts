import { GeometryElement } from "../d3/core/GeometryElement";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { DeviceBuffer } from "../d3/graphics/DeviceBuffer";
import { Bounds } from "../d3/math/Bounds";
import { Vector3 } from "../maths/Vector3";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { VertexElement } from "../renders/VertexElement";
import { VertexElementFormat } from "../renders/VertexElementFormat";
import { BufferState } from "../webgl/utils/BufferState";
/**
 * VFXPointGeometry — Output Point 渲染几何
 *
 * 每个粒子 1 vertex，3 vec4 (48 bytes)：
 *   [0] xyz=position, w=pointSize
 *   [1] rgba=color
 *   [2] xy=uv, zw=0
 *
 * 使用 MeshTopology.Points + DrawArrayIndirect
 */

export class VFXPointGeometryParams {
    capacity: number;
    renderBuffer: DeviceBuffer;
    indirectBuffer: DeviceBuffer;
}

export class VFXPointGeometry extends GeometryElement {
    static PointVertexDecl: VertexDeclaration;

    static init() {
        VFXPointGeometry.PointVertexDecl = new VertexDeclaration(48, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),  // position + size
            new VertexElement(16, VertexElementFormat.Vector4, 1), // color
            new VertexElement(32, VertexElementFormat.Vector2, 2), // uv
        ]);
    }

    readonly capacity: number;
    indirectBuffer: DeviceBuffer;

    blendMode: string = "Alpha";
    outputType: string = "outputPoint";
    softParticleFade: number = 0;

    bounds: Bounds = new Bounds(
        new Vector3(-10, -10, -10),
        new Vector3(10, 10, 10)
    );

    constructor(params: VFXPointGeometryParams) {
        super(MeshTopology.Points, DrawType.DrawArrayIndirect);

        if (!VFXPointGeometry.PointVertexDecl) {
            VFXPointGeometry.init();
        }

        this.capacity = params.capacity;

        const vb3d = params.renderBuffer.vertexBuffer;
        vb3d.vertexDeclaration = VFXPointGeometry.PointVertexDecl;

        this.bufferState = new BufferState();
        this.bufferState.applyState([vb3d], null);

        this.indirectBuffer = params.indirectBuffer;
        // DrawArrayIndirect: [vertexCount, instanceCount, firstVertex, firstInstance]
        const indirectData = new Uint32Array(5);
        indirectData[0] = 0; // vertexCount (set by Point compute shader each frame)
        indirectData[1] = 1; // instanceCount
        indirectData[2] = 0; // firstVertex
        indirectData[3] = 0; // firstInstance
        indirectData[4] = 0; // reserved
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
