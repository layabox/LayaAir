import { IClone } from "../../../../d3/core/IClone";
import { BoundBox } from "../../../../d3/math/BoundBox";
import { Bounds } from "../../../../d3/math/Bounds";
import { Matrix4x4 } from "../../../../d3/math/Matrix4x4";
import { Vector3 } from "../../../../d3/math/Vector3";
import { NativeMemory } from "../CommonMemory/NativeMemory";


export class NativeBounds implements IClone {

    /**temp data */
    static TEMP_VECTOR3_MAX0: Vector3 = new Vector3();
    static TEMP_VECTOR3_MAX1: Vector3 = new Vector3();

    /**Bounds Update Flag */
    /**@internal */
    static _UPDATE_MIN: number = 0x01;
    /**@internal */
    static _UPDATE_MAX: number = 0x02;
    /**@internal */
    static _UPDATE_CENTER: number = 0x04;
    /**@internal */
    static _UPDATE_EXTENT: number = 0x08;
    /**@internal */
    static BOUNDS_CENTER_UPDATA_NATIVE = 0x10;
    /**@internal */
    static BOUNDS_EXTENT_UPDATA_NATIVE = 0x20;
    /**@internal */
    static BOUNDS_MIN_UPDATA_NATIVE = 0x40;
    /**@internal */
    static BOUNDS_MAX_UPDATA_NATIVE = 0x80;


    /**native Share Memory */
    private nativeMemory: NativeMemory;
    private float32Array: Float32Array;
    private int32Array: Int32Array;
    _nativeObj: any;

    /**TransForm Data Stride */
    static Bounds_Stride_UpdateFlag: number = 0;
    static Bounds_Stride_Center: number = 1;
    static Bounds_Stride_Extends: number = 4;
    static Bounds_Stride_Max: number = 7;
    static Bounds_Stride_Min: number = 10;
    static Bounds_MemoryBlock_size: number = 13;

    /**@internal	*/
    _center: Vector3 = new Vector3();
    /**@internal	*/
    _extent: Vector3 = new Vector3();
    /**bound box*/
    _boundBox: BoundBox = new BoundBox(new Vector3(), new Vector3());

    set(bounds: Bounds) {
        this.setMin(bounds.min);
        this.setMax(bounds.max);
    }
    /**
     * 设置包围盒的最小点。
     * @param value	包围盒的最小点。
     */
    setMin(value: Vector3): void {
        var min: Vector3 = this._boundBox.min;
        if (value !== min) {
            value.cloneTo(min);
            this.updateNativeData(NativeBounds.Bounds_Stride_Min, min);
            this._setUpdateFlag(NativeBounds.BOUNDS_MIN_UPDATA_NATIVE, false);
        }

        this._setUpdateFlag(NativeBounds._UPDATE_CENTER | NativeBounds._UPDATE_EXTENT, true);
        this._setUpdateFlag(NativeBounds._UPDATE_MIN, false);
    }

    /**
     * 获取包围盒的最小点。
     * @return	包围盒的最小点。
     */
    getMin(): Vector3 {
        var min: Vector3 = this._boundBox.min;
        if (this._getUpdateFlag(NativeBounds._UPDATE_MIN)) {
            this._getMin(this.getCenter(), this.getExtent(), min);
            this.updateNativeData(NativeBounds.Bounds_Stride_Min, min);
            this._setUpdateFlag(NativeBounds._UPDATE_MIN, false);
            this._setUpdateFlag(NativeBounds.BOUNDS_MIN_UPDATA_NATIVE, false);
        } else if (this._getUpdateFlag(NativeBounds.BOUNDS_MIN_UPDATA_NATIVE)) {
            const offset = NativeBounds.Bounds_Stride_Min;
            min.x = this.float32Array[offset];
            min.y = this.float32Array[offset + 1];
            min.z = this.float32Array[offset + 2];
            this._setUpdateFlag(NativeBounds.BOUNDS_MIN_UPDATA_NATIVE, false);
        }
        return min;
    }

    /**
     * 设置包围盒的最大点。
     * @param value	包围盒的最大点。
     */
    setMax(value: Vector3): void {
        var max: Vector3 = this._boundBox.max;
        if (value !== max) {
            value.cloneTo(max);
            this.updateNativeData(NativeBounds.Bounds_Stride_Max, max);
            this._setUpdateFlag(NativeBounds.BOUNDS_MAX_UPDATA_NATIVE, false);
        }

        this._setUpdateFlag(NativeBounds._UPDATE_CENTER | NativeBounds._UPDATE_EXTENT, true);
        this._setUpdateFlag(NativeBounds._UPDATE_MAX, false);
    }

    /**
     * 获取包围盒的最大点。
     * @return	包围盒的最大点。
     */
    getMax(): Vector3 {
        var max: Vector3 = this._boundBox.max;
        if (this._getUpdateFlag(NativeBounds._UPDATE_MAX)) {
            this._getMax(this.getCenter(), this.getExtent(), max);
            this.updateNativeData(NativeBounds.Bounds_Stride_Max, max);
            this._setUpdateFlag(NativeBounds._UPDATE_MAX, false);
            this._setUpdateFlag(NativeBounds.BOUNDS_MAX_UPDATA_NATIVE, false);
        } else if (this._getUpdateFlag(NativeBounds.BOUNDS_MAX_UPDATA_NATIVE)) {
            const offset = NativeBounds.Bounds_Stride_Max;
            max.x = this.float32Array[offset];
            max.y = this.float32Array[offset + 1];
            max.z = this.float32Array[offset + 2];
            this._setUpdateFlag(NativeBounds.BOUNDS_MAX_UPDATA_NATIVE, false);
        }
        return max;
    }

    /**
     * 设置包围盒的中心点。
     * @param value	包围盒的中心点。
     */
    setCenter(value: Vector3): void {
        if (value !== this._center) {
            value.cloneTo(this._center);
            this.updateNativeData(NativeBounds.Bounds_Stride_Center, value);
            this._setUpdateFlag(NativeBounds.BOUNDS_CENTER_UPDATA_NATIVE, false);
        }

        this._setUpdateFlag(NativeBounds._UPDATE_MIN | NativeBounds._UPDATE_MAX, true);
        this._setUpdateFlag(NativeBounds._UPDATE_CENTER, false);
    }

    /**
     * 获取包围盒的中心点。
     * @return	包围盒的中心点。
     */
    getCenter(): Vector3 {
        if (this._getUpdateFlag(NativeBounds._UPDATE_CENTER)) {
            this._getCenter(this.getMin(), this.getMax(), this._center);
            //update native data
            this.updateNativeData(NativeBounds.Bounds_Stride_Center, this._center);
            this._setUpdateFlag(NativeBounds._UPDATE_CENTER, false);
            this._setUpdateFlag(NativeBounds.BOUNDS_CENTER_UPDATA_NATIVE, false);
        } else if (this._getUpdateFlag(NativeBounds.BOUNDS_CENTER_UPDATA_NATIVE)) {
            //bind native data
            const offset = NativeBounds.Bounds_Stride_Center;
            this._center.x = this.float32Array[offset];
            this._center.y = this.float32Array[offset + 1];
            this._center.z = this.float32Array[offset + 2];
            this._setUpdateFlag(NativeBounds.BOUNDS_CENTER_UPDATA_NATIVE, false);
        }
        return this._center;
    }

    /**
     * 设置包围盒的范围。
     * @param value	包围盒的范围。
     */
    setExtent(value: Vector3): void {
        if (value !== this._extent) {
            value.cloneTo(this._extent);
            this.updateNativeData(NativeBounds.Bounds_Stride_Extends, value);
            this._setUpdateFlag(NativeBounds.BOUNDS_EXTENT_UPDATA_NATIVE, false);
        }

        this._setUpdateFlag(NativeBounds._UPDATE_MIN | NativeBounds._UPDATE_MAX, true);
        this._setUpdateFlag(NativeBounds._UPDATE_EXTENT, false);
    }

    /**
     * 获取包围盒的范围。
     * @return	包围盒的范围。
     */
    getExtent(): Vector3 {
        if (this._getUpdateFlag(NativeBounds._UPDATE_EXTENT)) {
            this._getExtent(this.getMin(), this.getMax(), this._extent);
            this.updateNativeData(NativeBounds.Bounds_Stride_Extends, this._extent);
            this._setUpdateFlag(NativeBounds._UPDATE_EXTENT, false);
            this._setUpdateFlag(NativeBounds.BOUNDS_EXTENT_UPDATA_NATIVE, false);
        } else if (this._getUpdateFlag(NativeBounds.BOUNDS_EXTENT_UPDATA_NATIVE)) {
            //bind native data
            const offset = NativeBounds.Bounds_Stride_Extends;
            this._extent.x = this.float32Array[offset];
            this._extent.y = this.float32Array[offset + 1];
            this._extent.z = this.float32Array[offset + 2];
            this._setUpdateFlag(NativeBounds.BOUNDS_EXTENT_UPDATA_NATIVE, false);
        }
        return this._extent;
    }

    /**
     * 创建一个 <code>Bounds</code> 实例。
     * @param	min  min 最小坐标
     * @param	max  max 最大坐标。
     */
    constructor(min: Vector3, max: Vector3) {
        //native memory
        this.nativeMemory = new NativeMemory(NativeBounds.Bounds_MemoryBlock_size * 4);
        this.float32Array = this.nativeMemory.float32Array;
        this.int32Array = this.nativeMemory.int32Array;
        this._nativeObj = new (window as any).conchBounds(this.nativeMemory._buffer);
        this.int32Array[NativeBounds.Bounds_Stride_UpdateFlag] = 0;

        min.cloneTo(this._boundBox.min);
        max.cloneTo(this._boundBox.max);
        this._setUpdateFlag(NativeBounds._UPDATE_CENTER | NativeBounds._UPDATE_EXTENT, true);

        this.updateNativeData(NativeBounds.Bounds_Stride_Min, min);
        this.updateNativeData(NativeBounds.Bounds_Stride_Max, max);
    }


    protected _getUpdateFlag(type: number): boolean {
        return (this.int32Array[NativeBounds.Bounds_Stride_UpdateFlag] & type) != 0;
    }


    protected _setUpdateFlag(type: number, value: boolean): void {
        if (value)
            this.int32Array[NativeBounds.Bounds_Stride_UpdateFlag] |= type;
        else
            this.int32Array[NativeBounds.Bounds_Stride_UpdateFlag] &= ~type;
    }


    protected _getCenter(min: Vector3, max: Vector3, out: Vector3): void {
        Vector3.add(min, max, out);
        Vector3.scale(out, 0.5, out);
    }


    protected _getExtent(min: Vector3, max: Vector3, out: Vector3): void {
        Vector3.subtract(max, min, out);
        Vector3.scale(out, 0.5, out);
    }


    protected _getMin(center: Vector3, extent: Vector3, out: Vector3): void {
        Vector3.subtract(center, extent, out);
    }


    protected _getMax(center: Vector3, extent: Vector3, out: Vector3): void {
        Vector3.add(center, extent, out);
    }

    protected _rotateExtents(extents: Vector3, rotation: Matrix4x4, out: Vector3): void {
        var extentsX: number = extents.x;
        var extentsY: number = extents.y;
        var extentsZ: number = extents.z;
        var matE: Float32Array = rotation.elements;
        out.x = Math.abs(matE[0] * extentsX) + Math.abs(matE[4] * extentsY) + Math.abs(matE[8] * extentsZ);
        out.y = Math.abs(matE[1] * extentsX) + Math.abs(matE[5] * extentsY) + Math.abs(matE[9] * extentsZ);
        out.z = Math.abs(matE[2] * extentsX) + Math.abs(matE[6] * extentsY) + Math.abs(matE[10] * extentsZ);
    }

    private updateNativeData(offset: number, data: Vector3) {
        let array = this.float32Array;
        array[offset] = data.x;
        array[offset + 1] = data.y;
        array[offset + 2] = data.z;
    }

    /**
     * 转换Bounds
     * @param matrix 转换矩阵
     * @param out 转换目标Bounds
     */
    _tranform(matrix: Matrix4x4, out: any): void {
        var outCen: Vector3 = out._center;
        var outExt: Vector3 = out._extent;

        Vector3.transformCoordinate(this.getCenter(), matrix, outCen);
        this._rotateExtents(this.getExtent(), matrix, outExt);
        out.updateNativeData(NativeBounds.Bounds_Stride_Center, outCen);
        out.updateNativeData(NativeBounds.Bounds_Stride_Extends, outExt);

        out._boundBox.setCenterAndExtent(out._center, out._extent);
        out.updateNativeData(NativeBounds.Bounds_Stride_Min, out._boundBox.min);
        out.updateNativeData(NativeBounds.Bounds_Stride_Max, out._boundBox.max);
        out.int32Array[NativeBounds.Bounds_Stride_UpdateFlag] = 0;
    }

    /**
     * @internal
     */
    _getBoundBox(): BoundBox {
        this.getMin();
        this.getMax();
        return this._boundBox;
    }

    /**
     * @returns -1为不相交 不为0的时候返回值为相交体积
     */
    calculateBoundsintersection(bounds: any): number {
        var ownMax: Vector3 = this.getMax();
        var ownMin: Vector3 = this.getMin();
        var calMax: Vector3 = bounds.getMax();
        var calMin: Vector3 = bounds.getMin();
        var tempV0: Vector3 = NativeBounds.TEMP_VECTOR3_MAX0;
        var tempV1: Vector3 = NativeBounds.TEMP_VECTOR3_MAX1;
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
        this.getMin().cloneTo(destBounds._boundBox.min);
        this.getMax().cloneTo(destBounds._boundBox.max);
        destBounds.updateNativeData(NativeBounds.Bounds_Stride_Min, destBounds._boundBox.min);
        destBounds.updateNativeData(NativeBounds.Bounds_Stride_Max, destBounds._boundBox.max);
        this.getCenter().cloneTo(destBounds._center);
        this.getExtent().cloneTo(destBounds._extent);
        destBounds.updateNativeData(NativeBounds.Bounds_Stride_Center, destBounds._center);
        destBounds.updateNativeData(NativeBounds.Bounds_Stride_Extends, destBounds._extent);
        destBounds.int32Array[NativeBounds.Bounds_Stride_UpdateFlag] = 0;
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