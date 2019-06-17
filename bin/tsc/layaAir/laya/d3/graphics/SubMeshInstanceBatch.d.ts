import { GeometryElement } from "../core/GeometryElement";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { VertexBuffer3D } from "././VertexBuffer3D";
/**
 * @private
 */
export declare class SubMeshInstanceBatch extends GeometryElement {
    /** @private */
    static instance: SubMeshInstanceBatch;
    /**
     * @private
     */
    static __init__(): void;
    /** @private */
    maxInstanceCount: number;
    /** @private */
    instanceWorldMatrixData: Float32Array;
    /** @private */
    instanceMVPMatrixData: Float32Array;
    /** @private */
    instanceWorldMatrixBuffer: VertexBuffer3D;
    /** @private */
    instanceMVPMatrixBuffer: VertexBuffer3D;
    /**
     * 创建一个 <code>InstanceSubMesh</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    _render(state: RenderContext3D): void;
}
