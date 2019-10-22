import { Physics3D } from "../Physics3D";
import { ColliderShape } from "./ColliderShape";

/**
 * <code>CylinderColliderShape</code> 类用于创建圆柱碰撞器。
 */
export class CylinderColliderShape extends ColliderShape {
	/** @internal */
	private static _nativeSize: number;

	/**
	* @internal
	*/
	static __init__(): void {
		CylinderColliderShape._nativeSize = Physics3D._bullet.btVector3_create(0, 0, 0);
	}

	private _orientation: number;
	private _radius: number = 1;
	private _height: number = 0.5;

	/**
	 * 半径。
	 */
	get radius(): number {
		return this._radius;
	}

	/**
	 * 高度。
	 */
	get height(): number {
		return this._height;
	}

	/**
	 * 方向。
	 */
	get orientation(): number {
		return this._orientation;
	}

	/**
	 * 创建一个新的 <code>CylinderColliderShape</code> 实例。
	 * @param height 高。
	 * @param radius 半径。
	 */
	constructor(radius: number = 0.5, height: number = 1.0, orientation: number = ColliderShape.SHAPEORIENTATION_UPY) {
		super();
		this._radius = radius;
		this._height = height;
		this._orientation = orientation;
		this._type = ColliderShape.SHAPETYPES_CYLINDER;
		var physics3D: any = Physics3D._bullet;
		switch (orientation) {
			case ColliderShape.SHAPEORIENTATION_UPX:
				physics3D.btVector3_setValue(CylinderColliderShape._nativeSize, height / 2, radius, radius);
				this._nativeShape = physics3D.btCylinderShapeX_create(CylinderColliderShape._nativeSize);
				break;
			case ColliderShape.SHAPEORIENTATION_UPY:
				physics3D.btVector3_setValue(CylinderColliderShape._nativeSize, radius, height / 2, radius);
				this._nativeShape = physics3D.btCylinderShape_create(CylinderColliderShape._nativeSize);
				break;
			case ColliderShape.SHAPEORIENTATION_UPZ:
				physics3D.btVector3_setValue(CylinderColliderShape._nativeSize, radius, radius, height / 2);
				this._nativeShape = physics3D.btCylinderShapeZ_create(CylinderColliderShape._nativeSize);
				break;
			default:
				throw "CapsuleColliderShape:unknown orientation.";
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: CylinderColliderShape = new CylinderColliderShape(this._radius, this._height, this._orientation);
		this.cloneTo(dest);
		return dest;
	}

}


