
import { BoundBox } from "../../../../d3/math/BoundBox";
import { Bounds } from "../../../../d3/math/Bounds";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector3 } from "../../../../maths/Vector3";
import { IClone } from "../../../../utils/IClone";
import { NativeMemory } from "../NativeMemory";



export class NativeBounds implements IClone {

    /**@internal */
    static BOUNDS_MIN_DATAOFFSET: number = 0;
    /**@internal */
    static BOUNDS_MAX_DATAOFFSET: number = 3;
    /**@internal */
    static BOUNDS_CENTER_DATAOFFSET: number = 6;
    /**@internal */
    static BOUNDS_EXTENT_DATAOFFSET: number = 9;
    /**@internal */
    static BOUNDS_SHARE_MEMORY_SIZE: number = 12;
    /**@internal	*/
    nativeMemory: NativeMemory;
    /**@internal	*/
    float32Array: Float32Array;
    /**@internal	*/
    _nativeObj: any;
    /**@internal	*/
    _center: Vector3 = new Vector3();
    /**@internal	*/
    _extent: Vector3 = new Vector3();
    /**@internal */
    private _boundBox: BoundBox = new BoundBox(new Vector3(), new Vector3());

    get min() {
        return this.getMin();
    }

    set min(value: Vector3) {
        this.setMin(value);
    }

    get max() {
        return this.getMax();
    }

    set max(value: Vector3) {
        this.setMax(value);
    }

    /**
     * 设置包围盒的最小点。
     * @param value	包围盒的最小点。
     */
    setMin(value: Vector3): void {
        let index = NativeBounds.BOUNDS_MIN_DATAOFFSET;
        this.float32Array[index] = value.x;
        this.float32Array[index + 1] = value.y;
        this.float32Array[index + 2] = value.z;
        this._nativeObj.setMin();
    }

    /**
     * 获取包围盒的最小点。
     * @return	包围盒的最小点。
     */
    getMin(): Vector3 {
        var min: Vector3 = this._boundBox.min;
        this._nativeObj.getMin();
        let index = NativeBounds.BOUNDS_MIN_DATAOFFSET;
        min.x = this.float32Array[index];
        min.y = this.float32Array[index + 1];
        min.z = this.float32Array[index + 2];
        return min;
    }

    /**
     * 设置包围盒的最大点。
     * @param value	包围盒的最大点。
     */
    setMax(value: Vector3): void {
        let index = NativeBounds.BOUNDS_MAX_DATAOFFSET;
        this.float32Array[index] = value.x;
        this.float32Array[index + 1] = value.y;
        this.float32Array[index + 2] = value.z;
        this._nativeObj.setMax();
    }

    /**
     * 获取包围盒的最大点。
     * @return	包围盒的最大点。
     */
    getMax(): Vector3 {
        var max: Vector3 = this._boundBox.max;
        this._nativeObj.getMax();
        let index = NativeBounds.BOUNDS_MAX_DATAOFFSET;
        max.x = this.float32Array[index];
        max.y = this.float32Array[index + 1];
        max.z = this.float32Array[index + 2];
        return max;
    }

    /**
     * 设置包围盒的中心点。
     * @param value	包围盒的中心点。
     */
    setCenter(value: Vector3): void {
        let index = NativeBounds.BOUNDS_CENTER_DATAOFFSET;
        this.float32Array[index] = value.x;
        this.float32Array[index + 1] = value.y;
        this.float32Array[index + 2] = value.z;
        this._nativeObj.setCenter();
    }

    /**
     * 获取包围盒的中心点。
     * @return	包围盒的中心点。
     */
    getCenter(): Vector3 {
        var center: Vector3 = this._center;
        this._nativeObj.getCenter();
        let index = NativeBounds.BOUNDS_CENTER_DATAOFFSET;
        center.x = this.float32Array[index];
        center.y = this.float32Array[index + 1];
        center.z = this.float32Array[index + 2];
        return center;
    }

    /**
     * 设置包围盒的范围。
     * @param value	包围盒的范围。
     */
    setExtent(value: Vector3): void {
        let index = NativeBounds.BOUNDS_EXTENT_DATAOFFSET;
        this.float32Array[index] = value.x;
        this.float32Array[index + 1] = value.y;
        this.float32Array[index + 2] = value.z;
        this._nativeObj.setExtent();
    }

    /**
     * 获取包围盒的范围。
     * @return	包围盒的范围。
     */
    getExtent(): Vector3 {
        var extent: Vector3 = this._extent;
        this._nativeObj.getExtent();
        let index = NativeBounds.BOUNDS_EXTENT_DATAOFFSET;
        extent.x = this.float32Array[index];
        extent.y = this.float32Array[index + 1];
        extent.z = this.float32Array[index + 2];
        return extent;
    }

    /**
     * 创建一个 <code>Bounds</code> 实例。
     * @param min  min 最小坐标
     * @param max  max 最大坐标。
     */
    constructor(min?: Vector3, max?: Vector3) {
        this.nativeMemory = new NativeMemory(NativeBounds.BOUNDS_SHARE_MEMORY_SIZE * 4, true);
        this.float32Array = this.nativeMemory.float32Array;
        this._nativeObj = new (window as any).conchBounds(this.nativeMemory._buffer);
        min && this.setMin(min);
        max && this.setMax(max);
    }
    /**
     * @internal
     */
    _tranform(matrix: Matrix4x4, out: NativeBounds): void {
        this._nativeObj._tranform(matrix.elements, out._nativeObj);
    }

    _getBoundBox(): BoundBox {
        this._nativeObj._getBoundBox();
        let minIndex = NativeBounds.BOUNDS_MIN_DATAOFFSET;
        let maxIndex = NativeBounds.BOUNDS_MAX_DATAOFFSET;
        this._boundBox.min.x = this.float32Array[minIndex];
        this._boundBox.min.y = this.float32Array[minIndex + 1];
        this._boundBox.min.z = this.float32Array[minIndex + 2];
        this._boundBox.max.x = this.float32Array[maxIndex];
        this._boundBox.max.y = this.float32Array[maxIndex + 1];
        this._boundBox.max.z = this.float32Array[maxIndex + 2];
        return this._boundBox;
    }
    /**
     * @returns -1为不相交 不为0的时候返回值为相交体积
     */
    calculateBoundsintersection(bounds: Bounds): number {
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
     * 克隆。
     * @param destObject 克隆源。
     */
    cloneTo(destObject: NativeBounds): void {
        this._nativeObj.cloneTo(destObject._nativeObj);
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest: NativeBounds = new NativeBounds(new Vector3(), new Vector3());
        this.cloneTo(dest);
        return dest;
    }

}
const TEMP_VECTOR3_MAX0 = new Vector3();
const TEMP_VECTOR3_MAX1 = new Vector3();