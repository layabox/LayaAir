import { Point } from "./Point";

/**
 * @en Graham Scan algorithm for convex hull calculation.
 * @zh 凸包算法。
 */
export class GrahamScan {
    /**
     * @en Find the minimum polygon vertex set that includes all points.
     * @param pList The [x,y...] list.
     * @param out The output array to store the result. If not provided, a new array will be created.
     * @returns The minimum polygon vertex set.
     * @zh 寻找包括所有点的最小多边形顶点集合。
     * @param pList 形如[x0,y0,x1,y1...]的点列表。
     * @param out 输出数组，用于存储结果。如果未提供，将创建一个新数组。
     * @returns 最小多边形顶点集合。
     */
    static scanPList(pList: ReadonlyArray<number>, out?: number[]): number[] {
        let len = Math.floor(pList.length / 2);
        _tmpPoints.length = len;
        if (len > _pointPool.length)
            _pointPool.length = len;
        for (let i = 0; i < len; i++) {
            let pt = _pointPool[i] || (_pointPool[i] = new Point());
            pt.setTo(pList[i + i], pList[i + i + 1]);
            _tmpPoints[i] = pt;
        }

        let res = GrahamScan.scan(_tmpPoints, _tmpPoints);

        out = out || [];
        out.length = 0;

        for (let i = 0, n = res.length; i < n; i++) {
            out.push(res[i].x, res[i].y);
        }

        return out;
    }

    /**
     * @en Find the minimum polygon vertex set that includes all points.
     * @param points The Point list.
     * @returns The minimum polygon vertex set.
     * @zh 寻找包括所有点的最小多边形顶点集合。
     * @param points Point列表。
     * @return 最小多边形顶点集合。
     */
    static scan(points: ReadonlyArray<Point>, out?: Point[]): Point[] {
        let pts = removeDuplicatePoints(points);
        let len = pts.length;

        //找到最下且偏左的那个点
        let k = 0;
        for (let i = 1; i < len; i++) {
            if ((pts[i].y < pts[k].y) || ((pts[i].y == pts[k].y) && (pts[i].x < pts[k].x)))
                k = i;
        }
        //将这个点指定为PointSet[0]  
        let tmp = pts[0];
        pts[0] = pts[k];
        pts[k] = tmp;
        //按极角从小到大,距离偏短进行排序  
        for (let i = 1; i < len - 1; i++) {
            k = i;
            for (let j = i + 1; j < len; j++) {
                if ((multiply(pts[j], pts[k], pts[0]) > 0) || ((multiply(pts[j], pts[k], pts[0]) == 0)
                    && (dis(pts[0], pts[j]) < dis(pts[0], pts[k]))))
                    k = j;//k保存极角最小的那个点,或者相同距离原点最近  
            }
            let tmp = pts[i];
            pts[i] = pts[k];
            pts[k] = tmp;
        }
        //第三个点先入栈
        out = out || [];
        out.length = 0;
        if (pts.length < 3) {
            out.push(...pts);
            return out;
        }
        out.push(pts[0], pts[1], pts[2]);
        //判断与其余所有点的关系  
        for (let i = 3; i < len; i++) {
            //不满足向左转的关系,栈顶元素出栈  
            while (out.length >= 2 && multiply(pts[i], out[out.length - 1], out[out.length - 2]) >= 0)
                out.pop();
            //当前点与栈内所有点满足向左关系,因此入栈.  
            out.push(pts[i]);
        }
        return out;
    }
}

const _tmpPoints: Point[] = [];
const _tmpPoints2: Point[] = [];
const _pointPool: Point[] = [];
const _test: Set<string> = new Set();

function removeDuplicatePoints(points: ReadonlyArray<Point>): Point[] {
    _test.clear();
    _tmpPoints2.length = 0;
    for (let i = points.length - 1; i >= 0; i--) {
        let tmp = points[i];
        let key = tmp.x + "_" + tmp.y;
        if (!_test.has(key)) {
            _test.add(key);
            _tmpPoints2.push(tmp);
        }
    }
    return _tmpPoints2;
}

function multiply(p1: Point, p2: Point, p0: Point): number {
    return ((p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y));
}

function dis(p1: Point, p2: Point): number {
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
}