/**
     * @private
     * 计算贝塞尔曲线的工具类。
     */
export declare class Bezier {
    /**
     * 工具类单例
     */
    static I: Bezier;
    /** @private */
    private _controlPoints;
    /** @private */
    private _calFun;
    /** @private */
    private _switchPoint;
    /**
     * 计算二次贝塞尔点。
     */
    getPoint2(t: number, rst: any[]): void;
    /**
     * 计算三次贝塞尔点
     */
    getPoint3(t: number, rst: any[]): void;
    /**
     * 计算贝塞尔点序列
     */
    insertPoints(count: number, rst: any[]): void;
    /**
     * 获取贝塞尔曲线上的点。
     * @param pList 控制点[x0,y0,x1,y1...]
     * @param inSertCount 每次曲线的插值数量
     */
    getBezierPoints(pList: any[], inSertCount?: number, count?: number): any[];
}
