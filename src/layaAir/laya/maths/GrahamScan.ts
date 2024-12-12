import { Point } from "./Point";
import { Utils } from "../utils/Utils"

/**
 * @en Graham Scan algorithm for convex hull calculation.
 * @zh 凸包算法。
 */
export class GrahamScan {

    private static _getPoints(count: number, tempUse: boolean = false, rst: any[] | null = null): any[] {
        while (_mPointList.length < count) _mPointList.push(new Point());
        if (!rst) rst = [];
        rst.length = 0;
        if (tempUse) {
            GrahamScan.getFrom(rst, _mPointList, count);
        } else {
            GrahamScan.getFromR(rst, _mPointList, count);
        }
        return rst;
    }

    /**
     * @en Take cout items from the src array at index 0 and add them to the tail of the tst array.
     * @param rst The original array is used to add new child elements.
     * @param src An array used to retrieve child elements.
     * @param count The number of child elements to add.
     * @returns Add the RST object of the child elements.
     * @zh 将数组src从索引0位置，依次取cout个项添加至tst数组的尾部。
     * @param rst 原始数组，用于添加新的子元素。
     * @param src 用于取子元素的数组。
     * @param count 需要取得子元素个数。
     * @returns 添加完子元素的 rst 对象。
     */
    static getFrom(rst: any[], src: any[], count: number): any[] {
        var i: number;
        for (i = 0; i < count; i++) {
            rst.push(src[i]);
        }
        return rst;
    }

    /**
     * @en Take cout items from the end index position to the head index position of the src array and add them to the tail of the tst array.
     * @param rst The original array is used to add new child elements.
     * @param src An array used to retrieve child elements.
     * @param count The number of child elements to add.
     * @returns Add the RST object of the child elements.
     * @zh 将数组src从末尾索引位置往头部索引位置方向，依次取cout个项添加至tst数组的尾部。
     * @param rst 原始数组，用于添加新的子元素。
     * @param src 用于取子元素的数组。
     * @param count 需要取得子元素个数。
     * @returns 添加完子元素的 rst 对象。
     */
    static getFromR(rst: any[], src: any[], count: number): any[] {
        var i: number;
        for (i = 0; i < count; i++) {
            rst.push(src.pop());
        }
        return rst;
    }

    /**
     * @en Convert a list of [x,y...] to a list of Points.
     * @param pList The Point list.
     * @param tempUse Whether to use temporary storage.
     * @returns A list of [x,y...].
     * @zh 将 [x,y...] 列表转换为 Point 列表。
     * @param pList Point列表。
     * @param tempUse 是否使用临时存储。
     * @returns [x,y...]列表
     */
    static pListToPointList(pList: any[], tempUse?: boolean): any[] {
        var i: number, len: number = pList.length / 2, rst: any[] = GrahamScan._getPoints(len, tempUse, _tempPointList);
        for (i = 0; i < len; i++) {
            rst[i].setTo(pList[i + i], pList[i + i + 1]);
        }
        return rst;
    }

    /**
     * @en Convert a list of Points to a [x,y...] list.
     * @param pointList The list of Points.
     * @returns The [x,y...] list.
     * @zh 将 Point 列表转换为 [x,y...] 列表。
     * @param pointList Point列表
     * @returns [x,y...]列表
     */
    static pointListToPlist(pointList: any[]): any[] {
        var i: number, len: number = pointList.length, rst: any[] = _temPList, tPoint: Point;
        rst.length = 0;
        for (i = 0; i < len; i++) {
            tPoint = pointList[i];
            rst.push(tPoint.x, tPoint.y);
        }
        return rst;
    }

    /**
     * @en Find the minimum polygon vertex set that includes all points.
     * @param pList The [x,y...] list.
     * @zh 寻找包括所有点的最小多边形顶点集合。
     * @param pList 形如[x0,y0,x1,y1...]的点列表。
     */
    static scanPList(pList: number[]): void {
        Utils.copyArray(pList, GrahamScan.pointListToPlist(GrahamScan.scan(GrahamScan.pListToPointList(pList, true))));
    }

    /**
     * @en Find the minimum polygon vertex set that includes all points.
     * @param PointSet The Point list.
     * @returns The minimum polygon vertex set.
     * @zh 寻找包括所有点的最小多边形顶点集合。
     * @param PointSet Point列表
     * @return 最小多边形顶点集合
     */
    static scan(PointSet: any[]): any[] {
        let i: number, j: number, k: number = 0, top: number = 2;
        let n: number = PointSet.length;
        let _tmpDic: any = {};
        let ch = _temArr;
        ch.length = 0;
        n = PointSet.length;
        for (i = n - 1; i >= 0; i--) {
            let tmp = PointSet[i];
            let key = tmp.x + "_" + tmp.y;
            if (!(key in _tmpDic)) {
                _tmpDic[key] = true;
                ch.push(tmp);
            }
        }
        n = ch.length;
        Utils.copyArray(PointSet, ch);
        //			PointSet=ch;
        //			n=PointSet.length;
        //找到最下且偏左的那个点  
        for (i = 1; i < n; i++) {
            if ((PointSet[i].y < PointSet[k].y) || ((PointSet[i].y == PointSet[k].y) && (PointSet[i].x < PointSet[k].x)))
                k = i;
        }
        //将这个点指定为PointSet[0]  
        let tmp = PointSet[0];
        PointSet[0] = PointSet[k];
        PointSet[k] = tmp;
        //按极角从小到大,距离偏短进行排序  
        for (i = 1; i < n - 1; i++) {
            k = i;
            for (j = i + 1; j < n; j++) {
                if ((multiply(PointSet[j], PointSet[k], PointSet[0]) > 0) || ((multiply(PointSet[j], PointSet[k], PointSet[0]) == 0) && (dis(PointSet[0], PointSet[j]) < dis(PointSet[0], PointSet[k]))))
                    k = j;//k保存极角最小的那个点,或者相同距离原点最近  
            }
            let tmp = PointSet[i];
            PointSet[i] = PointSet[k];
            PointSet[k] = tmp;
        }
        //第三个点先入栈 
        ch.length = 0;
        //trace("scan:",PointSet[0],PointSet[1],PointSet[2]);
        if (PointSet.length < 3) {
            return Utils.copyArray(ch, PointSet);
        }
        ch.push(PointSet[0], PointSet[1], PointSet[2]);
        //ch=[PointSet[0],PointSet[1],PointSet[2]];
        //判断与其余所有点的关系  
        for (i = 3; i < n; i++) {
            //不满足向左转的关系,栈顶元素出栈  
            while (ch.length >= 2 && multiply(PointSet[i], ch[ch.length - 1], ch[ch.length - 2]) >= 0)
                ch.pop();
            //当前点与栈内所有点满足向左关系,因此入栈.  
            PointSet[i] && ch.push(PointSet[i]);
        }
        return ch;
    }

}

const _mPointList: Point[] = [];
const _tempPointList: Point[] = [];
const _temPList: any[] = [];
const _temArr: Point[] = [];

function multiply(p1: Point, p2: Point, p0: Point): number {
    return ((p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y));
}

function dis(p1: Point, p2: Point): number {
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
}