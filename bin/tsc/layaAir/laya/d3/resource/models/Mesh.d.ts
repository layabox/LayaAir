import { Resource } from "../../../resource/Resource";
import { Handler } from "../../../utils/Handler";
import { Bounds } from "../../core/Bounds";
import { IClone } from "../../core/IClone";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { Color } from "../../math/Color";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { SubMesh } from "./SubMesh";
/**
 * <code>Mesh</code> 类用于创建文件网格数据模板。
 */
export declare class Mesh extends Resource implements IClone {
    /**Mesh资源。*/
    static MESH: string;
    /**
     * 加载网格模板。
     * @param url 模板地址。
     * @param complete 完成回掉。
     */
    static load(url: string, complete: Handler): void;
    /**
     * 获取网格的全局默认绑定动作逆矩阵。
     * @return  网格的全局默认绑定动作逆矩阵。
     */
    readonly inverseAbsoluteBindPoses: Matrix4x4[];
    /**
     * 获取顶点个数。
     */
    readonly vertexCount: number;
    /**
     * 获取索引个数。
     */
    readonly indexCount: number;
    /**
     * 获取SubMesh的个数。
     * @return SubMesh的个数。
     */
    readonly subMeshCount: number;
    /**
     * 边界。
     */
    bounds: Bounds;
    /**
     * 创建一个 <code>Mesh</code> 实例,禁止使用。
     * @param isReadable 是否可读。
     */
    constructor(isReadable?: boolean);
    /**
     * @inheritDoc
     * @override
     */
    protected _disposeResource(): void;
    /**
     * 根据获取子网格。
     * @param index 索引。
     */
    getSubMesh(index: number): SubMesh;
    /**
     * 拷贝并填充位置数据至数组。
     * @param positions 位置数组。
     * @remark 该方法为拷贝操作，比较耗费性能。
     */
    getPositions(positions: Vector3[]): void;
    /**
     * 设置位置数据。
     * @param positions 位置。
     */
    setPositions(positions: Vector3[]): void;
    /**
     * 拷贝并填充颜色数据至数组。
     * @param colors 颜色数组。
     * @remark 该方法为拷贝操作，比较耗费性能。
     */
    getColors(colors: Color[]): void;
    /**
     * 设置颜色数据。
     * @param colors  颜色。
     */
    setColors(colors: Color[]): void;
    /**
     * 拷贝并填充纹理坐标数据至数组。
     * @param uvs 纹理坐标数组。
     * @param channel 纹理坐标通道。
     * @remark 该方法为拷贝操作，比较耗费性能。
     */
    getUVs(uvs: Vector2[], channel?: number): void;
    /**
     * 设置纹理坐标数据。
     * @param uvs 纹理坐标。
     * @param channel 纹理坐标通道。
     */
    setUVs(uvs: Vector2[], channel?: number): void;
    /**
     * 拷贝并填充法线数据至数组。
     * @param normals 法线数组。
     * @remark 该方法为拷贝操作，比较耗费性能。
     */
    getNormals(normals: Vector3[]): void;
    /**
     * 设置法线数据。
     * @param normals 法线。
     */
    setNormals(normals: Vector3[]): void;
    /**
     * 拷贝并填充切线数据至数组。
     * @param tangents 切线。
     */
    getTangents(tangents: Vector4[]): void;
    /**
     * 设置切线数据。
     * @param tangents 切线。
     */
    setTangents(tangents: Vector4[]): void;
    /**
    * 获取骨骼权重。
    * @param boneWeights 骨骼权重。
    */
    getBoneWeights(boneWeights: Vector4[]): void;
    /**
    * 拷贝并填充骨骼权重数据至数组。
    * @param boneWeights 骨骼权重。
    */
    setBoneWeights(boneWeights: Vector4[]): void;
    /**
    * 获取骨骼索引。
    * @param boneIndices 骨骼索引。
    */
    getBoneIndices(boneIndices: Vector4[]): void;
    /**
    * 拷贝并填充骨骼索引数据至数组。
    * @param boneWeights 骨骼索引。
    */
    setBoneIndices(boneIndices: Vector4[]): void;
    /**
     * 将Mesh标记为不可读,可减少内存，标记后不可再调用相关读取方法。
     */
    markAsUnreadbale(): void;
    /**
     * 获取顶点声明。
     */
    getVertexDeclaration(): VertexDeclaration;
    /**
    * 拷贝并获取顶点数据的副本。
    * @return 顶点数据。
    */
    getVertices(): ArrayBuffer;
    /**
    * 设置顶点数据。
    * @param vertices 顶点数据。
    */
    setVertices(vertices: ArrayBuffer): void;
    /**
     * 拷贝并获取网格索引数据的副本。
     */
    getIndices(): Uint16Array;
    /**
     * 设置网格索引。
     * @param indices
     */
    setIndices(indices: Uint16Array): void;
    /**
     * 从模型位置数据生成包围盒。
     */
    calculateBounds(): void;
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
