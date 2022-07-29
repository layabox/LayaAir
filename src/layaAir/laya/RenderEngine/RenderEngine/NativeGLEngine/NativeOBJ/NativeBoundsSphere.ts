import { RenderBoundingSphere } from "../../../../d3/core/RenderBoundingSphere";
import { BoundSphere } from "../../../../d3/math/BoundSphere";
import { Vector3 } from "../../../../d3/math/Vector3";
import { NativeMemory } from "../CommonMemory/NativeMemory";

/**
 * <code>BoundSphere</code> 类用于创建包围球。
 */
export class NativeBoundSphere extends RenderBoundingSphere {
    private static MemoryBlock_size = 5;
    private static Stride_UpdateFlag = 4;
    /**native Share Memory */
    private nativeMemory: NativeMemory;
    private float32Array: Float32Array;
    private int32Array: Int32Array;
    /**包围球的中心。*/
    _center: Vector3;
    /**包围球的半径。*/
    _radius: number;
    _nativeObj: any;
    /**
     * 创建一个 <code>BoundSphere</code> 实例。
     * @param	center 包围球的中心。
     * @param	radius 包围球的半径。
     */
    constructor(center: Vector3, radius: number) {
        super(center, radius);
        //native memory
        this.nativeMemory = new NativeMemory(NativeBoundSphere.MemoryBlock_size * 4);
        this.float32Array = this.nativeMemory.float32Array;
        this.int32Array = this.nativeMemory.int32Array;
        this._nativeObj = new (window as any).conchBoundSphere(this.nativeMemory._buffer);
        this.center = center;
        this.radius = radius;
    }

    set center(value: Vector3) {
        value.cloneTo(this._center);
        this.float32Array[0] = value.x;
        this.float32Array[1] = value.y;
        this.float32Array[2] = value.z;

        this.int32Array[NativeBoundSphere.Stride_UpdateFlag] = 1;
    }

    get center() {
        return this._center;
    }

    set radius(value: number) {
        this._radius = value;
        this.float32Array[3] = value;

        this.int32Array[NativeBoundSphere.Stride_UpdateFlag] = 1;
    }

    get radius(): number {
        return this._radius
    }

    toDefault(): void {
        this.center.toDefault();
        this.radius = 0;
    }

    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: NativeBoundSphere): void {
        var dest: NativeBoundSphere = (<NativeBoundSphere>destObject);
        dest.center = this.center;
        dest.radius = this.radius;
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): NativeBoundSphere {
        var dest: NativeBoundSphere = new NativeBoundSphere(new Vector3(), 0);
        this.cloneTo(dest);
        return dest;
    }
}
