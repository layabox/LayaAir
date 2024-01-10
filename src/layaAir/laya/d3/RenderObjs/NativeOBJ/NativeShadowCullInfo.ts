import { Vector3 } from "../../../maths/Vector3";
import { NativeMemory } from "../../../RenderEngine/RenderEngine/NativeGLEngine/CommonMemory/NativeMemory";
import { BoundSphere } from "../../math/BoundSphere";
import { Plane } from "../../math/Plane";


export class NativeShadowCullInfo{

    private _position: Vector3;

	private _cullPlanes: Plane[];

    private _direction: Vector3;

    private _nativeObj: any;
	
	private _cullSphere: BoundSphere;

	private _cullPlaneCount: number;

	/**native Share Memory */
	static MemoryBlock_size: number = 4 * 8;

	private nativeMemory: NativeMemory;
	
	private float64Array: Float64Array;

	constructor() {
		this.nativeMemory = new NativeMemory(NativeShadowCullInfo.MemoryBlock_size, true);
		this.float64Array = this.nativeMemory.float64Array;
    	this._nativeObj = new (window as any).conchShadowCullInfo(this.nativeMemory._buffer);
  	}
    set cullPlanes(cullPlanes: Plane[]) {
		this._cullPlanes = cullPlanes;
        this._nativeObj.clearCullPlanes();
        cullPlanes.forEach((element) => {
			this.float64Array[0] = element.normal.x;
        	this.float64Array[1] = element.normal.y;
        	this.float64Array[2] = element.normal.z;
			this.float64Array[3] = element.distance;
            this._nativeObj.addCullPlane();
        });
	}
	get cullPlanes(): Plane[] {
		return this._cullPlanes;
	}
    set cullSphere(cullSphere: BoundSphere) {
		this._cullSphere = cullSphere;
		this.float64Array[0] = cullSphere.center.x;
        this.float64Array[1] = cullSphere.center.y;
        this.float64Array[2] = cullSphere.center.z;
		this.float64Array[3] = cullSphere.radius;
		this._nativeObj.setCullSphere();
	}
	
	get cullSphere(): BoundSphere {
		return this._cullSphere;
	}
    set position(position: Vector3) {
		this._position = position;
		this.float64Array[0] = position.x;
        this.float64Array[1] = position.y;
        this.float64Array[2] = position.z;
		this._nativeObj.setPosition();
	} 

	get position(): Vector3 {
		return this._position;
	}
    set direction(direction: Vector3) {
		this._direction = direction;
		this.float64Array[0] = direction.x;
        this.float64Array[1] = direction.y;
        this.float64Array[2] = direction.z;
		this._nativeObj.setDirection();
	} 

	get direction(): Vector3 {
		return this._direction;
	}

    set cullPlaneCount(cullPlaneCount: number) {
		this._cullPlaneCount = cullPlaneCount;
		this._nativeObj.cullPlaneCount = cullPlaneCount;
	} 

	get cullPlaneCount(): number {
		return this._cullPlaneCount;
	}
}