import { BoundBox } from "../math/BoundBox";
import { Vector3 } from "../math/Vector3";
/**
 * <code>Bounds</code> 类用于创建包围体。
 */
export class Bounds {
    /**
     * 创建一个 <code>Bounds</code> 实例。
     * @param	min  min 最小坐标
     * @param	max  max 最大坐标。
     */
    constructor(min, max) {
        /**@private */
        this._updateFlag = 0;
        /**@private	*/
        this._center = new Vector3();
        /**@private	*/
        this._extent = new Vector3();
        /**@private	*/
        this._boundBox = new BoundBox(new Vector3(), new Vector3());
        min.cloneTo(this._boundBox.min);
        max.cloneTo(this._boundBox.max);
        this._setUpdateFlag(Bounds._UPDATE_CENTER | Bounds._UPDATE_EXTENT, true);
    }
    /**
     * 设置包围盒的最小点。
     * @param value	包围盒的最小点。
     */
    setMin(value) {
        var min = this._boundBox.min;
        if (value !== min)
            value.cloneTo(min);
        this._setUpdateFlag(Bounds._UPDATE_CENTER | Bounds._UPDATE_EXTENT, true);
        this._setUpdateFlag(Bounds._UPDATE_MIN, false);
    }
    /**
     * 获取包围盒的最小点。
     * @return	包围盒的最小点。
     */
    getMin() {
        var min = this._boundBox.min;
        if (this._getUpdateFlag(Bounds._UPDATE_MIN)) {
            this._getMin(this.getCenter(), this.getExtent(), min);
            this._setUpdateFlag(Bounds._UPDATE_MIN, false);
        }
        return min;
    }
    /**
     * 设置包围盒的最大点。
     * @param value	包围盒的最大点。
     */
    setMax(value) {
        var max = this._boundBox.max;
        if (value !== max)
            value.cloneTo(max);
        this._setUpdateFlag(Bounds._UPDATE_CENTER | Bounds._UPDATE_EXTENT, true);
        this._setUpdateFlag(Bounds._UPDATE_MAX, false);
    }
    /**
     * 获取包围盒的最大点。
     * @return	包围盒的最大点。
     */
    getMax() {
        var max = this._boundBox.max;
        if (this._getUpdateFlag(Bounds._UPDATE_MAX)) {
            this._getMax(this.getCenter(), this.getExtent(), max);
            this._setUpdateFlag(Bounds._UPDATE_MAX, false);
        }
        return max;
    }
    /**
     * 设置包围盒的中心点。
     * @param value	包围盒的中心点。
     */
    setCenter(value) {
        if (value !== this._center)
            value.cloneTo(this._center);
        this._setUpdateFlag(Bounds._UPDATE_MIN | Bounds._UPDATE_MAX, true);
        this._setUpdateFlag(Bounds._UPDATE_CENTER, false);
    }
    /**
     * 获取包围盒的中心点。
     * @return	包围盒的中心点。
     */
    getCenter() {
        if (this._getUpdateFlag(Bounds._UPDATE_CENTER)) {
            this._getCenter(this.getMin(), this.getMax(), this._center);
            this._setUpdateFlag(Bounds._UPDATE_CENTER, false);
        }
        return this._center;
    }
    /**
     * 设置包围盒的范围。
     * @param value	包围盒的范围。
     */
    setExtent(value) {
        if (value !== this._extent)
            value.cloneTo(this._extent);
        this._setUpdateFlag(Bounds._UPDATE_MIN | Bounds._UPDATE_MAX, true);
        this._setUpdateFlag(Bounds._UPDATE_EXTENT, false);
    }
    /**
     * 获取包围盒的范围。
     * @return	包围盒的范围。
     */
    getExtent() {
        if (this._getUpdateFlag(Bounds._UPDATE_EXTENT)) {
            this._getExtent(this.getMin(), this.getMax(), this._extent);
            this._setUpdateFlag(Bounds._UPDATE_EXTENT, false);
        }
        return this._extent;
    }
    /**
     * @private
     */
    _getUpdateFlag(type) {
        return (this._updateFlag & type) != 0;
    }
    /**
     * @private
     */
    _setUpdateFlag(type, value) {
        if (value)
            this._updateFlag |= type;
        else
            this._updateFlag &= ~type;
    }
    /**
     * @private
     */
    _getCenter(min, max, out) {
        Vector3.add(min, max, out);
        Vector3.scale(out, 0.5, out);
    }
    /**
     * @private
     */
    _getExtent(min, max, out) {
        Vector3.subtract(max, min, out);
        Vector3.scale(out, 0.5, out);
    }
    /**
     * @private
     */
    _getMin(center, extent, out) {
        Vector3.subtract(center, extent, out);
    }
    /**
     * @private
     */
    _getMax(center, extent, out) {
        Vector3.add(center, extent, out);
    }
    /**
     * @private
     */
    _rotateExtents(extents, rotation, out) {
        var extentsX = extents.x;
        var extentsY = extents.y;
        var extentsZ = extents.z;
        var matE = rotation.elements;
        out.x = Math.abs(matE[0] * extentsX) + Math.abs(matE[4] * extentsY) + Math.abs(matE[8] * extentsZ);
        out.y = Math.abs(matE[1] * extentsX) + Math.abs(matE[5] * extentsY) + Math.abs(matE[9] * extentsZ);
        out.z = Math.abs(matE[2] * extentsX) + Math.abs(matE[6] * extentsY) + Math.abs(matE[10] * extentsZ);
    }
    /**
     * @private
     */
    _tranform(matrix, out) {
        var outCen = out._center;
        var outExt = out._extent;
        Vector3.transformCoordinate(this.getCenter(), matrix, outCen);
        this._rotateExtents(this.getExtent(), matrix, outExt);
        out._boundBox.setCenterAndExtent(outCen, outExt);
        out._updateFlag = 0;
    }
    /**
     * @private
     */
    _getBoundBox() {
        var min = this._boundBox.min;
        if (this._getUpdateFlag(Bounds._UPDATE_MIN)) {
            this._getMin(this.getCenter(), this.getExtent(), min);
            this._setUpdateFlag(Bounds._UPDATE_MIN, false);
        }
        var max = this._boundBox.max;
        if (this._getUpdateFlag(Bounds._UPDATE_MAX)) {
            this._getMax(this.getCenter(), this.getExtent(), max);
            this._setUpdateFlag(Bounds._UPDATE_MAX, false);
        }
        return this._boundBox;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destBounds = destObject;
        this.getMin().cloneTo(destBounds._boundBox.min);
        this.getMax().cloneTo(destBounds._boundBox.max);
        this.getCenter().cloneTo(destBounds._center);
        this.getExtent().cloneTo(destBounds._extent);
        destBounds._updateFlag = 0;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new Bounds(new Vector3(), new Vector3());
        this.cloneTo(dest);
        return dest;
    }
}
/**@private */
Bounds._UPDATE_MIN = 0x01;
/**@private */
Bounds._UPDATE_MAX = 0x02;
/**@private */
Bounds._UPDATE_CENTER = 0x04;
/**@private */
Bounds._UPDATE_EXTENT = 0x08;
