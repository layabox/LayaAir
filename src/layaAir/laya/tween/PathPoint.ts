import { Vector3 } from "../maths/Vector3";
import { Pool } from "../utils/Pool";

export enum CurveType {
    /**
     * @en Curve type: Cardinal spline.
     * @zh 曲线类型：基数样条。
     */
    CRSpline,
    /**
     * @en Curve type: Bezier curve.
     * @zh 曲线类型：贝塞尔曲线。
     */
    Bezier,
    /**
     * @en Curve type: Cubic Bezier curve.
     * @zh 曲线类型：三次贝塞尔曲线。
     */
    CubicBezier,
    /**
     * @en Curve type: Straight line.
     * @zh 曲线类型：直线。
     */
    Straight
}

export class PathPoint {
    /**
     * @en Position.
     * @zh 位置。
     */
    pos: Vector3 = new Vector3();

    /**
     * @en Control point 1.
     * @zh 控制点1。
     */
    c1: Vector3 = new Vector3();

    /**
     * @en Control point 2.
     * @zh 控制点2。
     */
    c2: Vector3 = new Vector3();

    /**
     * @en Curve type.
     * @zh 曲线类型。
     */
    curve: CurveType = 0;

    /**
     * @en Create a cardinalspline curve point.
     * @zh 创建一个 PathPoint 的实例。
     */
    static create(x: number, y: number, z: number, curve?: number): PathPoint {
        let pt = pool.take();
        pt.pos.set(x, y, z);
        pt.curve = curve || 0;
        return pt;
    }

    /**
     * @en Recycle a PathPoint, make it available for reuse.
     * @zh 回收一个 PathPoint，将其置为可重用状态。
     */
    recover() {
        pool.recover(this);
    }

    /**
     * @en Clone a new PathPoint.
     * @returns A new instance of PathPoint.
     * @zh 克隆一个新的 PathPoint。
     * @returns PathPoint 实例。 
     */
    clone(): PathPoint {
        let pt = pool.take();
        this.pos.cloneTo(pt.pos);
        this.c1.cloneTo(pt.c1);
        this.c2.cloneTo(pt.c2);
        pt.curve = this.curve;
        return pt;
    }

    /**
     * @internal
     */
    _reset() {
        this.pos.set(0, 0, 0);
        this.c1.set(0, 0, 0);
        this.c2.set(0, 0, 0);
        this.curve = 0;
    }
}

const pool = Pool.createPool(PathPoint, null, e => e._reset());