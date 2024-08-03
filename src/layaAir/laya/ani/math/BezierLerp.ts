import { Bezier } from "../../maths/Bezier";

/**
 * @internal
 * @en A utility class for Bezier curve interpolation with caching mechanism.
 * @zh 贝塞尔曲线插值的工具类，带有缓存机制。
 */
export class BezierLerp {

    constructor() {

    }
    /**
     * @internal
     * @en Cache for bezier interpolation results.
     * @zh 贝塞尔插值结果的缓存。
     */
    private static _bezierResultCache: any = {};
    /**
     * @internal
     * @en Cache for bezier curve control points.
     * @zh 贝塞尔曲线控制点的缓存。
     */
    private static _bezierPointsCache: any = {};

    //TODO:coverage
    /**
     * @en Get the interpolated y-value on a special cubic Bezier curve at a given progress t.
     * This curve is defined with fixed start point P0(0,0) and end point P3(1,1), commonly used for easing functions in animations.
     * @param t The progress parameter, between 0 and 1, where 0 represents the start of the curve and 1 represents the end.
     * @param px0 X-coordinate of the first control point P1.
     * @param py0 Y-coordinate of the first control point P1.
     * @param px1 X-coordinate of the second control point P2.
     * @param py1 Y-coordinate of the second control point P2.
     * @returns The interpolated y-value at the given progress t. This value represents the state of an animated property at that point in the animation.
     * If t is greater than the x-coordinate of all sampled points, it returns 1.
     * @zh 获取特殊三次贝塞尔曲线在给定进度 t 的插值 y 值。
     * 这条曲线的起点 P0 固定为 (0,0)，终点 P3 固定为 (1,1)，通常用于定义动画的缓动函数。
     * @param t 进度参数，在 0 到 1 之间，其中 0 表示曲线的起点，1 表示曲线的终点。
     * @param px0 第一个控制点 P1 的 X 坐标。
     * @param py0 第一个控制点 P1 的 Y 坐标。
     * @param px1 第二个控制点 P2 的 X 坐标。
     * @param py1 第二个控制点 P2 的 Y 坐标。
     * @returns 在给定进度 t 的插值 y 值。这个值表示动画属性在动画过程中的某个状态。
     * 如果 t 大于所有采样点的 x 坐标，则返回 1。
     */
    static getBezierRate(t: number, px0: number, py0: number, px1: number, py1: number): number {
        var key: number = BezierLerp._getBezierParamKey(px0, py0, px1, py1);
        var vKey: number = key * 100 + t;
        if (BezierLerp._bezierResultCache[vKey]) return BezierLerp._bezierResultCache[vKey];
        var points: any[] = BezierLerp._getBezierPoints(px0, py0, px1, py1, key);
        var i: number, len: number;
        len = points.length;
        for (i = 0; i < len; i += 2) {
            if (t <= points[i]) {
                BezierLerp._bezierResultCache[vKey] = points[i + 1];
                return points[i + 1];
            }
        }
        BezierLerp._bezierResultCache[vKey] = 1;
        return 1;
    }

    //TODO:coverage
    /**
     * @internal
     * @en Generate a unique key for caching bezier parameters.
     * This method creates a single number that uniquely identifies a set of Bezier curve control points.
     * @param px0 X-coordinate of the first control point P1.
     * @param py0 Y-coordinate of the first control point P1.
     * @param px1 X-coordinate of the second control point P2.
     * @param py1 Y-coordinate of the second control point P2.
     * @returns A unique numerical key for the given bezier parameters.
     * @zh 为贝塞尔参数生成一个唯一的缓存键。
     * 此方法创建一个唯一标识一组贝塞尔曲线控制点的数字。
     * @param px0 第一个控制点 P1 的 X 坐标。
     * @param py0 第一个控制点 P1 的 Y 坐标。
     * @param px1 第二个控制点 P2 的 X 坐标。
     * @param py1 第二个控制点 P2 的 Y 坐标。
     * @returns 给定贝塞尔参数的唯一数字键。
     */
    private static _getBezierParamKey(px0: number, py0: number, px1: number, py1: number): number {
        return (((px0 * 100 + py0) * 100 + px1) * 100 + py1) * 100;
    }

    //TODO:coverage
    /**
    * @internal
    * @en Get or calculate an array of points representing a cubic Bezier curve with fixed start and end points.
    * @param px0 X-coordinate of the first control point P1.
    * @param py0 Y-coordinate of the first control point P1.
    * @param px1 X-coordinate of the second control point P2.
    * @param py1 Y-coordinate of the second control point P2.
    * @param key The unique key for caching.
    * @returns An array of numbers representing points on the Bezier curve. The array contains alternating x and y coordinates, 
    *          [x0, y0, x1, y1, ...]. The number of points is determined by the insertion count (100 in this implementation).
    * @note The start point P0 is fixed at (0,0) and the end point P3 is fixed at (1,1) in the implementation.
    * @zh 获取或计算表示固定起点和终点的三次贝塞尔曲线的点数组。
    * @param px0 第一个控制点 P1 的 X 坐标。
    * @param py0 第一个控制点 P1 的 Y 坐标。
    * @param px1 第二个控制点 P2 的 X 坐标。
    * @param py1 第二个控制点 P2 的 Y 坐标。
    * @param key 用于缓存的唯一键。
    * @returns 表示贝塞尔曲线上点的数字数组。数组包含交替的 x 和 y 坐标，[x0, y0, x1, y1, ...]。
    *          点的数量由插值数量决定（在此实现中为100）。
    * @note 在实现中，起点 P0 固定在 (0,0)，终点 P3 固定在 (1,1)。
    */
    private static _getBezierPoints(px0: number, py0: number, px1: number, py1: number, key: number): any[] {
        if (BezierLerp._bezierPointsCache[key]) return BezierLerp._bezierPointsCache[key];
        var controlPoints: any[];
        controlPoints = [0, 0, px0, py0, px1, py1, 1, 1];
        var bz: Bezier;
        bz = new Bezier();
        var points: any[];
        points = bz.getBezierPoints(controlPoints, 100, 3);
        BezierLerp._bezierPointsCache[key] = points;
        return points;
    }
}


