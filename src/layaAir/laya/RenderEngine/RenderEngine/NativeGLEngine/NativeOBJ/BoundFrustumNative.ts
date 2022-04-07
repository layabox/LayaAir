import { BoundFrustum } from "../../../../d3/math/BoundFrustum";
import { Matrix4x4 } from "../../../../d3/math/Matrix4x4";
import { Plane } from "../../../../d3/math/Plane";
import { NativeMemory } from "../CommonMemory/NativeMemory";


export class BoundFrustumNative extends BoundFrustum {
    private static BoundFrustumNative_MemoryBlock_size = 17;
    private static BoundFrustumNative_updateFlag = 16;
    /**native Share Memory */
    private nativeMemory: NativeMemory;
    private transFormArray: Float32Array;
    /**@internal Native*/
    nativeTransformID: number = 0; 
    /** @internal */
	_near: Plane;
	/** @internal */
	_far: Plane;
	/** @internal */
	_left: Plane;
	/** @internal */
	_right: Plane;
	/** @internal */
	_top: Plane;
	/** @internal */
	_bottom: Plane;
   	/**
	 * 创建一个 <code>BoundFrustum</code> 实例。
	 * @param	matrix 锥截体的描述4x4矩阵。
	 */
	constructor(matrix: Matrix4x4) {
        super(matrix);
        this.nativeMemory = new NativeMemory(BoundFrustumNative.BoundFrustumNative_MemoryBlock_size * 4);
        this.transFormArray = this.nativeMemory.float32Array;
        //native object TODO
        this.nativeTransformID = 0;
	}

    set matrix(matrix: Matrix4x4) {
		matrix.cloneTo(this._matrix);
        //update Native Data  native拿到Frustumnative 需要更新plane
        this.transFormArray.set(this._matrix.elements);
        this.transFormArray[BoundFrustumNative.BoundFrustumNative_updateFlag] = 1;
		BoundFrustum.getPlanesFromMatrix(this._matrix, this._near, this._far, this._left, this._right, this._top, this._bottom);
	}
}