import { BoundBox } from "../../math/BoundBox";
import { Ray } from "../../math/Ray";
import { Vector3 } from "../../math/Vector3";
import { RenderContext3D } from "../render/RenderContext3D";
import { IOctreeObject } from "./IOctreeObject";
import { BoundsOctree } from "./BoundsOctree";
import { Shader3D } from "../../shader/Shader3D";
/**
 * <code>BoundsOctreeNode</code> 类用于创建八叉树节点。
 */
export declare class BoundsOctreeNode {
    /**
     * 创建一个 <code>BoundsOctreeNode</code> 实例。
     * @param octree  所属八叉树。
     * @param parent  父节点。
     * @param baseLength  节点基本长度。
     * @param center  节点的中心位置。
     */
    constructor(octree: BoundsOctree, parent: BoundsOctreeNode, baseLength: number, center: Vector3);
    /**
     * 添加指定物体。
     * @param	object 指定物体。
     */
    add(object: IOctreeObject): boolean;
    /**
     * 移除指定物体。
     * @param	obejct 指定物体。
     * @return 是否成功。
     */
    remove(object: IOctreeObject): boolean;
    /**
     * 更新制定物体，
     * @param	obejct 指定物体。
     * @return 是否成功。
     */
    update(object: IOctreeObject): boolean;
    /**
     * 	收缩八叉树节点。
     *	-所有物体都在根节点的八分之一区域
     * 	-该节点无子节点或有子节点但1/8的子节点不包含物体
     *	@param minLength 最小尺寸。
     * 	@return 新的根节点。
     */
    shrinkIfPossible(minLength: number): BoundsOctreeNode;
    /**
     * 检查该节点和其子节点是否包含任意物体。
     * @return 是否包含任意物体。
     */
    hasAnyObjects(): boolean;
    /**
     * 获取与指定包围盒相交的物体列表。
     * @param checkBound AABB包围盒。
     * @param result 相交物体列表
     */
    getCollidingWithBoundBox(checkBound: BoundBox, result: any[]): void;
    /**
     *	获取与指定射线相交的的物理列表。
     * 	@param	ray 射线。
     * 	@param	result 相交物体列表。
     * 	@param	maxDistance 射线的最大距离。
     */
    getCollidingWithRay(ray: Ray, result: any[], maxDistance?: number): void;
    /**
     *	获取与指定视锥相交的的物理列表。
     * 	@param	ray 射线。.
     * 	@param	result 相交物体列表。
     */
    getCollidingWithFrustum(context: RenderContext3D, customShader: Shader3D, replacementTag: string): void;
    /**
     * 获取是否与指定包围盒相交。
     * @param checkBound AABB包围盒。
     * @return 是否相交。
     */
    isCollidingWithBoundBox(checkBound: BoundBox): boolean;
    /**
     *	获取是否与指定射线相交。
     * 	@param	ray 射线。
     * 	@param	maxDistance 射线的最大距离。
     *  @return 是否相交。
     */
    isCollidingWithRay(ray: Ray, maxDistance?: number): boolean;
    /**
     * 获取包围盒。
     */
    getBound(): BoundBox;
}
