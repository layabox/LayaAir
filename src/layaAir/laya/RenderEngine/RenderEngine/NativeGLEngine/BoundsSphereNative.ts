import { IClone } from "../../../d3/core/IClone";
import { Vector3 } from "../../../d3/math/Vector3";
import { NataiveMemory } from "./CommonMemory/NativeMemory";

/**
 * <code>BoundSphere</code> 类用于创建包围球。
 */
export class BoundSphereNative implements IClone {
    private static Bounds_MemoryBlock_size = 4;
    /**native Share Memory */
    private nativeMemory: NataiveMemory;
    private transFormArray: Float32Array;
    /**@internal Native*/
    nativeTransformID: number = 0; 
    /**包围球的中心。*/
    _center: Vector3;
    /**包围球的半径。*/
    _radius: number;
    /**
     * 创建一个 <code>BoundSphere</code> 实例。
     * @param	center 包围球的中心。
     * @param	radius 包围球的半径。
     */
    constructor(center: Vector3, radius: number) {
        this.center = center;
        this.radius = radius;
        //native memory
        this.nativeMemory = new NataiveMemory(BoundSphereNative.Bounds_MemoryBlock_size * 4);
        this.transFormArray = this.nativeMemory.float32Array;
         //native object TODO
         this.nativeTransformID = 0;
    }

    set center(value: Vector3) {
        value.cloneTo(this._center);
        this.transFormArray[0] = value.x;
        this.transFormArray[1] = value.y;
        this.transFormArray[2] = value.z;
    }

    get center() {
        return this._center;
    }

    set radius(value: number) {
        this._radius = value;
        this.transFormArray[3] = value;
    }

    get radius(): number {
        return this._radius 
    }

    
	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: BoundSphereNative): void {
		var dest: BoundSphereNative = (<BoundSphereNative>destObject);
        dest.center = this.center;
		dest.radius = this.radius;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): BoundSphereNative {
		var dest: BoundSphereNative = new BoundSphereNative(new Vector3(), 0);
		this.cloneTo(dest);
		return dest;
	}
}
