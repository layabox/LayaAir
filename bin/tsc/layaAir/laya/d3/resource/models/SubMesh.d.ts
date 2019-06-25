import { Mesh } from "././Mesh";
import { GeometryElement } from "../../core/GeometryElement";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
/**
 * <code>SubMesh</code> 类用于创建子网格数据模板。
 */
export declare class SubMesh extends GeometryElement {
    /** @private */
    private static _uniqueIDCounter;
    /**@private */
    private static _type;
    /** @private */
    _mesh: Mesh;
    /** @private */
    _boneIndicesList: Uint16Array[];
    /** @private */
    _subIndexBufferStart: number[];
    /** @private */
    _subIndexBufferCount: number[];
    /** @private */
    _skinAnimationDatas: Float32Array[];
    /** @private */
    _indexInMesh: number;
    /** @private */
    _vertexStart: number;
    /** @private */
    _indexStart: number;
    /** @private */
    _indexCount: number;
    /** @private */
    _indices: Uint16Array;
    /**@private [只读]*/
    _vertexBuffer: VertexBuffer3D;
    /**@private [只读]*/
    _indexBuffer: IndexBuffer3D;
    /** @private */
    _id: number;
    /**
     * 创建一个 <code>SubMesh</code> 实例。
     * @param	mesh  网格数据模板。
     */
    constructor(mesh: Mesh);
    /**
     * @inheritDoc
     */
    _getType(): number;
    /**
     * @inheritDoc
     */
    _render(state: RenderContext3D): void;
    /**
     * @private
     */
    getIndices(): Uint16Array;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
