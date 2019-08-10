import { Point } from "./Point";
/**
	 * @private
	 * 计算贝塞尔曲线的工具类。
	 */
export class Bezier {

    /**
     * 工具类单例
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
     * 计算二次贝塞尔点。
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
     * 计算三次贝塞尔点
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
     * 计算贝塞尔点序列
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
     * 获取贝塞尔曲线上的点。
     * @param pList 控制点[x0,y0,x1,y1...]
     * @param inSertCount 每次曲线的插值数量
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

