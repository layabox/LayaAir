import { NativeMemory } from "../../../../RenderEngine/RenderEngine/NativeGLEngine/CommonMemory/NativeMemory";
import { BoundBox } from "../../../../d3/math/BoundBox";
import { Bounds } from "../../../../d3/math/Bounds";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector3 } from "../../../../maths/Vector3";
import { IClone } from "../../../../utils/IClone";



export class NativeBounds implements IClone {

    /**native Share Memory */
    static MemoryBlock_size: number = Math.max(6 * 8, 16 * 4);
    /**@internal	*/
    nativeMemory: NativeMemory;
    /**@internal	*/
    float32Array: Float32Array;
    /**@internal	*/
    float64Array: Float64Array;
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
        this.float64Array[0] = value.x;
        this.float64Array[1] = value.y;
        this.float64Array[2] = value.z;
        this._nativeObj.setMin();
    }

    /**
     * 获取包围盒的最小点。
     * @return	包围盒的最小点。
     */
    getMin(): Vector3 {
        var min: Vector3 = this._boundBox.min;
        this._nativeObj.getMin();
        min.x = this.float64Array[0];
        min.y = this.float64Array[1];
        min.z = this.float64Array[2];
        return min;
    }

    /**
     * 设置包围盒的最大点。
     * @param value	包围盒的最大点。
     */
    setMax(value: Vector3): void {
        this.float64Array[0] = value.x;
        this.float64Array[1] = value.y;
        this.float64Array[2] = value.z;
        this._nativeObj.setMax();
    }

    /**
     * 获取包围盒的最大点。
     * @return	包围盒的最大点。
     */
    getMax(): Vector3 {
        var max: Vector3 = this._boundBox.max;
        this._nativeObj.getMax();
        max.x = this.float64Array[0];
        max.y = this.float64Array[1];
        max.z = this.float64Array[2];
        return max;
    }

    /**
     * 设置包围盒的中心点。
     * @param value	包围盒的中心点。
     */
    setCenter(value: Vector3): void {
        this.float64Array[0] = value.x;
        this.float64Array[1] = value.y;
        this.float64Array[2] = value.z;
        this._nativeObj.setCenter();
    }

    /**
     * 获取包围盒的中心点。
     * @return	包围盒的中心点。
     */
    getCenter(): Vector3 {
        var center: Vector3 = this._center;
        this._nativeObj.getCenter();
        center.x = this.float64Array[0];
        center.y = this.float64Array[1];
        center.z = this.float64Array[2];
        return center;
    }

    /**
     * 设置包围盒的范围。
     * @param value	包围盒的范围。
     */
    setExtent(value: Vector3): void {
        this.float64Array[0] = value.x;
        this.float64Array[1] = value.y;
        this.float64Array[2] = value.z;
        this._nativeObj.setExtent();
    }

    /**
     * 获取包围盒的范围。
     * @return	包围盒的范围。
     */
    getExtent(): Vector3 {
        var extent: Vector3 = this._extent;
        this._nativeObj.getExtent();
        extent.x = this.float64Array[0];
        extent.y = this.float64Array[1];
        extent.z = this.float64Array[2];
        return extent;
    }

    /**
     * 创建一个 <code>Bounds</code> 实例。
     * @param	min  min 最小坐标
     * @param	max  max 最大坐标。
     */
    constructor(min?: Vector3, max?: Vector3) {
        this.nativeMemory = new NativeMemory(NativeBounds.MemoryBlock_size, true);
        this.float32Array = this.nativeMemory.float32Array;
        this.float64Array = this.nativeMemory.float64Array;
        this._nativeObj = new (window as any).conchBounds(this.nativeMemory._buffer);
        min && this.setMin(min);
        max && this.setMax(max);
    }
    /**
     * @internal
     */
    _tranform(matrix: Matrix4x4, out: NativeBounds): void {
        this.float32Array.set(matrix.elements);
        this._nativeObj._tranform(matrix, out._nativeObj);
    }

    _getBoundBox(): BoundBox {
        this._nativeObj._getBoundBox();
        this._boundBox.min.x = this.float64Array[0];
        this._boundBox.min.y = this.float64Array[1];
        this._boundBox.min.z = this.float64Array[2];
        this._boundBox.max.x = this.float64Array[3];
        this._boundBox.max.y = this.float64Array[4];
        this._boundBox.max.z = this.float64Array[5];
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
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void {
        var destBounds: NativeBounds = (<NativeBounds>destObject);
        this._nativeObj.cloneTo(destBounds._nativeObj);
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: NativeBounds = new NativeBounds(new Vector3(), new Vector3());
        this.cloneTo(dest);
        return dest;
    }

}
const TEMP_VECTOR3_MAX0 = new Vector3();
const TEMP_VECTOR3_MAX1 = new Vector3();