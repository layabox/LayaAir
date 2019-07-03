import { Vector3 } from "./Vector3";
import { IClone } from "../core/IClone";
/**
 * <code>BoundBox</code> 类用于创建包围盒。
 */
export declare class BoundBox implements IClone {
    /**最小顶点。*/
    min: Vector3;
    /**最大顶点。*/
    max: Vector3;
    /**
     * 创建一个 <code>BoundBox</code> 实例。
     * @param	min 包围盒的最小顶点。
     * @param	max 包围盒的最大顶点。
     */
    constructor(min: Vector3, max: Vector3);
    /**
     * 获取包围盒的8个角顶点。
     * @param	corners 返回顶点的输出队列。
     */
    getCorners(corners: Vector3[]): void;
    /**
     * 获取中心点。
     * @param	out
     */
    getCenter(out: Vector3): void;
    /**
     * 获取范围。
     * @param	out
     */
    getExtent(out: Vector3): void;
    /**
     * 设置中心点和范围。
     * @param	center
     */
    setCenterAndExtent(center: Vector3, extent: Vector3): void;
    toDefault(): void;
    /**
     * 从顶点生成包围盒。
     * @param	points 所需顶点队列。
     * @param	out 生成的包围盒。
     */
    static createfromPoints(points: Vector3[], out: BoundBox): void;
    /**
     * 合并两个包围盒。
     * @param	box1 包围盒1。
     * @param	box2 包围盒2。
     * @param	out 生成的包围盒。
     */
    static merge(box1: BoundBox, box2: BoundBox, out: BoundBox): void;
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
