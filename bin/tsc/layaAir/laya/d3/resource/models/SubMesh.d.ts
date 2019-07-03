import { GeometryElement } from "../../core/GeometryElement";
import { Mesh } from "./Mesh";
/**
 * <code>SubMesh</code> 类用于创建子网格数据模板。
 */
export declare class SubMesh extends GeometryElement {
    /**
     * 创建一个 <code>SubMesh</code> 实例。
     * @param	mesh  网格数据模板。
     */
    constructor(mesh: Mesh);
    /**
     * 获取索引数量。
     */
    getIndicesCount(): number;
    /**
     * 获取索引。
     * @param triangles 索引。
     */
    getIndices(): Uint16Array;
    /**
     * 设置子网格索引。
     * @param indices
     */
    setIndices(indices: Uint16Array): void;
    /**
     * {@inheritDoc GeometryElement.destroy}
     * @override
     */
    destroy(): void;
}
