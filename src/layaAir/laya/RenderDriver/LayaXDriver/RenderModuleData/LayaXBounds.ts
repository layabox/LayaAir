import { BoundBox } from "../../../d3/math/BoundBox";
import { Bounds } from "../../../d3/math/Bounds";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { IClone } from "../../../utils/IClone";

/**
 * LayaX Bounds bridge.
 *
 * Wraps a `conchLayaXBounds` native object. Unlike the RT path which uses
 * shared memory for min/max/center/extent, the LayaX path delegates via
 * simple setter/getter calls on the native object.
 */
export class LayaXBounds implements IClone {

    /** @internal */
    _nativeObj: any;

    /** @internal */
    _center: Vector3 = new Vector3();
    /** @internal */
    _extent: Vector3 = new Vector3();
    /** @internal */
    private _boundBox: BoundBox = new BoundBox(new Vector3(), new Vector3());

    get min(): Vector3 {
        return this.getMin();
    }

    set min(value: Vector3) {
        this.setMin(value);
    }

    get max(): Vector3 {
        return this.getMax();
    }

    set max(value: Vector3) {
        this.setMax(value);
    }

    setMin(value: Vector3): void {
        this._nativeObj.setMin(value.x, value.y, value.z);
        this._boundBox.min.setValue(value.x, value.y, value.z);
    }

    getMin(): Vector3 {
        this._nativeObj.getMin();
        this._syncBoundBoxFromNative();
        return this._boundBox.min;
    }

    setMax(value: Vector3): void {
        this._nativeObj.setMax(value.x, value.y, value.z);
        this._boundBox.max.setValue(value.x, value.y, value.z);
    }

    getMax(): Vector3 {
        this._nativeObj.getMax();
        this._syncBoundBoxFromNative();
        return this._boundBox.max;
    }

    setCenter(value: Vector3): void {
        this._nativeObj.setCenter(value.x, value.y, value.z);
    }

    getCenter(): Vector3 {
        this._nativeObj.getCenter();
        this._syncBoundBoxFromNative();
        const min = this._boundBox.min;
        const max = this._boundBox.max;
        this._center.setValue(
            (min.x + max.x) * 0.5,
            (min.y + max.y) * 0.5,
            (min.z + max.z) * 0.5
        );
        return this._center;
    }

    setExtent(value: Vector3): void {
        this._nativeObj.setExtent(value.x, value.y, value.z);
    }

    getExtent(): Vector3 {
        this._nativeObj.getExtent();
        this._syncBoundBoxFromNative();
        const min = this._boundBox.min;
        const max = this._boundBox.max;
        this._extent.setValue(
            (max.x - min.x) * 0.5,
            (max.y - min.y) * 0.5,
            (max.z - min.z) * 0.5
        );
        return this._extent;
    }

    constructor(min?: Vector3, max?: Vector3) {
        this._nativeObj = new (window as any).conchLayaXBounds();
        min && this.setMin(min);
        max && this.setMax(max);
    }

    /** @internal */
    _tranform(matrix: Matrix4x4, out: LayaXBounds): void {
        this._nativeObj._tranform(matrix.elements, out._nativeObj);
    }

    _getBoundBox(): BoundBox {
        this._nativeObj._getBoundBox();
        this._syncBoundBoxFromNative();
        return this._boundBox;
    }

    private _syncBoundBoxFromNative(): void {
        const min = this._boundBox.min;
        const max = this._boundBox.max;
        min.setValue(this._nativeObj._minX, this._nativeObj._minY, this._nativeObj._minZ);
        max.setValue(this._nativeObj._maxX, this._nativeObj._maxY, this._nativeObj._maxZ);
    }

    /**
     * @returns -1 means no intersection; otherwise returns intersection volume.
     */
    calculateBoundsintersection(bounds: Bounds): number {
        let ownMax = this.getMax();
        let ownMin = this.getMin();
        let calMax = bounds.getMax();
        let calMin = bounds.getMin();
        let thisExtends = this.getExtent();
        let boundExtends = bounds.getExtent();
        let tempV0 = TEMP_VECTOR3_MAX0;
        let tempV1 = TEMP_VECTOR3_MAX1;
        tempV0.setValue(
            Math.max(ownMax.x, calMax.x) - Math.min(ownMin.x, calMin.x),
            Math.max(ownMax.y, calMax.y) - Math.min(ownMin.y, calMin.y),
            Math.max(ownMax.z, calMax.z) - Math.min(ownMin.z, calMin.z)
        );
        tempV1.setValue(
            (thisExtends.x + boundExtends.x) * 2.0,
            (thisExtends.y + boundExtends.y) * 2.0,
            (thisExtends.z + boundExtends.z) * 2.0
        );
        if (tempV0.x > tempV1.x) return -1;
        if (tempV0.y > tempV1.y) return -1;
        if (tempV0.z > tempV1.z) return -1;
        return (tempV1.x - tempV0.x) * (tempV1.y - tempV0.y) * (tempV1.z - tempV0.z);
    }

    cloneTo(destObject: LayaXBounds): void {
        this._nativeObj.cloneTo(destObject._nativeObj);
    }

    clone(): LayaXBounds {
        let dest = new LayaXBounds(new Vector3(), new Vector3());
        this.cloneTo(dest);
        return dest;
    }
}

const TEMP_VECTOR3_MAX0 = new Vector3();
const TEMP_VECTOR3_MAX1 = new Vector3();
