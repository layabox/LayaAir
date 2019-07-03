import { GeometryElement } from "../../core/GeometryElement";
import { Mesh } from "./Mesh";
/**
 * <code>SubMesh</code> 类用于创建子网格数据模板。
 */
export declare class SubMesh extends GeometryElement {
    /**
     * 获取索引数量。
     */
    readonly indexCount: number;
    /**
     * 创建一个 <code>SubMesh</code> 实例。
     * @param	mesh  网格数据模板。
     */
    constructor(mesh: Mesh);
    /**
     * 拷贝并获取子网格索引数据的副本。
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
