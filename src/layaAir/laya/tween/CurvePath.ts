import { MathUtil } from "../maths/MathUtil";
import { Vector3 } from "../maths/Vector3";
import { Pool } from "../utils/Pool";
import { CurveType, PathPoint } from "./PathPoint";

export class CurvePath {
    private _segments: Array<Segment>;
    private _points: Array<Vector3>;
    private _fullLength: number;
    private _cacheT: number;
    private _curPt: Vector3;

    constructor() {
        this._segments = [];
        this._points = [];
        this._curPt = new Vector3();
    }

    /**
     * @en The total length of the curve.
     * @zh 曲线的总长度。
     */
    get length(): number {
        return this._fullLength;
    }

    /**
     * @en Create a curve.
     * @param points Point list.
     * @zh 创建一条曲线。
     * @param points 点列表。 
     */
    create(...points: ReadonlyArray<PathPoint>): void {
        this._segments.length = 0;
        let pts = this._points;
        pool.recover(this._points);
        this._fullLength = 0;
        this._cacheT = null;

        let cnt = points.length;
        if (cnt == 0)
            return;

        let splinePoints: Array<Vector3> = [];

        let prev = points[0];
        if (prev.curve == CurveType.CRSpline)
            splinePoints.push(prev.pos.cloneTo(pool.take()));

        for (let i = 1; i < cnt; i++) {
            let current = points[i];

            if (prev.curve != CurveType.CRSpline) {
                let seg: Segment = {};
                seg.type = prev.curve;
                seg.ptStart = pts.length;
                if (prev.curve == CurveType.Straight) {
                    seg.ptCount = 2;
                    pts.push(prev.pos.cloneTo(pool.take()));
                    pts.push(current.pos.cloneTo(pool.take()));
                }
                else if (prev.curve == CurveType.Bezier) {
                    seg.ptCount = 3;
                    pts.push(prev.pos.cloneTo(pool.take()));
                    pts.push(current.pos.cloneTo(pool.take()));
                    pts.push(prev.c1.cloneTo(pool.take()));
                }
                else if (prev.curve == CurveType.CubicBezier) {
                    seg.ptCount = 4;
                    pts.push(prev.pos.cloneTo(pool.take()));
                    pts.push(current.pos.cloneTo(pool.take()));
                    pts.push(prev.c1.cloneTo(pool.take()));
                    pts.push(prev.c2.cloneTo(pool.take()));
                }
                seg.length = Vector3.distance(prev.pos, current.pos);
                this._fullLength += seg.length;
                this._segments.push(seg);
            }

            if (current.curve != CurveType.CRSpline) {
                if (splinePoints.length > 0) {
                    splinePoints.push(current.pos.cloneTo(pool.take()));
                    this.createSplineSegment(splinePoints);
                }
            }
            else
                splinePoints.push(current.pos.cloneTo(pool.take()));

            prev = current;
        }

        if (splinePoints.length > 1)
            this.createSplineSegment(splinePoints);
    }

    private createSplineSegment(splinePoints: Array<Vector3>): void {
        let cnt = splinePoints.length;
        splinePoints.splice(0, 0, splinePoints[0]);
        splinePoints.push(splinePoints[cnt]);
        splinePoints.push(splinePoints[cnt]);
        cnt += 3;

        let seg: Segment = {};
        seg.type = CurveType.CRSpline;
        seg.ptStart = this._points.length;
        seg.ptCount = cnt;

        this._points = this._points.concat(splinePoints);

        seg.length = 0;
        for (let i = 1; i < cnt; i++) {
            seg.length += Vector3.distance(splinePoints[i - 1], splinePoints[i]);
        }
        this._fullLength += seg.length;
        this._segments.push(seg);
        splinePoints.length = 0;
    }

    /**
     * @en Clear the curve.
     * @zh 清空曲线。 
     */
    clear(): void {
        this._segments.length = 0;
        this._points.length = 0;
    }

    /**
     * @en Get the point on the curve at the specified distance.
     * @param t Distance value. It should be a value between 0 and 1.
     * @param out The point on the curve at the specified distance. 
     * @returns The point on the curve at the specified distance.
     * @zh 获取曲线上的指定距离的点。
     * @param t 距离值，它应该是0到1之间的值。
     * @param out 用于存储计算结果的点。
     * @returns 曲线上的指定距离的点。
     */
    getPointAt(t: number): Readonly<Vector3> {
        let out = this._curPt;
        t = MathUtil.clamp01(t);

        if (t === this._cacheT)
            return out;

        out.set(0, 0, 0);
        this._cacheT = t;

        let cnt = this._segments.length;
        if (cnt == 0) {
            return out;
        }

        let pts = this._points;
        if (t == 1) {
            let seg = this._segments[cnt - 1];

            if (seg.type == CurveType.Straight)
                Vector3.lerp(pts[seg.ptStart], pts[seg.ptStart + 1], t, out);
            else if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier)
                this.onBezierCurve(seg.ptStart, seg.ptCount, t, out);
            else
                this.onCRSplineCurve(seg.ptStart, seg.ptCount, t, out);
            return out;
        }

        for (let i = 0, len = t * this._fullLength; i < cnt; i++) {
            let seg = this._segments[i];

            len -= seg.length;
            if (len < 0) {
                t = 1 + len / seg.length;

                if (seg.type == CurveType.Straight)
                    Vector3.lerp(pts[seg.ptStart], pts[seg.ptStart + 1], t, out);
                else if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier)
                    this.onBezierCurve(seg.ptStart, seg.ptCount, t, out);
                else
                    this.onCRSplineCurve(seg.ptStart, seg.ptCount, t, out);

                break;
            }
        }

        return out;
    }

    /**
     * @en Get the segment count of the curve.
     * @zh 获得曲线上的分段数。
     */
    get segmentCount(): number {
        return this._segments.length;
    }

    /**
     * @en Get the anchor points of the specified segment.
     * @param segmentIndex The index of the segment.
     * @param out The array to store the result.
     * @returns The anchor points of the specified segment.
     * @zh 获取指定分段的锚点。
     * @param segmentIndex 分段的索引。
     * @param out 用于存储结果的数组。
     * @returns 指定分段的锚点。
     */
    getAnchorsInSegment(segmentIndex: number, out?: Array<Vector3>): Array<Readonly<Vector3>> {
        if (out == null)
            out = [];

        let pts = this._points;
        let seg = this._segments[segmentIndex];
        for (let i = 0; i < seg.ptCount; i++)
            out.push(pts[seg.ptStart + i]);

        return out;
    }

    /**
     * @en Get the points in the specified segment.
     * @param segmentIndex The index of the segment.
     * @param t0 The start distance of the segment. It should be a value between 0 and 1. 
     * @param t1 The end distance of the segment. It should be a value between 0 and 1.
     * @param outPoints The array to store the result. 
     * @param outTs The array to store the distance value of each point. 
     * @param pointDensity The density of the points. It means the step of distance value between two points. Default is 0.1.
     * @returns The points in the specified segment.
     * @zh 获取指定分段中的点。
     * @param segmentIndex 分段的索引。
     * @param t0 分段的起始距离值，应该是0到1之间的值。
     * @param t1 分段的结束距离值，应该是0到1之间的值。
     * @param outPoints 用于存储结果的数组。
     * @param outTs 用于存储每个点的距离值的数组。
     * @param pointDensity 点的密度，表示两个点之间的距离值的步长。默认是0.1。
     * @returns 指定分段中的点。
     */
    getPointsInSegment(segmentIndex: number, t0: number, t1: number, outPoints?: Array<Vector3>, outTs?: Array<number>, pointDensity?: number): Array<Vector3> {
        if (outPoints == null)
            outPoints = [];
        if (!pointDensity || isNaN(pointDensity))
            pointDensity = 0.1;
        let pts = this._points;

        if (outTs)
            outTs.push(t0);
        let seg = this._segments[segmentIndex];
        if (seg.type == CurveType.Straight) {
            let v = new Vector3();
            Vector3.lerp(pts[seg.ptStart], pts[seg.ptStart + 1], t0, v);
            outPoints.push(v);
            v = new Vector3();
            Vector3.lerp(pts[seg.ptStart], pts[seg.ptStart + 1], t1, v);
            outPoints.push(v);
        }
        else {
            let func: Function;
            if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier)
                func = this.onBezierCurve;
            else
                func = this.onCRSplineCurve;

            outPoints.push(func.call(this, seg.ptStart, seg.ptCount, t0, new Vector3()));
            let SmoothAmount: number = Math.min(seg.length * pointDensity, 50);
            for (let j = 0; j <= SmoothAmount; j++) {
                let t = j / SmoothAmount;
                if (t > t0 && t < t1) {
                    outPoints.push(func.call(this, seg.ptStart, seg.ptCount, t, new Vector3()));
                    if (outTs)
                        outTs.push(t);
                }
            }
            outPoints.push(func.call(this, seg.ptStart, seg.ptCount, t1, new Vector3()));
        }

        if (outTs)
            outTs.push(t1);

        return outPoints;
    }

    /**
     * @en Get all the points on the curve.
     * @param out The array to store the result. 
     * @param outTs The array to store the distance value of each point. 
     * @param pointDensity The density of the points. It means the step of distance value between two points. Default is 0.1. 
     * @returns All the points on the curve.
     * @zh 获取曲线上的所有点。
     * @param out 用于存储结果的数组。
     * @param outTs 用于存储每个点的距离值的数组。
     * @param pointDensity 点的密度，表示两个点之间的距离值的步长。默认是0.1。
     * @returns 曲线上的所有点。 
     */
    getAllPoints(out?: Array<Vector3>, outTs?: Array<number>, pointDensity?: number): Array<Vector3> {
        if (out == null)
            out = [];
        if (!pointDensity || isNaN(pointDensity))
            pointDensity = 0.1;

        for (let i = 0, cnt = this._segments.length; i < cnt; i++)
            this.getPointsInSegment(i, 0, 1, out, outTs, pointDensity);

        return out;
    }

    private onCRSplineCurve(ptStart: number, ptCount: number, t: number, out: Vector3): Vector3 {
        let adjustedIndex: number = Math.floor(t * (ptCount - 4)) + ptStart; //Since the equation works with 4 points, we adjust the starting point depending on t to return a point on the specific segment

        let pts = this._points;
        let p0 = pts[adjustedIndex];
        let p1 = pts[adjustedIndex + 1];
        let p2 = pts[adjustedIndex + 2];
        let p3 = pts[adjustedIndex + 3];

        let adjustedT: number = (t == 1) ? 1 : MathUtil.repeat(t * (ptCount - 4), 1); // Then we adjust t to be that value on that new piece of segment... for t == 1f don't use repeat (that would return 0f);

        let t0: number = ((-adjustedT + 2) * adjustedT - 1) * adjustedT * 0.5;
        let t1: number = (((3 * adjustedT - 5) * adjustedT) * adjustedT + 2) * 0.5;
        let t2: number = ((-3 * adjustedT + 4) * adjustedT + 1) * adjustedT * 0.5;
        let t3: number = ((adjustedT - 1) * adjustedT * adjustedT) * 0.5;

        out.x = p0.x * t0 + p1.x * t1 + p2.x * t2 + p3.x * t3;
        out.y = p0.y * t0 + p1.y * t1 + p2.y * t2 + p3.y * t3;
        out.z = p0.z * t0 + p1.z * t1 + p2.z * t2 + p3.z * t3;

        return out;
    }

    private onBezierCurve(ptStart: number, ptCount: number, t: number, out: Vector3): Vector3 {
        let t2: number = 1 - t;
        let pts = this._points;
        let p0 = pts[ptStart];
        let p1 = pts[ptStart + 1];
        let cp0 = pts[ptStart + 2];

        if (ptCount == 4) {
            let cp1 = pts[ptStart + 3];
            Vector3.add(p0.scale(t2 * t2 * t2, tmpVec3), cp0.scale(3 * t2 * t2 * t, tmpVec31), tmpVec3);
            Vector3.add(cp1.scale(3 * t2 * t * t, tmpVec3), p1.scale(t * t * t, tmpVec31), tmpVec31);
            Vector3.add(tmpVec3, tmpVec31, out);
        }
        else {
            Vector3.add(p0.scale(t2 * t2, tmpVec3), cp0.scale(2 * t2 * t, tmpVec31), tmpVec3);
            Vector3.add(tmpVec3, p1.scale(t * t, tmpVec31), out);
        }

        return out;
    }
}

const tmpVec3 = new Vector3();
const tmpVec31 = new Vector3();
const pool = Pool.createPool(Vector3, null, e => e.set(0, 0, 0));

interface Segment {
    type?: number;
    length?: number;
    ptStart?: number;
    ptCount?: number;
}
