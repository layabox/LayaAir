import { Mesh } from "../../../d3/resource/models/Mesh";
import { IColliderShape } from "./IColliderShape";

/**
 * @en Interface for mesh collider shape.
 * @zh 网格碰撞器的接口。
 */
export interface IMeshColliderShape extends IColliderShape {

    /**
     * @en Create physics mesh from regular Mesh.
     * @param value The source Mesh to create physics mesh from
     * @zh 从常规网格创建物理网格。
     * @param value 用于创建物理网格的源网格
     */
    setPhysicsMeshFromMesh(value: Mesh): void;

    /**
     * @en Set convex mesh for the collider shape.
     * @param value The convex Mesh to set
     * @zh 为碰撞器形状设置凸多边形网格。
     * @param value 要设置的凸多边形网格
     */
    setConvexMesh(value: Mesh): void;

    /**
     * @en Set the vertex limit for mesh simplification.
     * @param limit The maximum number of vertices allowed
     * @zh 设置网格简化的顶点限制。
     * @param limit 允许的最大顶点数
     */
    setLimitVertex(limit: number): void;
}