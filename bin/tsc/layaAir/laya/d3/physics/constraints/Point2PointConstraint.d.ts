import { Vector3 } from "../../math/Vector3";
/**
 * <code>Point2PointConstraint</code> 类用于创建物理组件的父类。
 */
export declare class Point2PointConstraint {
    pivotInA: Vector3;
    pivotInB: Vector3;
    damping: number;
    impulseClamp: number;
    tau: number;
    /**
     * 创建一个 <code>Point2PointConstraint</code> 实例。
     */
    constructor();
}
