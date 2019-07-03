import { Point } from "./Point";
/**
 * @private
 * 凸包算法。
 */
export declare class GrahamScan {
    private static _mPointList;
    private static _tempPointList;
    private static _temPList;
    private static _temArr;
    static multiply(p1: Point, p2: Point, p0: Point): number;
    /**
     * 计算两个点的距离。
     * @param	p1
     * @param	p2
     * @return
     */
    static dis(p1: Point, p2: Point): number;
    private static _getPoints;
    /**
     * 将数组 src 从索引0位置 依次取 cout 个项添加至 tst 数组的尾部。
     * @param	rst 原始数组，用于添加新的子元素。
     * @param	src 用于取子元素的数组。
     * @param	count 需要取得子元素个数。
     * @return 添加完子元素的 rst 对象。
     */
    static getFrom(rst: any[], src: any[], count: number): any[];
    /**
     * 将数组 src 从末尾索引位置往头部索引位置方向 依次取 cout 个项添加至 tst 数组的尾部。
     * @param	rst 原始数组，用于添加新的子元素。
     * @param	src 用于取子元素的数组。
     * @param	count 需要取得子元素个数。
     * @return 添加完子元素的 rst 对象。
     */
    static getFromR(rst: any[], src: any[], count: number): any[];
    /**
     *  [x,y...]列表 转 Point列表
     * @param pList Point列表
     * @return [x,y...]列表
     */
    static pListToPointList(pList: any[], tempUse?: boolean): any[];
    /**
     * Point列表转[x,y...]列表
     * @param pointList Point列表
     * @return [x,y...]列表
     */
    static pointListToPlist(pointList: any[]): any[];
    /**
     *  寻找包括所有点的最小多边形顶点集合
     * @param pList 形如[x0,y0,x1,y1...]的点列表
     * @return  最小多边形顶点集合
     */
    static scanPList(pList: any[]): any[];
    /**
     * 寻找包括所有点的最小多边形顶点集合
     * @param PointSet Point列表
     * @return 最小多边形顶点集合
     */
    static scan(PointSet: any[]): any[];
}
