import { CannonColliderShape } from "./CannonColliderShape";
import { Vector3 } from "../../math/Vector3";

/**
 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export class CannonBoxColliderShape extends CannonColliderShape {
	/** @internal */
	static _btSize: CANNON.Vec3;

	/**
	* @internal
	*/
	static __init__(): void {
		CannonBoxColliderShape._btSize =new CANNON.Vec3();
	}

	/**@internal */
	private _sizeX: number;
	/**@internal */
	private _sizeY: number;
	/**@internal */
	private _sizeZ: number;

	/**
	 * X轴尺寸。
	 */
	get sizeX(): number {
		return this._sizeX;
	}

	/**
	 * Y轴尺寸。
	 */
	get sizeY(): number {
		return this._sizeY;
	}

	/**
	 * Z轴尺寸。
	 */
	get sizeZ(): number {
		return this._sizeZ;
	}



	/**
	 * 创建一个新的 <code>BoxColliderShape</code> 实例。
	 * @param sizeX 盒子X轴尺寸。
	 * @param sizeY 盒子Y轴尺寸。
	 * @param sizeZ 盒子Z轴尺寸。
	 */
	constructor(sizeX: number = 1.0, sizeY: number = 1.0, sizeZ: number = 1.0) {

		super();
		this._sizeX = sizeX;
		this._sizeY = sizeY;
		this._sizeZ = sizeZ;
		this._type = CannonColliderShape.SHAPETYPES_BOX;
		var btsize = new CANNON.Vec3(sizeX/2,sizeY/2,sizeZ/2);
		this._btShape =new CANNON.Box(btsize);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_setScale(scale:Vector3){
		this._scale.setValue(scale.x,scale.y,scale.z);
		(<CANNON.Box>this._btShape).halfExtents.set(this.sizeX/2*scale.x,this.sizeY/2*scale.y,this.sizeZ/2*scale.z);
		(<CANNON.Box>this._btShape).updateConvexPolyhedronRepresentation();
		(<CANNON.Box>this._btShape).updateBoundingSphereRadius();
	}
	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: CannonBoxColliderShape = new CannonBoxColliderShape(this._sizeX, this._sizeY, this._sizeZ);
		this.cloneTo(dest);
		return dest;
	}
}


