import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { SubMesh } from "../../resource/models/SubMesh";
import { GeometryElement } from "../GeometryElement";
import { Transform3D } from "../Transform3D";
import { RenderContext3D } from "././RenderContext3D";
import { RenderElement } from "././RenderElement";
import { RenderQueue } from "././RenderQueue";
/**
 * @private
 */
export declare class SubMeshRenderElement extends RenderElement {
    /** @private */
    private _dynamicWorldPositionNormalNeedUpdate;
    /** @private */
    _dynamicVertexBatch: boolean;
    /** @private */
    _dynamicMultiSubMesh: boolean;
    /** @private */
    _dynamicVertexCount: number;
    /** @private */
    _dynamicWorldPositions: Float32Array;
    /** @private */
    _dynamicWorldNormals: Float32Array;
    /** @private */
    staticBatchIndexStart: number;
    /** @private */
    staticBatchIndexEnd: number;
    /** @private */
    staticBatchElementList: SubMeshRenderElement[];
    /** @private */
    instanceSubMesh: SubMesh;
    /** @private */
    instanceBatchElementList: SubMeshRenderElement[];
    /** @private */
    vertexBatchElementList: SubMeshRenderElement[];
    /** @private */
    vertexBatchVertexDeclaration: VertexDeclaration;
    /**
     * 创建一个 <code>SubMeshRenderElement</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _onWorldMatrixChanged;
    /**
     * @inheritDoc
     */
    _computeWorldPositionsAndNormals(positionOffset: number, normalOffset: number, multiSubMesh: boolean, vertexCount: number): void;
    /**
     * @inheritDoc
     */
    setTransform(transform: Transform3D): void;
    /**
     * @inheritDoc
     */
    setGeometry(geometry: GeometryElement): void;
    /**
     * @inheritDoc
     */
    addToOpaqueRenderQueue(context: RenderContext3D, queue: RenderQueue): void;
    /**
     * @inheritDoc
     */
    addToTransparentRenderQueue(context: RenderContext3D, queue: RenderQueue): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
