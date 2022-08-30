import { RenderPlane } from "../../../../d3/core/RenderPlane";
import { Plane } from "../../../../d3/math/Plane";
import { Vector3 } from "../../../../d3/math/Vector3";
import { NativeMemory } from "../CommonMemory/NativeMemory";

export class NativePlane extends RenderPlane {
    private static MemoryBlock_size = 3 * 8;
    /**native Share Memory */
    private nativeMemory: NativeMemory;
    private float32Array: Float32Array;
    private float64Array: Float64Array;
    _nativeObj: any;


    /**
     * 创建一个 <code>Plane</code> 实例。
     * @param	normal 平面的向量
     * @param	d  平面到原点的距离
     */
    constructor(normal: Vector3, d: number = 0) {
        super(normal, d);
        this.nativeMemory = new NativeMemory(NativePlane.MemoryBlock_size, true);
        this.float32Array = this.nativeMemory.float32Array;
        this.float64Array = this.nativeMemory.float64Array;
        this._nativeObj = new (window as any).conchPlane(this.nativeMemory._buffer);
        this.normal = normal;
        this.distance = d;
    }

    set normal(value: Vector3) {
        value.cloneTo(this._normal);
        this.float64Array[0] = value.x;
        this.float64Array[1] = value.y;
        this.float64Array[2] = value.z;
        this._nativeObj.setNormal();
    }

    get normal() {
        return this._normal;
    }

    set distance(value: number) {
        this._distance = value;
        this.float32Array[0] = value;
        this._nativeObj.setDistance();
    }

    get distance(): number {
        return this._distance;
    }
    /**
     * 更改平面法线向量的系数，使之成单位长度。
     */
    normalize(): void {
        var normalEX: number = this._normal.x;
        var normalEY: number = this._normal.y;
        var normalEZ: number = this._normal.z;
        var magnitude: number = 1.0 / Math.sqrt(normalEX * normalEX + normalEY * normalEY + normalEZ * normalEZ);

        this._normal.x = normalEX * magnitude;
        this._normal.y = normalEY * magnitude;
        this._normal.z = normalEZ * magnitude;
        this.normal = this._normal;
        this.distance *= magnitude;
    }

    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void {
        var dest: NativePlane = <NativePlane>destObject;
        dest.normal = this.normal;
        dest.distance = this.distance;
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): NativePlane {
        var dest: NativePlane = new NativePlane(new Vector3(), 0);
        this.cloneTo(dest);
        return dest;
    }
}