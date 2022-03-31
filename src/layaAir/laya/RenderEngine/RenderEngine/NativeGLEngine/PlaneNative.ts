import { Vector3 } from "../../../d3/math/Vector3";
import { NativeMemory } from "./CommonMemory/NativeMemory";

export class PlaneNative {
    /**平面与其他几何体相交类型*/
    static PlaneIntersectionType_Back: number = 0;
    static PlaneIntersectionType_Front: number = 1;
    static PlaneIntersectionType_Intersecting: number = 2;

    private static PlaneNative_MemoryBlock_size = 4;
    private static PlaneNative_Stride_Normal = 0;
    private static PlaneNative_Stride_Distance = 3;
    /**平面的向量*/
    _normal: Vector3;
    /**平面到坐标系原点的距离*/
    _distance: number;
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
        this.nativeMemory = new NativeMemory(PlaneNative.PlaneNative_MemoryBlock_size * 4);
        this.transFormArray = this.nativeMemory.float32Array;
        //native object TODO
        this.nativeTransformID = 0;
        this.normal = normal;
        this.distance = d;

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
     * 通过三个点创建一个平面。
     * @param	point0 第零个点
     * @param	point1 第一个点
     * @param	point2 第二个点
     */
    static createPlaneBy3P(point0: Vector3, point1: Vector3, point2: Vector3, out: PlaneNative): void {
        var x1: number = point1.x - point0.x;
        var y1: number = point1.y - point0.y;
        var z1: number = point1.z - point0.z;
        var x2: number = point2.x - point0.x;
        var y2: number = point2.y - point0.y;
        var z2: number = point2.z - point0.z;
        var yz: number = (y1 * z2) - (z1 * y2);
        var xz: number = (z1 * x2) - (x1 * z2);
        var xy: number = (x1 * y2) - (y1 * x2);
        var invPyth: number = 1.0 / (Math.sqrt((yz * yz) + (xz * xz) + (xy * xy)));

        var x: number = yz * invPyth;
        var y: number = xz * invPyth;
        var z: number = xy * invPyth;

        var normal: Vector3 = out.normal;
        normal.x = x;
        normal.y = y;
        normal.z = z;

        out.distance = -((x * point0.x) + (y * point0.y) + (z * point0.z));
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