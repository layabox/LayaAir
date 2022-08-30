import { BoundFrustum } from "../../../../d3/math/BoundFrustum";
import { Matrix4x4 } from "../../../../d3/math/Matrix4x4";
import { RenderBoundingFrustum } from "../../../RenderObj/RenderBoundingFrustum";
import { NativeMemory } from "../CommonMemory/NativeMemory";


export class NativeBoundFrustum extends RenderBoundingFrustum {
    private static MemoryBlock_size = 16 * 4;
    /**native Share Memory */
    private nativeMemory: NativeMemory;
    private float32Array: Float32Array;

    _nativeObj: any;

    /**
     * 创建一个 <code>BoundFrustum</code> 实例。
     * @param matrix 
     */
    constructor(matrix: Matrix4x4) {
        super(matrix);
        this.nativeMemory = new NativeMemory(NativeBoundFrustum.MemoryBlock_size, true);
        this.float32Array = this.nativeMemory.float32Array;
        this._nativeObj = new (window as any).conchBoundFrustum(this.nativeMemory._buffer);
        this.matrix = matrix;
    }

    set matrix(matrix: Matrix4x4) {
        matrix.cloneTo(this._matrix);
        //update Native Data  native拿到Frustumnative 需要更新plane
        this.float32Array.set(this._matrix.elements);
        this._nativeObj.setMatrix();
        BoundFrustum.getPlanesFromMatrix(this._matrix, this._near, this._far, this._left, this._right, this._top, this._bottom);
    }
}