import { Resource } from "../../../resource/Resource";
import { Bounds } from "../../core/Bounds";
import { BufferState } from "../../core/BufferState";
import { GeometryElement } from "../../core/GeometryElement";
import { IClone } from "../../core/IClone";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { SubMesh } from "././SubMesh";
import { Handler } from "../../../utils/Handler";
/**
 * <code>Mesh</code> 类用于创建文件网格数据模板。
 */
export declare class Mesh extends Resource implements IClone {
    /**Mesh资源。*/
    static MESH: string;
    /** @private */
    private _tempVector30;
    /** @private */
    private _tempVector31;
    /** @private */
    private _tempVector32;
    /** @private */
    private static _nativeTempVector30;
    /** @private */
    private static _nativeTempVector31;
    /** @private */
    private static _nativeTempVector32;
    /**
    * @private
    */
    static __init__(): void;
    /**
     *@private
     */
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): Mesh;
    /**
     * 加载网格模板。
     * @param url 模板地址。
     * @param complete 完成回掉。
     */
    static load(url: string, complete: Handler): void;
    /** @private */
    private _nativeTriangleMesh;
    /** @private */
    protected _bounds: Bounds;
    /** @private */
    _bufferState: BufferState;
    /** @private */
    _instanceBufferState: BufferState;
    /** @private */
    _subMeshCount: number;
    /** @private */
    _subMeshes: SubMesh[];
    /** @private */
    _vertexBuffers: VertexBuffer3D[];
    /** @private */
    _indexBuffer: IndexBuffer3D;
    /** @private */
    _boneNames: string[];
    /** @private */
    _inverseBindPoses: Matrix4x4[];
    /** @private */
    _inverseBindPosesBuffer: ArrayBuffer;
    /** @private */
    _bindPoseIndices: Uint16Array;
    /** @private */
    _skinDataPathMarks: any[][];
    /** @private */
    _vertexCount: number;
    /**
     * 获取网格的全局默认绑定动作逆矩阵。
     * @return  网格的全局默认绑定动作逆矩阵。
     */
    readonly inverseAbsoluteBindPoses: Matrix4x4[];
    /**
     * 获取顶点个数
     */
    readonly vertexCount: number;
    /**
     * 获取SubMesh的个数。
     * @return SubMesh的个数。
     */
    readonly subMeshCount: number;
    /**
     * 获取边界
     * @return 边界。
     */
    readonly bounds: Bounds;
    /**
     * 创建一个 <code>Mesh</code> 实例,禁止使用。
     * @param url 文件地址。
     */
    constructor();
    /**
     * @private
     */
    private _getPositionElement;
    /**
     * @private
     */
    private _generateBoundingObject;
    /**
     *@private
     */
    _setSubMeshes(subMeshes: SubMesh[]): void;
    /**
     * @inheritDoc
     */
    _getSubMesh(index: number): GeometryElement;
    /**
     * @private
     */
    _setBuffer(vertexBuffers: VertexBuffer3D[], indexBuffer: IndexBuffer3D): void;
    /**
     * @inheritDoc
     */
    protected _disposeResource(): void;
    /**
     * @private
     */
    _getPhysicMesh(): any;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
