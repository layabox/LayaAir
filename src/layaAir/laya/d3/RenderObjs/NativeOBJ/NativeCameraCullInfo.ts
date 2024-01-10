import { Vector3 } from "../../../maths/Vector3";
import { NativeMemory } from "../../../RenderEngine/RenderEngine/NativeGLEngine/CommonMemory/NativeMemory";
import { BoundFrustum } from "../../math/BoundFrustum";
import { Plane } from "../../math/Plane";


/**
 * camera裁剪数据
 */
export class NativeCameraCullInfo{
	/**位置 */
	private _position: Vector3;

	private _useOcclusionCulling: Boolean;

	private _cullingMask: number;
	/**静态标记 */
	private _staticMask: number;

	private _nativeObj: any;

	private static MemoryBlock_size = 192;
	/**native Share Memory */
	private nativeMemory: NativeMemory;
	private float64Array: Float64Array;

	boundFrustum: BoundFrustum;

	constructor() {
		this.nativeMemory = new NativeMemory(NativeCameraCullInfo.MemoryBlock_size, true);
		this.float64Array = this.nativeMemory.float64Array;
		this._nativeObj = new (window as any).conchCameraCullInfo(this.nativeMemory._buffer);
	}

	set position(position: Vector3) {
		this._position = position;
		this._nativeObj.setPosition(position.x, position.y, position.z);
	}

	get position(): Vector3 {
		return this._position;
	}

	set useOcclusionCulling(useOcclusionCulling: Boolean) {
		this._useOcclusionCulling = useOcclusionCulling;
		this._nativeObj.useOcclusionCulling = useOcclusionCulling;
	}

	get useOcclusionCulling(): Boolean {
		return this._useOcclusionCulling;
	}

	set cullingMask(cullingMask: number) {
		this._cullingMask = cullingMask;
		this._nativeObj.cullingMask = cullingMask;
	}

	get cullingMask(): number {
		return this._cullingMask;
	}


	set staticMask(value: number) {
		this._staticMask = value;
		this._nativeObj.staticMask = value;
	}

	get staticMask(): number {
		return this._staticMask;
	}
	

	/**
	 * @internal
	 */
	serialize(): void {
		if (this.boundFrustum) {
			this.setPlane(0, this.boundFrustum.near);
			this.setPlane(4, this.boundFrustum.far);
			this.setPlane(8, this.boundFrustum.left);
			this.setPlane(12, this.boundFrustum.right);
			this.setPlane(16, this.boundFrustum.top);
			this.setPlane(20, this.boundFrustum.bottom);
			this._nativeObj.setBoundFrustum();
		}
	}
	/**
	 * @internal
	 */
	setPlane(index: number, value: Plane): void {
		this.float64Array[index] = value.normal.x;
		this.float64Array[index + 1] = value.normal.y;
		this.float64Array[index + 2] = value.normal.z;
		this.float64Array[index + 3] = value.distance;
	}
}