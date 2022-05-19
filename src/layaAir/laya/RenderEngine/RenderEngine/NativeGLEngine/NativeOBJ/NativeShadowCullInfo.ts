import { Vector3 } from "../../../../d3/math/Vector3";
import { IShadowCullInfo } from "../../../RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { NativeBoundSphere } from "./NativeBoundsSphere";
import { NativePlane } from "./NativePlane";

export class NativeShadowCullInfo implements IShadowCullInfo{
    private _position: Vector3;

    private _nativeCullPlanes:any[];

	private _cullPlanes: NativePlane[];

    private _direction: Vector3;

    private _nativeObj: any;
	
	private _cullSphere: NativeBoundSphere;

	constructor() {
    	this._nativeObj = new (window as any).conchShadowCullInfo();
  	}
    set cullPlanes(cullPlanes: NativePlane[]) {
		this._cullPlanes = cullPlanes;
        this._nativeCullPlanes.length = 0;
        cullPlanes.forEach((element) => {
            this._nativeCullPlanes.push((element as any)._nativeObj);
        });
		this._nativeObj.cullPlanes = this._nativeCullPlanes;
	}
	get cullPlanes(): NativePlane[] {
		return this._cullPlanes;
	}
    set cullSphere(cullSphere: NativeBoundSphere) {
		this._cullSphere = cullSphere;
		this._nativeObj.cullSphere = cullSphere._nativeObj;
	}
	
	get cullSphere(): NativeBoundSphere {
		return this._cullSphere;
	}
    set position(position: Vector3) {
		this._position = position;
		this._nativeObj.setPosition(position.x, position.y, position.z);
	} 

	get position(): Vector3 {
		return this._position;
	}
    set direction(direction: Vector3) {
		this._direction = direction;
		this._nativeObj.setDirection(direction.x, direction.y, direction.z);
	} 

	get direction(): Vector3 {
		return this._direction;
	}

    set cullPlaneCount(cullPlaneCount: number) {
		this._nativeObj.cullPlaneCount = cullPlaneCount;
	} 

	get cullPlaneCount(): number {
		return this._nativeObj.cullPlaneCount;
	}
}