import { GeometryElement } from "../core/GeometryElement";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { IndexBuffer3D } from "././IndexBuffer3D";
import { VertexBuffer3D } from "././VertexBuffer3D";
/**
 * @private
 * <code>SubMeshDynamicBatch</code> 类用于网格动态合并。
 */
export declare class SubMeshDynamicBatch extends GeometryElement {
    /** @private
     * //MI6 (微信) 大于12个顶点微小提升
     * //MI6 (QQ浏览器8.2 X5内核038230GPU-UU) 大于12个顶点微小提升
     * //MI6 (chrome63) 大于10个顶点微小提升
     * //IPHONE7PLUS  IOS11 微信 大于12个顶点微小提升
     * //IPHONE5s  IOS8 微信 大于12仍有较大提升
     */
    static maxAllowVertexCount: number;
    /** @private */
    static maxAllowAttribueCount: number;
    /** @private */
    static maxIndicesCount: number;
    /** @private */
    static instance: SubMeshDynamicBatch;
    /**
    * @private
    */
    static __init__(): void;
    /**@private */
    private _vertices;
    /**@private */
    private _indices;
    /**@private */
    private _positionOffset;
    /**@private */
    private _normalOffset;
    /**@private */
    private _colorOffset;
    /**@private */
    private _uv0Offset;
    /**@private */
    private _uv1Offset;
    /**@private */
    private _sTangentOffset;
    /**@private */
    _vertexBuffer: VertexBuffer3D;
    /**@private */
    _indexBuffer: IndexBuffer3D;
    /** @private */
    private _bufferState;
    /**
     * 创建一个 <code>SubMeshDynamicBatch</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _getBatchVertices;
    /**
     * @private
     */
    private _getBatchIndices;
    /**
     * @private
     */
    private _flush;
    /**
     * @inheritDoc
     */
    _prepareRender(state: RenderContext3D): boolean;
    /**
     * @inheritDoc
     */
    _render(context: RenderContext3D): void;
}
