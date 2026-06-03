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
 * VFXLineGeometry — Output Line 渲染几何
 *
 * 每个粒子 2 vertices（line segment），每 vertex 4 vec4 (64 bytes)：
 *   [0] xyz=position, w=1
 *   [1] rgba=color
 *   [2] xy=uv, zw=0
 *   [3] xyz=normal, w=0
 *
 * 使用 MeshTopology.Lines + DrawArrayIndirect
 */

export class VFXLineGeometryParams {
    capacity: number;
    renderBuffer: DeviceBuffer;
    indirectBuffer: DeviceBuffer;
}

export class VFXLineGeometry extends GeometryElement {
    static LineVertexDecl: VertexDeclaration;

    static init() {
        VFXLineGeometry.LineVertexDecl = new VertexDeclaration(64, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),  // position
            new VertexElement(16, VertexElementFormat.Vector4, 1), // color
            new VertexElement(32, VertexElementFormat.Vector2, 2), // uv
            new VertexElement(48, VertexElementFormat.Vector3, 3), // normal
        ]);
    }

    readonly capacity: number;
    indirectBuffer: DeviceBuffer;

    blendMode: string = "Alpha";
    outputType: string = "outputLine";
    softParticleFade: number = 0;

    bounds: Bounds = new Bounds(
        new Vector3(-10, -10, -10),
        new Vector3(10, 10, 10)
    );

    constructor(params: VFXLineGeometryParams) {
        super(MeshTopology.Lines, DrawType.DrawArrayIndirect);

        if (!VFXLineGeometry.LineVertexDecl) {
            VFXLineGeometry.init();
        }

        this.capacity = params.capacity;

        const vb3d = params.renderBuffer.vertexBuffer;
        vb3d.vertexDeclaration = VFXLineGeometry.LineVertexDecl;

        this.bufferState = new BufferState();
        this.bufferState.applyState([vb3d], null);

        this.indirectBuffer = params.indirectBuffer;
        const indirectData = new Uint32Array(5);
        indirectData[0] = 0; // vertexCount (set by Line compute shader each frame)
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
