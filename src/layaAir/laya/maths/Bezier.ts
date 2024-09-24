import { Point } from "./Point";

/**
 * @private
 * @en Utility class for calculating Bezier curves.
 * @zh 计算贝塞尔曲线的工具类。
 */
export class Bezier {

    /**
     * @en Singleton instance of the utility class
     * @zh 工具类单例
     */
    static I: Bezier = new Bezier();
    /** @private */
    private _controlPoints: any[] = [new Point(), new Point(), new Point()];
    /** @private */
    private _calFun: Function = this.getPoint2;

    /** @private */
    private _switchPoint(x: number, y: number): void {
        var tPoint: Point = this._controlPoints.shift();
        tPoint.setTo(x, y);
        this._controlPoints.push(tPoint);
    }

    /**
     * @en Calculate quadratic Bezier point.
     * @param t The parameter in the range [0, 1]
     * @param rst The array to store the result
     * @zh 计算二次贝塞尔点。
     * @param t 用于计算的参数，范围[0, 1]
     * @param rst 用于存结果的数组
     */
    getPoint2(t: number, rst: any[]): void {
        //二次贝塞尔曲线公式
        var p1: Point = this._controlPoints[0];
        var p2: Point = this._controlPoints[1];
        var p3: Point = this._controlPoints[2];
        var lineX: number = Math.pow((1 - t), 2) * p1.x + 2 * t * (1 - t) * p2.x + Math.pow(t, 2) * p3.x;
        var lineY: number = Math.pow((1 - t), 2) * p1.y + 2 * t * (1 - t) * p2.y + Math.pow(t, 2) * p3.y;
        rst.push(lineX, lineY);
    }

    /**
     * @en Calculate cubic Bezier point
     * @param t The parameter in the range [0, 1]
     * @param rst The array to store the result
     * @zh 计算三次贝塞尔点
     * @param t 用于计算的参数，范围[0, 1]
     * @param rst 用于存结果的数组
     */
    getPoint3(t: number, rst: any[]): void {
        //三次贝塞尔曲线公式
        var p1: Point = this._controlPoints[0];
        var p2: Point = this._controlPoints[1];
        var p3: Point = this._controlPoints[2];
        var p4: Point = this._controlPoints[3];
        var lineX: number = Math.pow((1 - t), 3) * p1.x + 3 * p2.x * t * (1 - t) * (1 - t) + 3 * p3.x * t * t * (1 - t) + p4.x * Math.pow(t, 3);
        var lineY: number = Math.pow((1 - t), 3) * p1.y + 3 * p2.y * t * (1 - t) * (1 - t) + 3 * p3.y * t * t * (1 - t) + p4.y * Math.pow(t, 3);
        rst.push(lineX, lineY);
    }

    /**
     * @en Calculate a sequence of Bezier points
     * @param count The number of points to insert
     * @param rst The array to store the result
     * @zh 计算贝塞尔点序列
     * @param count 输入的点的数量
     * @param rst 用于存结果的数组
     */
    insertPoints(count: number, rst: any[]): void {
        var i: number;
        count = count > 0 ? count : 5;
        var dLen: number;
        dLen = 1 / count;
        for (i = 0; i <= 1; i += dLen) {
            this._calFun(i, rst);
        }
    }

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
    getBezierPoints(pList: any[], inSertCount: number = 5, count: number = 2): any[] {
        var i: number, len: number;
        len = pList.length;
        if (len < (count + 1) * 2) return [];
        var rst: any[] = [];
        switch (count) {
            case 2:
                this._calFun = this.getPoint2;
                break;
            case 3:
                this._calFun = this.getPoint3;
                break;
            default:
                return [];
        }
        while (this._controlPoints.length <= count) {
            this._controlPoints.push(Point.create());
        }
        for (i = 0; i < count * 2; i += 2) {
            this._switchPoint(pList[i], pList[i + 1]);
        }
        for (i = count * 2; i < len; i += 2) {
            this._switchPoint(pList[i], pList[i + 1]);
            if ((i / 2) % count == 0) this.insertPoints(inSertCount, rst);
        }
        return rst;
    }
}

