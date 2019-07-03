import { Vector3 } from "./Vector3";
import { Ray } from "./Ray";
import { IClone } from "../core/IClone";
/**
 * <code>BoundSphere</code> 类用于创建包围球。
 */
export declare class BoundSphere implements IClone {
    private static _tempVector3;
    /**包围球的中心。*/
    center: Vector3;
    /**包围球的半径。*/
    radius: number;
    /**
     * 创建一个 <code>BoundSphere</code> 实例。
     * @param	center 包围球的中心。
     * @param	radius 包围球的半径。
     */
    constructor(center: Vector3, radius: number);
    toDefault(): void;
    /**
     * 从顶点的子队列生成包围球。
     * @param	points 顶点的队列。
     * @param	start 顶点子队列的起始偏移。
     * @param	count 顶点子队列的顶点数。
     * @param	result 生成的包围球。
     */
    static createFromSubPoints(points: Vector3[], start: number, count: number, out: BoundSphere): void;
    /**
     * 从顶点队列生成包围球。
     * @param	points 顶点的队列。
     * @param	result 生成的包围球。
     */
    static createfromPoints(points: Vector3[], out: BoundSphere): void;
    /**
     * 判断射线是否与碰撞球交叉，并返回交叉距离。
     * @param	ray 射线。
     * @return 距离交叉点的距离，-1表示不交叉。
     */
    intersectsRayDistance(ray: Ray): number;
    /**
     * 判断射线是否与碰撞球交叉，并返回交叉点。
     * @param	ray  射线。
     * @param	outPoint 交叉点。
     * @return  距离交叉点的距离，-1表示不交叉。
     */
    intersectsRayPoint(ray: Ray, outPoint: Vector3): number;
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
