
import { Laya3D } from "../../../../Laya3D";
import { LayaEnv } from "../../../../LayaEnv";
import { IConeColliderShape } from "../../../Physics3D/interface/Shape/IConeColliderShape";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Physics3DColliderShape } from "./Physics3DColliderShape";
/**
 * <code>ConeColliderShape</code> 类用于创建圆锥碰撞器。
 */
export class ConeColliderShape extends Physics3DColliderShape {
	/**@internal */
	_shape: IConeColliderShape;

	/**@internal */
	private _orientation: number;
	/**@internal */
	private _radius: number = 1;
	/**@internal */
	private _height: number = 0.5;

	/**
	 * 半径。
	 */
	get radius(): number {
		return this._radius;
	}

	set radius(value: number) {
		this._radius = value;
		if (LayaEnv.isPlaying) this._shape.setRadius(value);
	}

	/**
	 * 高度。
	 */
	get height(): number {
		return this._height;
	}

	set height(value: number) {
		this._height = value;
		if (LayaEnv.isPlaying) this._shape.setHeight(value);
	}

	/**
	 * 方向。
	 */
	get orientation(): number {
		return this._orientation;
	}

	set orientation(value: number) {
		this._orientation = value;
		if (LayaEnv.isPlaying) this._shape.setUpAxis(value);
	}

	/**
	 * 创建一个新的 <code>ConeColliderShape</code> 实例。
	 * @param height 高。
	 * @param radius 半径。
	 */
	constructor(radius: number = 0.5, height: number = 1.0, orientation: number = Physics3DColliderShape.SHAPEORIENTATION_UPY) {
		super();
		this.radius = radius;
		this.height = height;
		this.orientation = orientation;
	}

	/**
	 * @internal
	 * @override
	 */
	protected _createShape() {
		if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_ConeColliderShape)) {
			this._shape = Laya3D.PhysicsCreateUtil.createConeColliderShape();
		} else {
			console.error("ConeColliderShape: cant enable ConeColliderShape");
		}
	}

	/**
	 * 克隆
	 * @inheritDoc
	 * @override
	 * @returns 克隆的ConeColliderShape实例
	 */
	clone(): any {
		var dest: ConeColliderShape = new ConeColliderShape(this._radius, this._height, this._orientation);
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * 克隆
	 * @param destObject 克隆目标
	 * @inheritDoc
	 * @override
	 * @returns 克隆的ConeColliderShape实例
	 */
	cloneTo(destObject: ConeColliderShape): void {
		super.cloneTo(destObject);
		destObject.radius = this.radius;
		destObject.height = this.height;
		destObject.orientation = this.orientation;
	}

}


