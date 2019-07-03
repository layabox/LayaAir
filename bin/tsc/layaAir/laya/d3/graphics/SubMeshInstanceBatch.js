import { LayaGL } from "../../layagl/LayaGL";
import { Stat } from "../../utils/Stat";
import { GeometryElement } from "../core/GeometryElement";
import { VertexBuffer3D } from "./VertexBuffer3D";
import { VertexMesh } from "./Vertex/VertexMesh";
/**
 * @internal
 */
export class SubMeshInstanceBatch extends GeometryElement {
    /**
     * 创建一个 <code>InstanceSubMesh</code> 实例。
     */
    constructor() {
        super();
        /** @internal */
        this.maxInstanceCount = 1024;
        /** @internal */
        this.instanceWorldMatrixData = new Float32Array(this.maxInstanceCount * 16);
        /** @internal */
        this.instanceMVPMatrixData = new Float32Array(this.maxInstanceCount * 16);
        /** @internal */
        this.instanceWorldMatrixBuffer = new VertexBuffer3D(this.instanceWorldMatrixData.length * 4, WebGL2RenderingContext.DYNAMIC_DRAW);
        /** @internal */
        this.instanceMVPMatrixBuffer = new VertexBuffer3D(this.instanceMVPMatrixData.length * 4, WebGL2RenderingContext.DYNAMIC_DRAW);
        this.instanceWorldMatrixBuffer.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
        this.instanceMVPMatrixBuffer.vertexDeclaration = VertexMesh.instanceMVPMatrixDeclaration;
    }
    /**
     * @internal
     */
    static __init__() {
        SubMeshInstanceBatch.instance = new SubMeshInstanceBatch();
    }
    /**
     * @inheritDoc
     */
    /*override*/ _render(state) {
        var element = state.renderElement;
        var subMesh = element.instanceSubMesh;
        var count = element.instanceBatchElementList.length;
        var indexCount = subMesh._indexCount;
        subMesh._mesh._instanceBufferState.bind();
        LayaGL.layaGPUInstance.drawElementsInstanced(WebGL2RenderingContext.TRIANGLES, indexCount, WebGL2RenderingContext.UNSIGNED_SHORT, subMesh._indexStart * 2, count);
        Stat.renderBatches++;
        Stat.savedRenderBatches += count - 1;
        Stat.trianglesFaces += indexCount * count / 3;
    }
}
