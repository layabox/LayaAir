import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";

/**
 * <code>ConeColliderShape</code> 类用于创建圆柱碰撞器。
 */
export class ConeColliderShape extends ColliderShape {
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
	 * 创建一个新的 <code>ConeColliderShape</code> 实例。
	 * @param height 高。
	 * @param radius 半径。
	 */
	constructor(radius: number = 0.5, height: number = 1.0, orientation: number = ColliderShape.SHAPEORIENTATION_UPY) {
		super();
		this._radius = radius;
		this._height = height;
		this._orientation = orientation;
		this._type = ColliderShape.SHAPETYPES_CYLINDER;
		var bt: any = Physics3D._bullet;
		switch (orientation) {
			case ColliderShape.SHAPEORIENTATION_UPX:
				this._btShape = bt.btConeShapeX_create(radius, height);
				break;
			case ColliderShape.SHAPEORIENTATION_UPY:
				this._btShape = bt.btConeShape_create(radius, height);
				break;
			case ColliderShape.SHAPEORIENTATION_UPZ:
				this._btShape = bt.btConeShapeZ_create(radius, height);
				break;
			default:
				throw "ConeColliderShape:unknown orientation.";
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: ConeColliderShape = new ConeColliderShape(this._radius, this._height, this._orientation);
		this.cloneTo(dest);
		return dest;
	}

}


