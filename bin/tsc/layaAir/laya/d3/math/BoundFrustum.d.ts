import { Vector3 } from "././Vector3";
import { Matrix4x4 } from "././Matrix4x4";
import { Plane } from "././Plane";
import { BoundBox } from "././BoundBox";
import { BoundSphere } from "././BoundSphere";
/**
     * <code>BoundFrustum</code> 类用于创建锥截体。
     */
export declare class BoundFrustum {
    /** @private */
    private static _tempV30;
    /** @private */
    private static _tempV31;
    /** @private */
    private static _tempV32;
    /** @private */
    private static _tempV33;
    /** @private */
    private static _tempV34;
    /** @private */
    private static _tempV35;
    /** @private */
    private static _tempV36;
    /** @private */
    private static _tempV37;
    /**4x4矩阵*/
    private _matrix;
    /**近平面*/
    private _near;
    /**远平面*/
    private _far;
    /**左平面*/
    private _left;
    /**右平面*/
    private _right;
    /**顶平面*/
    private _top;
    /**底平面*/
    private _bottom;
    /**
     * 创建一个 <code>BoundFrustum</code> 实例。
     * @param	matrix 锥截体的描述4x4矩阵。
     */
    constructor(matrix: Matrix4x4);
    /**
     * 获取描述矩阵。
     * @return  描述矩阵。
     */
    /**
    * 设置描述矩阵。
    * @param matrix 描述矩阵。
    */
    matrix: Matrix4x4;
    /**
     * 获取近平面。
     * @return  近平面。
     */
    readonly near: Plane;
    /**
     * 获取远平面。
     * @return  远平面。
     */
    readonly far: Plane;
    /**
     * 获取左平面。
     * @return  左平面。
     */
    readonly left: Plane;
    /**
     * 获取右平面。
     * @return  右平面。
     */
    readonly right: Plane;
    /**
     * 获取顶平面。
     * @return  顶平面。
     */
    readonly top: Plane;
    /**
     * 获取底平面。
     * @return  底平面。
     */
    readonly bottom: Plane;
    /**
     * 判断是否与其他锥截体相等。
     * @param	other 锥截体。
     */
    equalsBoundFrustum(other: BoundFrustum): boolean;
    /**
     * 判断是否与其他对象相等。
     * @param	obj 对象。
     */
    equalsObj(obj: any): boolean;
    /**
     * 获取锥截体的任意一平面。
     * 0:近平面
     * 1:远平面
     * 2:左平面
     * 3:右平面
     * 4:顶平面
     * 5:底平面
     * @param	index 索引。
     */
    getPlane(index: number): Plane;
    /**
     * 根据描述矩阵获取锥截体的6个面。
     * @param  m 描述矩阵。
     * @param  np   近平面。
     * @param  fp    远平面。
     * @param  lp   左平面。
     * @param  rp  右平面。
     * @param  tp    顶平面。
     * @param  bp 底平面。
     */
    private static _getPlanesFromMatrix;
    /**
     * 锥截体三个相交平面的交点。
     * @param  p1  平面1。
     * @param  p2  平面2。
     * @param  p3  平面3。
     */
    private static _get3PlaneInterPoint;
    /**
     * 锥截体的8个顶点。
     * @param  corners  返回顶点的输出队列。
     */
    getCorners(corners: Vector3[]): void;
    /**
     * 与点的位置关系。返回-1,包涵;0,相交;1,不相交
     * @param  point  点。
     */
    containsPoint(point: Vector3): number;
    /**
     * 与包围盒的位置关系。返回-1,包涵;0,相交;1,不相交
     * @param  box  包围盒。
     */
    containsBoundBox(box: BoundBox): number;
    /**
     * 与包围球的位置关系。返回-1,包涵;0,相交;1,不相交
     * @param  sphere  包围球。
     */
    containsBoundSphere(sphere: BoundSphere): number;
}
