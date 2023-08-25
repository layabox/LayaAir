import { Laya3D } from "../../../../Laya3D";
import { LayaEnv } from "../../../../LayaEnv";
import { ICapsuleColliderShape } from "../../../Physics3D/interface/Shape/ICapsuleColliderShape";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Physics3DColliderShape } from "./Physics3DColliderShape";
/**
 * <code>CapsuleColliderShape</code> 类用于创建胶囊形状碰撞器。
 */
export class CapsuleColliderShape extends Physics3DColliderShape {

	_shape: ICapsuleColliderShape;

	/**@internal */
	private _radius: number;

	/**@internal */
	private _length: number;

	/**@internal */
	private _orientation: number;

	/**
	 * 半径。
	 */
	get radius(): number {
		return this._radius;
	}

	set radius(value: number) {
		this._radius = value;
		if (LayaEnv.isPlaying) {
			this._shape.setRadius(value);
		}
	}

	/**
	 * 长度。
	 */
	get length(): number {
		return this._length;
	}

	set length(value: number) {
		this._length = value;
		if (LayaEnv.isPlaying) {
			this._shape.setHeight(value);
		}
	}

	/**
	 * 方向。
	 */
	get orientation(): number {
		return this._orientation;
	}

	set orientation(value: number) {
		this._orientation = value;
		if (LayaEnv.isPlaying) {
			this._shape.setUpAxis(value);
		}
	}

	/**
	 * 创建一个新的 <code>CapsuleColliderShape</code> 实例。
	 * @param 半径。
	 * @param 高(包含半径)。
	 * @param orientation 胶囊体方向。
	 */
	constructor(radius: number = 0.5, length: number = 2, orientation: number = Physics3DColliderShape.SHAPEORIENTATION_UPY) {
		super();
		this.radius = radius;
		this.length = length;
		this.orientation = orientation;
	}

	/**
	 * @override
	 */
	protected _createShape() {
		if(Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_BoxColliderShape))
			this._shape = Laya3D.PhysicsCreateUtil.createCapsuleColliderShape();
		else{
			throw "CapsuleColliderShape: cant enable CapsuleColliderShape"
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: CapsuleColliderShape = new CapsuleColliderShape(this._radius, this._length, this._orientation);
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: CapsuleColliderShape): void {
		super.cloneTo(destObject);
		destObject.radius = this.radius;
		destObject.length = this.length;
		destObject.orientation = this.orientation;
	}

}


