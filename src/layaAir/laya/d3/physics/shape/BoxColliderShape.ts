import { LayaEnv } from "../../../../LayaEnv";
import { Vector3 } from "../../../maths/Vector3";
import { IBoxColliderShape } from "../../../Physics3D/interface/Shape/IBoxColliderShape";
import { Laya3D } from "../../../../Laya3D";
import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

/**
 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export class BoxColliderShape extends Physics3DColliderShape {

	/**@internal */
	_shape: IBoxColliderShape;
	/**@internal */
	private _size: Vector3;

	/**
	 * 创建一个新的 <code>BoxColliderShape</code> 实例。
	 * @param sizeX 盒子X轴尺寸。
	 * @param sizeY 盒子Y轴尺寸。
	 * @param sizeZ 盒子Z轴尺寸。
	 */
	constructor(sizeX: number = 1.0, sizeY: number = 1.0, sizeZ: number = 1.0) {
		super();
		this._size = new Vector3(sizeX, sizeY, sizeZ);
		this._shape.setSize(this._size);
	}


	protected _createShape() {
		if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_BoxColliderShape))
			this._shape = Laya3D.PhysicsCreateUtil.createBoxColliderShape();
		else {
			console.error("BoxColliderShape: cant enable BoxColliderShape");
		}
	}

	/**
	 * Box size
	 */
	get size(): Vector3 {
		return this._size;
	}

	set size(value: Vector3) {
		this._size = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: BoxColliderShape = new BoxColliderShape(this._size.x, this._size.y, this._size.z);
		this.cloneTo(dest);
		return dest;
	}

	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		destObject.size = this.size;
	}

	//-------------------deprecated-------------------
	/**
	 * @description
	 * X轴尺寸。
	 */
	get sizeX(): number {
		return this.size.x;
	}

	set sizeX(value: number) {
		this._size.x = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}

	/**
	 * @description
	 * Y轴尺寸。
	 */
	get sizeY(): number {
		return this.size.y;
	}

	set sizeY(value: number) {
		this._size.y = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}

	/**
	 * @description
	 * Z轴尺寸。
	 */
	get sizeZ(): number {
		return this.size.z;
	}

	set sizeZ(value: number) {
		this._size.z = value;
		if (LayaEnv.isPlaying) {
			this._shape.setSize(this._size);
		}
	}
}


