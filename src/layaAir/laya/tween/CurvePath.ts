
import { MathUtil } from "../maths/MathUtil";
import { Vector3 } from "../maths/Vector3";
import { Pool } from "../utils/Pool";
import { CurveType, PathPoint, RotationType } from "./PathPoint";

export class CurvePath {
    private _segments: Array<Segment>;
    private _points: Array<Vector3>;
    private _fullLength: number;
    private _cacheT: number;
    private _curPt: Vector3;
    private _parPos: Vector3;
    private _parPosCatch: Vector3;
    /**
    * 0或者null为不旋转，1为沿路径曲线路径旋转，2为沿运动路径旋转
    */
    rotationType: RotationType;

    constructor() {
        this._segments = [];
        this._points = [];
        this._curPt = new Vector3();
        this._parPosCatch = new Vector3();
    }

    /**
     * @en The total length of the curve.
     * @zh 曲线的总长度。
     */
    get length(): number {
        return this._fullLength;
    }
    is2D: boolean;

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
        this.rotationType = null;
        this._parPos = null;

        let cnt = points.length;
        if (cnt == 0)
            return;

        let splinePoints: Array<Vector3> = [];

        let prev = points[0];
        this.rotationType = prev.rotationType;
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
                    seg.length = Vector3.distance(prev.pos, current.pos);
                }
                else if (prev.curve == CurveType.Bezier) {
                    seg.ptCount = 3;
                    pts.push(prev.pos.cloneTo(pool.take()));
                    pts.push(current.pos.cloneTo(pool.take()));
                    pts.push(prev.c1.cloneTo(pool.take()));
                    seg.length = this.estimateBezierLength(seg.ptStart, seg.ptCount);
                }
                else if (prev.curve == CurveType.CubicBezier) {
                    seg.ptCount = 4;
                    pts.push(prev.pos.cloneTo(pool.take()));
                    pts.push(current.pos.cloneTo(pool.take()));
                    pts.push(prev.c1.cloneTo(pool.take()));
                    pts.push(prev.c2.cloneTo(pool.take()));
                    seg.length = this.estimateBezierLength(seg.ptStart, seg.ptCount);
                }
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

        // 自动检测是否为2D曲线（所有点的z分量都接近0）
        this.is2D = this._points.every(pt => Math.abs(pt.z) < 0.0001);
    }

    /**
     * @en Estimate the arc length of a Bezier curve by sampling.
     * @param ptStart Starting point index in the points array.
     * @param ptCount Number of control points.
     * @param samples Number of samples for estimation.
     * @returns Estimated arc length.
     * @zh 通过采样估算贝塞尔曲线的弧长。
     * @param ptStart 点数组中的起始点索引。
     * @param ptCount 控制点数量。
     * @param samples 估算的采样数量。
     * @returns 估算的弧长。
     */
    private estimateBezierLength(ptStart: number, ptCount: number, samples: number = 10): number {
        let length = 0;
        let prevPt = new Vector3();
        let curPt = new Vector3();

        this.onBezierCurve(ptStart, ptCount, 0, prevPt);
        for (let i = 1; i <= samples; i++) {
            let t = i / samples;
            this.onBezierCurve(ptStart, ptCount, t, curPt);
            length += Vector3.distance(prevPt, curPt);
            curPt.cloneTo(prevPt);
        }
        return length;
    }

    private createSplineSegment(splinePoints: Array<Vector3>): void {
        let cnt = splinePoints.length;
        splinePoints.splice(0, 0, splinePoints[0].cloneTo(pool.take()));
        splinePoints.push(splinePoints[cnt].cloneTo(pool.take()));
        splinePoints.push(splinePoints[cnt].cloneTo(pool.take()));
        cnt += 3;

        let seg: Segment = {};
        seg.type = CurveType.CRSpline;
        seg.ptStart = this._points.length;
        seg.ptCount = cnt;

        this._points.push(...splinePoints);

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
     * @en Get the rotation (tangent direction) on the curve at the specified distance.
     * Automatically detects 2D/3D data and returns appropriate rotation format.
     * For 2D data (z=0), returns Vector3(0, 0, rotationAngle).
     * For 3D data, returns Vector3(pitch, yaw, roll).
     * @param t Distance value. It should be a value between 0 and 1.
     * @param out Optional output Vector3 to store the result. If not provided, a new Vector3 will be created.
     * @returns The rotation angles in degrees representing the tangent direction at the specified point.
     * @zh 获取曲线上指定距离点的旋转角度（切线方向）。
     * 自动检测2D/3D数据并返回相应的旋转格式。
     * 对于2D数据（z=0），返回Vector3(0, 0, 旋转角度)。
     * 对于3D数据，返回Vector3(俯仰角, 偏航角, 滚转角)。
     * @param t 距离值，它应该是0到1之间的值。
     * @param out 可选的输出Vector3用于存储结果。如果未提供，将创建新的Vector3。
     * @returns 表示指定点切线方向的旋转角度（度）。
     */
    getRotationAt(t: number, out?: Vector3): Vector3 {
        if (!this.rotationType) return null;
        if (RotationType.RotateAlongMotionPath === this.rotationType) {
            const ret = CurvePath.getRotation(this._parPos, this._curPt);
            if (!this._parPos) {
                this._parPos = this._parPosCatch;
            }
            this._curPt.cloneTo(this._parPos);
            return ret;
        }
        if (!out) {
            out = new Vector3();
        }

        let tangent = new Vector3();
        t = MathUtil.clamp01(t);

        let cnt = this._segments.length;
        if (cnt == 0) {
            out.set(0, 0, 0);
            return out;
        }

        // 处理边界情况
        if (t == 0) {
            // 在起点，使用第一个段的起始切线
            let seg = this._segments[0];
            this.getTangentAtSegment(seg, 0, tangent);
        }
        else if (t == 1) {
            // 在终点，使用最后一个段的结束切线
            let seg = this._segments[cnt - 1];
            this.getTangentAtSegment(seg, 1, tangent);
        }
        else {
            // 找到对应的段和段内的t值
            for (let i = 0, len = t * this._fullLength; i < cnt; i++) {
                let seg = this._segments[i];

                len -= seg.length;
                if (len < 0) {
                    let segmentT = 1 + len / seg.length;
                    this.getTangentAtSegment(seg, segmentT, tangent);
                    break;
                }
            }
        }

        // 将切线向量转换为欧拉角（以度为单位），自动检测2D/3D
        this.tangentToEulerAngles(tangent, out);
        return out;
    }

    /**
     * @en Convert a tangent vector to Euler angles in degrees.
     * Automatically detects if the curve is 2D (z=0) or 3D and returns appropriate rotation format.
     * For 2D curves, returns Vector3(0, 0, rotationAngle).
     * For 3D curves, returns Vector3(pitch, yaw, roll).
     * @param tangent The normalized tangent vector.
     * @param out The output Vector3 to store the Euler angles (x, y, z) in degrees.
     * @zh 将切线向量转换为欧拉角（度）。
     * 自动检测曲线是2D（z=0）还是3D，并返回相应的旋转格式。
     * 对于2D曲线，返回Vector3(0, 0, 旋转角度)。
     * 对于3D曲线，返回Vector3(俯仰角, 偏航角, 滚转角)。
     * @param tangent 归一化的切线向量。
     * @param out 输出Vector3存储欧拉角（x, y, z），单位为度。
     */
    private tangentToEulerAngles(tangent: Vector3, out: Vector3): void {
        if (this.is2D) {
            // 2D情况：返回Vector3(0, 0, 旋转角度)
            // 计算XY平面的旋转角度
            let rotationAngle = Math.atan2(tangent.y, tangent.x) * 180 / Math.PI;
            out.set(0, 0, rotationAngle);
        } else {
            // 3D情况：计算完整的欧拉角
            // 计算绕Y轴的旋转（Yaw）- 水平方向
            let yaw = Math.atan2(tangent.x, tangent.z) * 180 / Math.PI;

            // 计算绕X轴的旋转（Pitch）- 垂直方向
            let horizontalLength = Math.sqrt(tangent.x * tangent.x + tangent.z * tangent.z);
            let pitch = Math.atan2(-tangent.y, horizontalLength) * 180 / Math.PI;

            // Roll通常为0，因为切线向量本身不包含绕前进方向的旋转信息
            // 如果需要更复杂的Roll计算，可能需要额外的上方向向量
            let roll = 0;

            out.set(pitch, yaw, roll);
        }
    }



    /**
     * @en Calculate the tangent vector at a specific point within a curve segment.
     * @param seg The curve segment.
     * @param t The parameter value within the segment (0-1).
     * @param out The output tangent vector.
     * @zh 计算曲线段内指定点的切线向量。
     * @param seg 曲线段。
     * @param t 段内的参数值（0-1）。
     * @param out 输出的切线向量。
     */
    private getTangentAtSegment(seg: Segment, t: number, out: Vector3): void {
        let pts = this._points;

        if (seg.type == CurveType.Straight) {
            // 直线的切线就是方向向量
            Vector3.subtract(pts[seg.ptStart + 1], pts[seg.ptStart], out);
            Vector3.normalize(out, out);
        }
        else if (seg.type == CurveType.Bezier) {
            // 二次贝塞尔曲线的切线
            this.getBezierTangent(seg.ptStart, seg.ptCount, t, out);
        }
        else if (seg.type == CurveType.CubicBezier) {
            // 三次贝塞尔曲线的切线
            this.getBezierTangent(seg.ptStart, seg.ptCount, t, out);
        }
        else if (seg.type == CurveType.CRSpline) {
            // CR样条曲线的切线
            this.getCRSplineTangent(seg.ptStart, seg.ptCount, t, out);
        }
    }

    /**
     * @en Calculate the tangent vector for a Bezier curve at parameter t.
     * @param ptStart Starting point index in the points array.
     * @param ptCount Number of control points (3 for quadratic, 4 for cubic).
     * @param t Parameter value (0-1).
     * @param out Output tangent vector.
     * @zh 计算贝塞尔曲线在参数t处的切线向量。
     * @param ptStart 点数组中的起始点索引。
     * @param ptCount 控制点数量（二次贝塞尔为3，三次贝塞尔为4）。
     * @param t 参数值（0-1）。
     * @param out 输出切线向量。
     */
    private getBezierTangent(ptStart: number, ptCount: number, t: number, out: Vector3): void {
        let pts = this._points;
        let p0 = pts[ptStart];
        let p1 = pts[ptStart + 1];
        let cp0 = pts[ptStart + 2];

        if (ptCount == 4) {
            // 三次贝塞尔曲线的切线：B'(t) = 3(1-t)²(C₀-P₀) + 6(1-t)t(C₁-C₀) + 3t²(P₁-C₁)
            let cp1 = pts[ptStart + 3];
            let t2 = 1 - t;

            // 计算切线向量的各个分量
            Vector3.subtract(cp0, p0, tmpVec3);
            Vector3.scale(tmpVec3, 3 * t2 * t2, tmpVec3);

            Vector3.subtract(cp1, cp0, tmpVec31);
            Vector3.scale(tmpVec31, 6 * t2 * t, tmpVec31);

            Vector3.subtract(p1, cp1, tmpVec32);
            Vector3.scale(tmpVec32, 3 * t * t, tmpVec32);

            Vector3.add(tmpVec3, tmpVec31, out);
            Vector3.add(out, tmpVec32, out);
        }
        else {
            // 二次贝塞尔曲线的切线：B'(t) = 2(1-t)(C₀-P₀) + 2t(P₁-C₀)
            let t2 = 1 - t;

            Vector3.subtract(cp0, p0, tmpVec3);
            Vector3.scale(tmpVec3, 2 * t2, tmpVec3);

            Vector3.subtract(p1, cp0, tmpVec31);
            Vector3.scale(tmpVec31, 2 * t, tmpVec31);

            Vector3.add(tmpVec3, tmpVec31, out);
        }

        // 归一化切线向量
        Vector3.normalize(out, out);
    }

    /**
     * @en Calculate the tangent vector for a CR Spline curve at parameter t.
     * @param ptStart Starting point index in the points array.
     * @param ptCount Number of control points.
     * @param t Parameter value (0-1).
     * @param out Output tangent vector.
     * @zh 计算CR样条曲线在参数t处的切线向量。
     * @param ptStart 点数组中的起始点索引。
     * @param ptCount 控制点数量。
     * @param t 参数值（0-1）。
     * @param out 输出切线向量。
     */
    private getCRSplineTangent(ptStart: number, ptCount: number, t: number, out: Vector3): void {
        let adjustedIndex: number = Math.floor(t * (ptCount - 4)) + ptStart;
        let pts = this._points;
        let p0 = pts[adjustedIndex];
        let p1 = pts[adjustedIndex + 1];
        let p2 = pts[adjustedIndex + 2];
        let p3 = pts[adjustedIndex + 3];

        let adjustedT: number = (t == 1) ? 1 : MathUtil.repeat(t * (ptCount - 4), 1);

        // CR样条曲线的切线导数
        let dt0: number = (-3 * adjustedT * adjustedT + 4 * adjustedT - 1) * 0.5;
        let dt1: number = (9 * adjustedT * adjustedT - 10 * adjustedT) * 0.5;
        let dt2: number = (-9 * adjustedT * adjustedT + 8 * adjustedT + 1) * 0.5;
        let dt3: number = (3 * adjustedT * adjustedT - 2 * adjustedT) * 0.5;

        out.x = p0.x * dt0 + p1.x * dt1 + p2.x * dt2 + p3.x * dt3;
        out.y = p0.y * dt0 + p1.y * dt1 + p2.y * dt2 + p3.y * dt3;
        out.z = p0.z * dt0 + p1.z * dt1 + p2.z * dt2 + p3.z * dt3;

        // 归一化切线向量
        Vector3.normalize(out, out);
    }

    /**
     * @en Get the point on the curve at the specified distance.
     * @param t Distance value. It should be a value between 0 and 1.
     * @returns The point on the curve at the specified distance.
     * @zh 获取曲线上的指定距离的点。
     * @param t 距离值，它应该是0到1之间的值。
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

        // 处理边界情况 t == 1，直接获取最后一段的终点
        if (t == 1) {
            let seg = this._segments[cnt - 1];
            this.getPointOnSegment(seg, 1, pts, out);
            return out;
        }

        // 根据长度找到对应的段和段内的t值
        for (let i = 0, len = t * this._fullLength; i < cnt; i++) {
            let seg = this._segments[i];

            len -= seg.length;
            if (len < 0) {
                let segmentT = 1 + len / seg.length;
                this.getPointOnSegment(seg, segmentT, pts, out);
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

    /**
     * @en Get the point on a specific segment at parameter t.
     * @param seg The curve segment.
     * @param t The parameter value within the segment (0-1).
     * @param pts The points array.
     * @param out The output Vector3.
     * @zh 获取指定段在参数t处的点。
     * @param seg 曲线段。
     * @param t 段内的参数值（0-1）。
     * @param pts 点数组。
     * @param out 输出的Vector3。
     */
    private getPointOnSegment(seg: Segment, t: number, pts: Array<Vector3>, out: Vector3): void {
        if (seg.type == CurveType.Straight)
            Vector3.lerp(pts[seg.ptStart], pts[seg.ptStart + 1], t, out);
        else if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier)
            this.onBezierCurve(seg.ptStart, seg.ptCount, t, out);
        else
            this.onCRSplineCurve(seg.ptStart, seg.ptCount, t, out);
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
            Vector3.add(p0.scale(t2 * t2 * t2, tmpVec3), cp0.scale(3 * t2 * t2 * t, tmpVec31), tmpVec31);
            Vector3.add(cp1.scale(3 * t2 * t * t, tmpVec3), p1.scale(t * t * t, tmpVec32), tmpVec32);
            Vector3.add(tmpVec31, tmpVec32, out);
        }
        else {
            Vector3.add(p0.scale(t2 * t2, tmpVec3), cp0.scale(2 * t2 * t, tmpVec31), tmpVec3);
            Vector3.add(tmpVec3, p1.scale(t * t, tmpVec31), out);
        }

        return out;
    }
    static getRotation(parPos: Vector3, currPos: Vector3): Vector3 {
        if (!parPos) return null;
        // 计算从父位置到当前位置的方向向量
        let direction = new Vector3();
        Vector3.subtract(currPos, parPos, direction);

        // 检查是否为2D情况（z分量接近0）
        const epsilon = 0.0001;
        const is2D = Math.abs(direction.z) < epsilon;

        if (is2D) {
            // 2D情况：返回Vector3(0, 0, 旋转角度)
            // 计算XY平面的旋转角度（以度为单位）
            let rotationAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
            return new Vector3(0, 0, rotationAngle);
        } else {
            // 3D情况：计算完整的欧拉角
            // 归一化方向向量
            Vector3.normalize(direction, direction);

            // 计算绕Y轴的旋转（Yaw）- 水平方向
            let yaw = Math.atan2(direction.x, direction.z) * 180 / Math.PI;

            // 计算绕X轴的旋转（Pitch）- 垂直方向
            let horizontalLength = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
            let pitch = Math.atan2(-direction.y, horizontalLength) * 180 / Math.PI;

            // Roll通常为0，因为方向向量本身不包含绕前进方向的旋转信息
            let roll = 0;

            return new Vector3(pitch, yaw, roll);
        }
    }
}

const tmpVec3 = new Vector3();
const tmpVec31 = new Vector3();
const tmpVec32 = new Vector3();
const pool = Pool.createPool(Vector3, null, e => e.set(0, 0, 0));

interface Segment {
    type?: number;
    length?: number;
    ptStart?: number;
    ptCount?: number;
}
