import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { IClone } from "../../utils/IClone";
import { BoundBox } from "./BoundBox";

/**
 * @en BoundsImpl class is used to create a bounding box.
 * @zh BoundsImpl 类用于创建包围体。
 */
export class BoundsImpl implements IClone {
    /**@internal */
    static _UPDATE_MIN: number = 0x01;
    /**@internal */
    static _UPDATE_MAX: number = 0x02;
    /**@internal */
    static _UPDATE_CENTER: number = 0x04;
    /**@internal */
    static _UPDATE_EXTENT: number = 0x08;
    /**@internal	*/
    protected _updateFlag: number = 0;
    /**@internal	*/
    _center: Vector3 = new Vector3();
    /**@internal	*/
    _extent: Vector3 = new Vector3();
    /**@internal	*/
    _boundBox: BoundBox = new BoundBox(new Vector3(), new Vector3());

    /**
     * @en The minimum point of the bounding box.
     * @zh 包围盒的最小点。
     */
    get min() {
        return this.getMin();
    }

    set min(value: Vector3) {
        this.setMin(value);
    }

    /**
     * @en The maximum point of the bounding box.
     * @zh 包围盒的最大点。
     */
    get max() {
        return this.getMax();
    }

    set max(value: Vector3) {
        this.setMax(value);
    }

    /**
     * @en Sets the minimum point of the bounding box.
     * @param value The new minimum point to set for the bounding box.
     * @zh 设置包围盒的最小点。
     * @param value 为包围盒设置的新最小点。
     */
    setMin(value: Vector3): void {
        var min: Vector3 = this._boundBox.min;
        if (value !== min)
            value.cloneTo(min);
        this._setUpdateFlag(BoundsImpl._UPDATE_CENTER | BoundsImpl._UPDATE_EXTENT, true);
        this._setUpdateFlag(BoundsImpl._UPDATE_MIN, false);
    }

    /**
     * @en Gets the minimum point of the bounding box.
     * @return The minimum point of the bounding box.
     * @zh 获取包围盒的最小点。
     * @return 包围盒的最小点。
     */
    getMin(): Vector3 {
        var min: Vector3 = this._boundBox.min;
        if (this._getUpdateFlag(BoundsImpl._UPDATE_MIN)) {
            this._getMin(this.getCenter(), this.getExtent(), min);
            this._setUpdateFlag(BoundsImpl._UPDATE_MIN, false);
        }
        return min;
    }

    /**
     * @en Sets the maximum point of the bounding box.
     * @param value The new maximum point to set for the bounding box.
     * @zh 设置包围盒的最大点。
     * @param value	要设置的包围盒的新最大点。
     */
    setMax(value: Vector3): void {
        var max: Vector3 = this._boundBox.max;
        if (value !== max)
            value.cloneTo(max);
        this._setUpdateFlag(BoundsImpl._UPDATE_CENTER | BoundsImpl._UPDATE_EXTENT, true);
        this._setUpdateFlag(BoundsImpl._UPDATE_MAX, false);
    }

    /**
     * @en Gets the maximum point of the bounding box.
     * @return The maximum point of the bounding box.
     * @zh 获取包围盒的最大点。
     * @return	包围盒的最大点。
     */
    getMax(): Vector3 {
        var max: Vector3 = this._boundBox.max;
        if (this._getUpdateFlag(BoundsImpl._UPDATE_MAX)) {
            this._getMax(this.getCenter(), this.getExtent(), max);
            this._setUpdateFlag(BoundsImpl._UPDATE_MAX, false);
        }
        return max;
    }

    /**
     * @en Sets the center point of the bounding box.
     * @param value The new center point to set for the bounding box.
     * @zh 设置包围盒的中心点。
     * @param value	要设置的包围盒的新中心点。
     */
    setCenter(value: Vector3): void {
        if (value !== this._center)
            value.cloneTo(this._center);
        this._getMin(this._center, this._extent, this._boundBox.min);
        this._getMax(this._center, this._extent, this._boundBox.max);
        this._setUpdateFlag(BoundsImpl._UPDATE_CENTER | BoundsImpl._UPDATE_MIN | BoundsImpl._UPDATE_MAX, false);
    }

    /**
     * @en Gets the center point of the bounding box.
     * @return The center point of the bounding box.
     * @zh 获取包围盒的中心点。
     * @return	包围盒的中心点。
     */
    getCenter(): Vector3 {
        if (this._getUpdateFlag(BoundsImpl._UPDATE_CENTER)) {
            this._getCenter(this.getMin(), this.getMax(), this._center);
            this._setUpdateFlag(BoundsImpl._UPDATE_CENTER, false);
        }
        return this._center;
    }

    /**
     * @en Sets the range of the bounding box.
     * @param value The new range to set for the bounding box.
     * @zh 设置包围盒的范围。
     * @param value	要设置的包围盒的新范围。
     */
    setExtent(value: Vector3): void {
        if (value !== this._extent)
            value.cloneTo(this._extent);
        this._getMin(this._center, this._extent, this._boundBox.min);
        this._getMax(this._center, this._extent, this._boundBox.max);
        this._setUpdateFlag(BoundsImpl._UPDATE_CENTER | BoundsImpl._UPDATE_MIN | BoundsImpl._UPDATE_MAX, false);
    }

    /**
     * @en Gets the range of the bounding box.
     * @return The range of the bounding box.
     * @zh 获取包围盒的范围。
     * @return	包围盒的范围。
     */
    getExtent(): Vector3 {
        if (this._getUpdateFlag(BoundsImpl._UPDATE_EXTENT)) {
            this._getExtent(this.getMin(), this.getMax(), this._extent);
            this._setUpdateFlag(BoundsImpl._UPDATE_EXTENT, false);
        }
        return this._extent;
    }

    /**
     * @en Constructor method.
     * @param	min  The minimum point of the bounding box.
     * @param	max  The maximum point of the bounding box.
     * @zh 构造方法。
     * @param	min  min 最小坐标
     * @param	max  max 最大坐标。
     */
    constructor(min?: Vector3, max?: Vector3) {
        min && min.cloneTo(this._boundBox.min);
        max && max.cloneTo(this._boundBox.max);
        this._setUpdateFlag(BoundsImpl._UPDATE_MIN | BoundsImpl._UPDATE_MAX, false);
        this._setUpdateFlag(BoundsImpl._UPDATE_CENTER | BoundsImpl._UPDATE_EXTENT, true);
    }

    /**
     * 获得跟新标志
     * @internal
     * @param type 类型 
     * @return void
     */
    protected _getUpdateFlag(type: number): boolean {
        return (this._updateFlag & type) != 0;
    }

    /**
     * 设置跟新标志
     * @internal
     * @param type 类型 
     * @param value 值 
     * @return void
     */
    protected _setUpdateFlag(type: number, value: boolean): void {
        if (value)
            this._updateFlag |= type;
        else
            this._updateFlag &= ~type;
    }

    /**
     * 获得包围盒中心值
     * @internal
     * @param min 最小值
     * @param max 最大值
     * @param out 返回值
     * @return void
     */
    protected _getCenter(min: Vector3, max: Vector3, out: Vector3): void {
        Vector3.add(min, max, out);
        Vector3.scale(out, 0.5, out);
    }

    /**
     * 获得包围盒范围
     * @internal
     * @param min 最小值
     * @param max 最大值
     * @param out 返回值
     * @return void
     */
    protected _getExtent(min: Vector3, max: Vector3, out: Vector3): void {
        Vector3.subtract(max, min, out);
        Vector3.scale(out, 0.5, out);
    }

    /**
     * 获得包围盒最小值
     * @internal
     * @param center 中心点
     * @param extent 范围
     * @param out 返回值
     * @return void
     */
    protected _getMin(center: Vector3, extent: Vector3, out: Vector3): void {
        Vector3.subtract(center, extent, out);
    }

    /**
      * 获得包围盒最大值
      * @internal
      * @param center 中心点
      * @param extent 范围
      * @param out 返回值
      * @return void
      */
    protected _getMax(center: Vector3, extent: Vector3, out: Vector3): void {
        Vector3.add(center, extent, out);
    }

    /**
     * 旋转范围
     * @internal
     * @param extent 范围
     * @param rotation 旋转矩阵
     * @param out 返回值
     * @return void
     */
    protected _rotateExtents(extents: Vector3, rotation: Matrix4x4, out: Vector3): void {
        var extentsX: number = extents.x;
        var extentsY: number = extents.y;
        var extentsZ: number = extents.z;
        var matE: Float32Array = rotation.elements;
        out.x = Math.abs(matE[0] * extentsX) + Math.abs(matE[4] * extentsY) + Math.abs(matE[8] * extentsZ);
        out.y = Math.abs(matE[1] * extentsX) + Math.abs(matE[5] * extentsY) + Math.abs(matE[9] * extentsZ);
        out.z = Math.abs(matE[2] * extentsX) + Math.abs(matE[6] * extentsY) + Math.abs(matE[10] * extentsZ);
    }

    /**
     * 转换包围盒
     * @internal
     * @param matrix 转换矩阵
     * @param out 输出包围盒
     */
    _tranform(matrix: Matrix4x4, out: BoundsImpl): void {
        var outCen: Vector3 = out._center;
        var outExt: Vector3 = out._extent;

        Vector3.transformCoordinate(this.getCenter(), matrix, outCen);
        this._rotateExtents(this.getExtent(), matrix, outExt);

        out._boundBox.setCenterAndExtent(outCen, outExt);
        out._updateFlag = 0;
    }

    /**
     * 获得实际的包围值
     * @internal
     * @returns BoundBox
     */
    _getBoundBox(): BoundBox {
        if (this._updateFlag & BoundsImpl._UPDATE_MIN) {
            var min: Vector3 = this._boundBox.min;
            this._getMin(this.getCenter(), this.getExtent(), min);
            this._setUpdateFlag(BoundsImpl._UPDATE_MIN, false);
        }
        if (this._updateFlag & BoundsImpl._UPDATE_MAX) {
            var max: Vector3 = this._boundBox.max;
            this._getMax(this.getCenter(), this.getExtent(), max);
            this._setUpdateFlag(BoundsImpl._UPDATE_MAX, false);
        }
        return this._boundBox;
    }

    /**
     * @en Calculates the intersection volume between this bounds implementation and another `BoundsImpl` instance.
     * @param bounds The `BoundsImpl` instance to calculate the intersection with.
     * @returns -1 if the bounds do not intersect; when not 0, the return value is the intersecting volume
     * @zh 计算此边界实现与另一个 `BoundsImpl` 实例之间的相交体积。
     * @param bounds 要计算相交的 `BoundsImpl` 实例。
     * @returns -1 如果边界不相交；不为0的时候返回值为相交体积。
     */
    calculateBoundsintersection(bounds: BoundsImpl): number {
        var ownMax: Vector3 = this.getMax();
        var ownMin: Vector3 = this.getMin();
        var calMax: Vector3 = bounds.getMax();
        var calMin: Vector3 = bounds.getMin();
        var tempV0: Vector3 = TEMP_VECTOR3_MAX0;
        var tempV1: Vector3 = TEMP_VECTOR3_MAX1;
        var thisExtends: Vector3 = this.getExtent();
        var boundExtends: Vector3 = bounds.getExtent();
        tempV0.setValue(Math.max(ownMax.x, calMax.x) - Math.min(ownMin.x, calMin.x),
            Math.max(ownMax.y, calMax.y) - Math.min(ownMin.y, calMin.y),
            Math.max(ownMax.z, calMax.z) - Math.min(ownMin.z, calMin.z));
        tempV1.setValue((thisExtends.x + boundExtends.x) * 2.0,
            (thisExtends.y + boundExtends.y) * 2.0,
            (thisExtends.z + boundExtends.z) * 2.0);
        if ((tempV0.x) > (tempV1.x)) return -1;
        if ((tempV0.y) > (tempV1.y)) return -1;
        if ((tempV0.z) > (tempV1.z)) return -1;
        return (tempV1.x - tempV0.x) * (tempV1.y - tempV0.y) * (tempV1.z - tempV0.z);
    }


    /**
     * @en Clones the current bounding box into another object.
     * @param destObject The destination object to clone into.
     * @zh 将当前包围体克隆到另一个对象中。
     * @param destObject  克隆的目标对象。
     */
    cloneTo(destObject: BoundsImpl): void {
        this.getMin().cloneTo(destObject._boundBox.min);
        this.getMax().cloneTo(destObject._boundBox.max);
        this.getCenter().cloneTo(destObject._center);
        this.getExtent().cloneTo(destObject._extent);
        destObject._updateFlag = 0;
    }

    /**
     * @en Creates a clone of the bounding box.
     * @return A new `BoundsImpl` instance that is a clone of the current bounding box.
     * @zh 创建当前包围体的克隆。
     * @return 一个新的 `BoundsImpl` 实例，是当前包围体的克隆。
     */
    clone(): any {
        var dest: BoundsImpl = new BoundsImpl(new Vector3(), new Vector3());
        this.cloneTo(dest);
        return dest;
    }
}

const TEMP_VECTOR3_MAX0 = new Vector3();
const TEMP_VECTOR3_MAX1 = new Vector3();