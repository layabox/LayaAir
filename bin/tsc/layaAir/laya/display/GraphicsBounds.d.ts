import { Rectangle } from "../maths/Rectangle";
/**
 * @private
 * Graphic bounds数据类
 */
export declare class GraphicsBounds {
    /**@private */
    private static _tempMatrix;
    /**@private */
    private static _initMatrix;
    /**@private */
    private static _tempPoints;
    /**@private */
    private static _tempMatrixArrays;
    /**@private */
    private static _tempCmds;
    /**@private */
    private _temp;
    /**@private */
    private _bounds;
    /**@private */
    private _rstBoundPoints;
    /**@private */
    private _cacheBoundsType;
    /**
     * 销毁
     */
    destroy(): void;
    /**
     * 创建
     */
    static create(): GraphicsBounds;
    /**
     * 重置数据
     */
    reset(): void;
    /**
     * 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * @return 位置与宽高组成的 一个 Rectangle 对象。
     */
    getBounds(realSize?: boolean): Rectangle;
    /**
     * @private
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * 获取端点列表。
     */
    getBoundPoints(realSize?: boolean): any[];
    private _getCmdPoints;
    private _switchMatrix;
    private static _addPointArrToRst;
    private static _addPointToRst;
    /**
     * 获得drawPie命令可能的产生的点。注意 这里只假设用在包围盒计算上。
     * @param	x
     * @param	y
     * @param	radius
     * @param	startAngle
     * @param	endAngle
     * @return
     */
    private _getPiePoints;
    private _getPathPoints;
}
