import { Plane } from "../../../d3/math/Plane";
import { Vector3 } from "../../../d3/math/Vector3";
import { NativeMemory } from "./CommonMemory/NativeMemory";

export class PlaneNative extends Plane{
    private static PlaneNative_MemoryBlock_size = 4;
    private static PlaneNative_Stride_Normal = 0;
    private static PlaneNative_Stride_Distance = 3;
    /**native Share Memory */
    private nativeMemory: NativeMemory;
    private transFormArray: Float32Array;
    /**@internal Native*/
    nativeTransformID: number = 0;


    /**
     * 创建一个 <code>Plane</code> 实例。
     * @param	normal 平面的向量
     * @param	d  平面到原点的距离
     */
    constructor(normal: Vector3, d: number = 0) {
        super(normal,d);
        this.nativeMemory = new NativeMemory(PlaneNative.PlaneNative_MemoryBlock_size * 4);
        this.transFormArray = this.nativeMemory.float32Array;
        //native object TODO
        this.nativeTransformID = 0;

    }

    set normal(value: Vector3) {
        value.cloneTo(this._normal);
        const offset = PlaneNative.PlaneNative_Stride_Normal;
        this.transFormArray[offset] = value.x;
        this.transFormArray[offset + 1] = value.y;
        this.transFormArray[offset + 2] = value.z;

    }

    get normal() {
        return this._normal;
    }

    set distance(value: number) {
        this._distance = value;
        this.transFormArray[PlaneNative.PlaneNative_Stride_Distance] = value;
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
        var dest: PlaneNative = <PlaneNative>destObject;
        dest.normal = this.normal;
        dest.distance = this.distance;
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): PlaneNative {
        var dest: PlaneNative = new PlaneNative(new Vector3());
        this.cloneTo(dest);
        return dest;
    }
}