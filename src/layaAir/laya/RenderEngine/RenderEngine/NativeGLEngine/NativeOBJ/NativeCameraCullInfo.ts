import { Vector3 } from "../../../../d3/math/Vector3";
import { ICameraCullInfo } from "../../../RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { NativeBoundFrustum } from "./NativeBoundFrustum";

/**
 * camera裁剪数据
 */
 export class NativeCameraCullInfo implements ICameraCullInfo{
	/**位置 */
	private _position: Vector3;

	private _boundFrustum: NativeBoundFrustum;

	private _nativeObj: any;
	
	constructor() {
    	this._nativeObj = new (window as any).conchCameraCullInfo();
  	}
	set position(position: Vector3) {
		this._position = position;
		this._nativeObj.setPosition(position.x, position.y, position.z);
	} 

	get position(): Vector3 {
		return this._position;
	}

	set useOcclusionCulling(useOcclusionCulling: Boolean) {
		this._nativeObj.useOcclusionCulling = useOcclusionCulling;
	}

	get useOcclusionCulling(): Boolean {
		return this._nativeObj.useOcclusionCulling;
	}

	set boundFrustum(boundFrustum: NativeBoundFrustum) {
		this._boundFrustum = boundFrustum;
		this._nativeObj.boundFrustum = boundFrustum._nativeObj;
	}

	get boundFrustum(): NativeBoundFrustum {
		return this._boundFrustum;
	}

	set cullingMask(cullingMask: number) {
		this._nativeObj.cullingMask = cullingMask;
	}

	get cullingMask(): number {
		return this._nativeObj.cullingMask;
	}
}