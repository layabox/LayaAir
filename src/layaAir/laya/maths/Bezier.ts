import { Point } from "./Point";

/**
 * @en Utility class for calculating Bezier curves.
 * @zh 计算贝塞尔曲线的工具类。
 */
export class Bezier {
    /**
     * @en Get points on the Bezier curve.
     * @param pList Control points [x0,y0,x1,y1...]
     * @param inSertCount The number of interpolation points for each curve segment
     * @param count The order of the Bezier curve (2 for quadratic, 3 for cubic)
     * @returns An array of points on the Bezier curve
     * @zh 获取贝塞尔曲线上的点。
     * @param pList 控制点[x0,y0,x1,y1...]
     * @param inSertCount 每次曲线的插值数量
     * @param count 贝塞尔曲线的阶数（2表示二次曲线，3表示三次曲线）
     * @returns 贝塞尔曲线上的点组成的数组
     */
    static getPoints(pList: number[], inSertCount: number = 5, count: number = 2, out?: number[]): number[] {
        out = out || [];
        let len = pList.length;
        if (len < (count + 1) * 2)
            return out;

        switch (count) {
            case 2:
                _calFun = getPoint2;
                break;
            case 3:
                _calFun = getPoint3;
                break;
            default:
                return [];
        }
        while (tmpPoints.length <= count) {
            tmpPoints.push(new Point());
        }
        for (let i = 0; i < count * 2; i += 2) {
            _switchPoint(pList[i], pList[i + 1]);
        }
        for (let i = count * 2; i < len; i += 2) {
            _switchPoint(pList[i], pList[i + 1]);
            if ((i / 2) % count == 0) insertPoints(inSertCount, out);
        }
        return out;
    }

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
    static getRate(t: number, px0: number, py0: number, px1: number, py1: number): number {
        let key: number = _getBezierParamKey(px0, py0, px1, py1);
        let vKey: number = key * 100 + t;
        if (_bezierResultCache[vKey])
            return _bezierResultCache[vKey];

        let points: any[];
        if (_bezierPointsCache[key])
            points = _bezierPointsCache[key];
        else {
            var controlPoints: any[];
            controlPoints = [0, 0, px0, py0, px1, py1, 1, 1];
            points = Bezier.getPoints(controlPoints, 100, 3);
            _bezierPointsCache[key] = points;
        }

        let len = points.length;
        for (let i = 0; i < len; i += 2) {
            if (t <= points[i]) {
                _bezierResultCache[vKey] = points[i + 1];
                return points[i + 1];
            }
        }
        _bezierResultCache[vKey] = 1;
        return 1;
    }
}

const tmpPoints: Array<Point> = [new Point(), new Point(), new Point()];
var _calFun: Function = getPoint2;
const _bezierResultCache: any = {};
const _bezierPointsCache: any = {};

function _switchPoint(x: number, y: number): void {
    let tPoint = tmpPoints.pop();
    tPoint.setTo(x, y);
    tmpPoints.unshift(tPoint);
}


function getPoint2(t: number, rst: any[]): void {
    //二次贝塞尔曲线公式
    var p1: Point = tmpPoints[2];
    var p2: Point = tmpPoints[1];
    var p3: Point = tmpPoints[0];
    var lineX: number = Math.pow((1 - t), 2) * p1.x + 2 * t * (1 - t) * p2.x + Math.pow(t, 2) * p3.x;
    var lineY: number = Math.pow((1 - t), 2) * p1.y + 2 * t * (1 - t) * p2.y + Math.pow(t, 2) * p3.y;
    rst.push(lineX, lineY);
}

function getPoint3(t: number, rst: any[]): void {
    //三次贝塞尔曲线公式
    var p1: Point = tmpPoints[3];
    var p2: Point = tmpPoints[2];
    var p3: Point = tmpPoints[1];
    var p4: Point = tmpPoints[0];
    var lineX: number = Math.pow((1 - t), 3) * p1.x + 3 * p2.x * t * (1 - t) * (1 - t) + 3 * p3.x * t * t * (1 - t) + p4.x * Math.pow(t, 3);
    var lineY: number = Math.pow((1 - t), 3) * p1.y + 3 * p2.y * t * (1 - t) * (1 - t) + 3 * p3.y * t * t * (1 - t) + p4.y * Math.pow(t, 3);
    rst.push(lineX, lineY);
}

function insertPoints(count: number, rst: any[]): void {
    var i: number;
    count = count > 0 ? count : 5;
    var dLen: number;
    dLen = 1 / count;
    for (i = 0; i <= 1; i += dLen) {
        _calFun(i, rst);
    }
}

function _getBezierParamKey(px0: number, py0: number, px1: number, py1: number): number {
    return (((px0 * 100 + py0) * 100 + px1) * 100 + py1) * 100;
}