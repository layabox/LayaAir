import { LayaGL } from "laya/layagl/LayaGL";
import { Stat } from "laya/utils/Stat";
import { WebGLContext } from "laya/webgl/WebGLContext";
import { GeometryElement } from "../core/GeometryElement";
import { VertexBuffer3D } from "././VertexBuffer3D";
import { VertexMesh } from "./Vertex/VertexMesh";
/**
 * @private
 */
export class SubMeshInstanceBatch extends GeometryElement {
    /**
     * 创建一个 <code>InstanceSubMesh</code> 实例。
     */
    constructor() {
        super();
        /** @private */
        this.maxInstanceCount = 1024;
        /** @private */
        this.instanceWorldMatrixData = new Float32Array(this.maxInstanceCount * 16);
        /** @private */
        this.instanceMVPMatrixData = new Float32Array(this.maxInstanceCount * 16);
        /** @private */
        this.instanceWorldMatrixBuffer = new VertexBuffer3D(this.instanceWorldMatrixData.length * 4, WebGLContext.DYNAMIC_DRAW);
        /** @private */
        this.instanceMVPMatrixBuffer = new VertexBuffer3D(this.instanceMVPMatrixData.length * 4, WebGLContext.DYNAMIC_DRAW);
        this.instanceWorldMatrixBuffer.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
        this.instanceMVPMatrixBuffer.vertexDeclaration = VertexMesh.instanceMVPMatrixDeclaration;
    }
    /**
     * @private
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
        LayaGL.layaGPUInstance.drawElementsInstanced(WebGLContext.TRIANGLES, indexCount, WebGLContext.UNSIGNED_SHORT, subMesh._indexStart * 2, count);
        Stat.renderBatches++;
        Stat.savedRenderBatches += count - 1;
        Stat.trianglesFaces += indexCount * count / 3;
    }
}
