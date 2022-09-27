import { Vector3 } from "../../math/Vector3";
import { ColliderShape } from "./ColliderShape";
import { ILaya3D } from "../../../../ILaya3D";
import { LayaEnv } from "../../../../LayaEnv";

/**
 * <code>CapsuleColliderShape</code> 类用于创建胶囊形状碰撞器。
 */
export class CapsuleColliderShape extends ColliderShape {
	/** @internal */
	public static _tempVector30: Vector3 = new Vector3();

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
			this.changeCapsuleShape();
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
			this.changeCapsuleShape();
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
			this.changeCapsuleShape();
		}
	}

	/**
	 * 创建一个新的 <code>CapsuleColliderShape</code> 实例。
	 * @param 半径。
	 * @param 高(包含半径)。
	 * @param orientation 胶囊体方向。
	 */
	constructor(radius: number = 0.5, length: number = 1.25, orientation: number = ColliderShape.SHAPEORIENTATION_UPY) {

		super();
		this._radius = radius;
		this._length = length;
		this._orientation = orientation;
		this._type = ColliderShape.SHAPETYPES_CAPSULE;

		var bt: any = ILaya3D.Physics3D._bullet;
		switch (orientation) {
			case ColliderShape.SHAPEORIENTATION_UPX:
				this._btShape = bt.btCapsuleShapeX_create(radius, length - radius * 2);
				break;
			case ColliderShape.SHAPEORIENTATION_UPY:
				this._btShape = bt.btCapsuleShape_create(radius, length - radius * 2);
				break;
			case ColliderShape.SHAPEORIENTATION_UPZ:
				this._btShape = bt.btCapsuleShapeZ_create(radius, length - radius * 2);
				break;
			default:
				throw "CapsuleColliderShape:unknown orientation.";
		}
	}

	changeCapsuleShape() {
		//TODO MIner
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_setScale(value: Vector3): void {
		var fixScale: Vector3 = CapsuleColliderShape._tempVector30;
		switch (this.orientation) {
			case ColliderShape.SHAPEORIENTATION_UPX:
				fixScale.x = value.x;
				fixScale.y = fixScale.z = Math.max(value.y, value.z);
				break;
			case ColliderShape.SHAPEORIENTATION_UPY:
				fixScale.y = value.y;
				fixScale.x = fixScale.z = Math.max(value.x, value.z);
				break;
			case ColliderShape.SHAPEORIENTATION_UPZ:
				fixScale.z = value.z;
				fixScale.x = fixScale.y = Math.max(value.x, value.y);
				break;
			default:
				throw "CapsuleColliderShape:unknown orientation.";
		}
		super._setScale(fixScale);
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

}


