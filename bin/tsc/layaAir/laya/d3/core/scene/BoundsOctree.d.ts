import { IOctreeObject } from "./IOctreeObject";
import { RenderContext3D } from "../render/RenderContext3D";
import { BoundBox } from "../../math/BoundBox";
import { Ray } from "../../math/Ray";
import { Vector3 } from "../../math/Vector3";
import { Shader3D } from "../../shader/Shader3D";
/**
 * <code>BoundsOctree</code> 类用于创建八叉树。
 */
export declare class BoundsOctree {
    /**
     * 创建一个 <code>BoundsOctree</code> 实例。
     * @param	initialWorldSize 八叉树尺寸
     * @param	initialWorldPos 八叉树中心
     * @param	minNodeSize  节点最小尺寸
     * @param	loosenessVal 松散值
     */
    constructor(initialWorldSize: number, initialWorldPos: Vector3, minNodeSize: number, looseness: number);
    /**
     * 添加物体
     * @param	object
     */
    add(object: IOctreeObject): void;
    /**
     * 移除物体
     * @return 是否成功
     */
    remove(object: IOctreeObject): boolean;
    /**
     * 更新物体
     */
    update(object: IOctreeObject): boolean;
    /**
     * 如果可能则收缩根节点。
     */
    shrinkRootIfPossible(): void;
    /**
     * 添加运动物体。
     * @param 运动物体。
     */
    addMotionObject(object: IOctreeObject): void;
    /**
     * 移除运动物体。
     * @param 运动物体。
     */
    removeMotionObject(object: IOctreeObject): void;
    /**
     * 更新所有运动物体。
     */
    updateMotionObjects(): void;
    /**
     * 获取是否与指定包围盒相交。
     * @param checkBound AABB包围盒。
     * @return 是否相交。
     */
    isCollidingWithBoundBox(checkBounds: BoundBox): boolean;
    /**
     *	获取是否与指定射线相交。
     * 	@param	ray 射线。
     * 	@param	maxDistance 射线的最大距离。
     *  @return 是否相交。
     */
    isCollidingWithRay(ray: Ray, maxDistance?: number): boolean;
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
     *  @param 渲染上下文。
     */
    getCollidingWithFrustum(context: RenderContext3D, shader: Shader3D, replacementTag: string): void;
    /**
     * 获取最大包围盒
     * @return 最大包围盒
     */
    getMaxBounds(): BoundBox;
}
