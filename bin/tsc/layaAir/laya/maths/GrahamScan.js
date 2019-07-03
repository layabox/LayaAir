import { Point } from "./Point";
import { Utils } from "../utils/Utils";
/**
 * @private
 * 凸包算法。
 */
export class GrahamScan {
    static multiply(p1, p2, p0) {
        return ((p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y));
    }
    /**
     * 计算两个点的距离。
     * @param	p1
     * @param	p2
     * @return
     */
    static dis(p1, p2) {
        return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
    }
    static _getPoints(count, tempUse = false, rst = null) {
        if (!GrahamScan._mPointList)
            GrahamScan._mPointList = [];
        while (GrahamScan._mPointList.length < count)
            GrahamScan._mPointList.push(new Point());
        if (!rst)
            rst = [];
        rst.length = 0;
        if (tempUse) {
            //				rst=_mPointList.slice(0,count);
            GrahamScan.getFrom(rst, GrahamScan._mPointList, count);
        }
        else {
            //				rst=_mPointList.splice(0,count);
            GrahamScan.getFromR(rst, GrahamScan._mPointList, count);
        }
        return rst;
    }
    /**
     * 将数组 src 从索引0位置 依次取 cout 个项添加至 tst 数组的尾部。
     * @param	rst 原始数组，用于添加新的子元素。
     * @param	src 用于取子元素的数组。
     * @param	count 需要取得子元素个数。
     * @return 添加完子元素的 rst 对象。
     */
    static getFrom(rst, src, count) {
        var i;
        for (i = 0; i < count; i++) {
            rst.push(src[i]);
        }
        return rst;
    }
    /**
     * 将数组 src 从末尾索引位置往头部索引位置方向 依次取 cout 个项添加至 tst 数组的尾部。
     * @param	rst 原始数组，用于添加新的子元素。
     * @param	src 用于取子元素的数组。
     * @param	count 需要取得子元素个数。
     * @return 添加完子元素的 rst 对象。
     */
    static getFromR(rst, src, count) {
        var i;
        for (i = 0; i < count; i++) {
            rst.push(src.pop());
        }
        return rst;
    }
    /**
     *  [x,y...]列表 转 Point列表
     * @param pList Point列表
     * @return [x,y...]列表
     */
    static pListToPointList(pList, tempUse = false) {
        var i, len = pList.length / 2, rst = GrahamScan._getPoints(len, tempUse, GrahamScan._tempPointList);
        for (i = 0; i < len; i++) {
            rst[i].setTo(pList[i + i], pList[i + i + 1]);
        }
        return rst;
    }
    /**
     * Point列表转[x,y...]列表
     * @param pointList Point列表
     * @return [x,y...]列表
     */
    static pointListToPlist(pointList) {
        var i, len = pointList.length, rst = GrahamScan._temPList, tPoint;
        rst.length = 0;
        for (i = 0; i < len; i++) {
            tPoint = pointList[i];
            rst.push(tPoint.x, tPoint.y);
        }
        return rst;
    }
    /**
     *  寻找包括所有点的最小多边形顶点集合
     * @param pList 形如[x0,y0,x1,y1...]的点列表
     * @return  最小多边形顶点集合
     */
    static scanPList(pList) {
        return Utils.copyArray(pList, GrahamScan.pointListToPlist(GrahamScan.scan(GrahamScan.pListToPointList(pList, true))));
    }
    /**
     * 寻找包括所有点的最小多边形顶点集合
     * @param PointSet Point列表
     * @return 最小多边形顶点集合
     */
    static scan(PointSet) {
        var i, j, k = 0, top = 2, tmp, n = PointSet.length, ch;
        var _tmpDic = {};
        var key;
        ch = GrahamScan._temArr;
        ch.length = 0;
        n = PointSet.length;
        for (i = n - 1; i >= 0; i--) {
            tmp = PointSet[i];
            key = tmp.x + "_" + tmp.y;
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
        for (i = 1; i < n; i++)
            if ((PointSet[i].y < PointSet[k].y) || ((PointSet[i].y == PointSet[k].y) && (PointSet[i].x < PointSet[k].x)))
                k = i;
        //将这个点指定为PointSet[0]  
        tmp = PointSet[0];
        PointSet[0] = PointSet[k];
        PointSet[k] = tmp;
        //按极角从小到大,距离偏短进行排序  
        for (i = 1; i < n - 1; i++) {
            k = i;
            for (j = i + 1; j < n; j++)
                if ((GrahamScan.multiply(PointSet[j], PointSet[k], PointSet[0]) > 0) || ((GrahamScan.multiply(PointSet[j], PointSet[k], PointSet[0]) == 0) && (GrahamScan.dis(PointSet[0], PointSet[j]) < GrahamScan.dis(PointSet[0], PointSet[k]))))
                    k = j; //k保存极角最小的那个点,或者相同距离原点最近  
            tmp = PointSet[i];
            PointSet[i] = PointSet[k];
            PointSet[k] = tmp;
        }
        //第三个点先入栈  
        ch = GrahamScan._temArr;
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
            while (ch.length >= 2 && GrahamScan.multiply(PointSet[i], ch[ch.length - 1], ch[ch.length - 2]) >= 0)
                ch.pop();
            //当前点与栈内所有点满足向左关系,因此入栈.  
            PointSet[i] && ch.push(PointSet[i]);
        }
        return ch;
    }
}
GrahamScan._tempPointList = [];
GrahamScan._temPList = [];
GrahamScan._temArr = [];
