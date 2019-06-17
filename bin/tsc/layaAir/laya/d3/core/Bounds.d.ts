import { IClone } from "././IClone";
import { BoundBox } from "../math/BoundBox";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
/**
 * <code>Bounds</code> 类用于创建包围体。
 */
export declare class Bounds implements IClone {
    /**@private */
    static _UPDATE_MIN: number;
    /**@private */
    static _UPDATE_MAX: number;
    /**@private */
    static _UPDATE_CENTER: number;
    /**@private */
    static _UPDATE_EXTENT: number;
    /**@private */
    private _updateFlag;
    /**@private	*/
    _center: Vector3;
    /**@private	*/
    _extent: Vector3;
    /**@private	*/
    _boundBox: BoundBox;
    /**
     * 设置包围盒的最小点。
     * @param value	包围盒的最小点。
     */
    setMin(value: Vector3): void;
    /**
     * 获取包围盒的最小点。
     * @return	包围盒的最小点。
     */
    getMin(): Vector3;
    /**
     * 设置包围盒的最大点。
     * @param value	包围盒的最大点。
     */
    setMax(value: Vector3): void;
    /**
     * 获取包围盒的最大点。
     * @return	包围盒的最大点。
     */
    getMax(): Vector3;
    /**
     * 设置包围盒的中心点。
     * @param value	包围盒的中心点。
     */
    setCenter(value: Vector3): void;
    /**
     * 获取包围盒的中心点。
     * @return	包围盒的中心点。
     */
    getCenter(): Vector3;
    /**
     * 设置包围盒的范围。
     * @param value	包围盒的范围。
     */
    setExtent(value: Vector3): void;
    /**
     * 获取包围盒的范围。
     * @return	包围盒的范围。
     */
    getExtent(): Vector3;
    /**
     * 创建一个 <code>Bounds</code> 实例。
     * @param	min  min 最小坐标
     * @param	max  max 最大坐标。
     */
    constructor(min: Vector3, max: Vector3);
    /**
     * @private
     */
    private _getUpdateFlag;
    /**
     * @private
     */
    private _setUpdateFlag;
    /**
     * @private
     */
    private _getCenter;
    /**
     * @private
     */
    private _getExtent;
    /**
     * @private
     */
    private _getMin;
    /**
     * @private
     */
    private _getMax;
    /**
     * @private
     */
    private _rotateExtents;
    /**
     * @private
     */
    _tranform(matrix: Matrix4x4, out: Bounds): void;
    /**
     * @private
     */
    _getBoundBox(): BoundBox;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
