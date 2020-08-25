import { ColliderShape } from "./ColliderShape";
import { ILaya3D } from "../../../../ILaya3D";

/**
 * <code>CylinderColliderShape</code> 类用于创建圆柱碰撞器。
 */
export class CylinderColliderShape extends ColliderShape {
	/** @internal */
	private static _btSize: number;

	/**
	* @internal
	*/
	static __init__(): void {
		CylinderColliderShape._btSize = ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
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
		var bt: any = ILaya3D.Physics3D._bullet;
		switch (orientation) {
			case ColliderShape.SHAPEORIENTATION_UPX:
				bt.btVector3_setValue(CylinderColliderShape._btSize, height / 2, radius, radius);
				this._btShape = bt.btCylinderShapeX_create(CylinderColliderShape._btSize);
				break;
			case ColliderShape.SHAPEORIENTATION_UPY:
				bt.btVector3_setValue(CylinderColliderShape._btSize, radius, height / 2, radius);
				this._btShape = bt.btCylinderShape_create(CylinderColliderShape._btSize);
				break;
			case ColliderShape.SHAPEORIENTATION_UPZ:
				bt.btVector3_setValue(CylinderColliderShape._btSize, radius, radius, height / 2);
				this._btShape = bt.btCylinderShapeZ_create(CylinderColliderShape._btSize);
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


