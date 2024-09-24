
import { Laya3D } from "../../../../Laya3D";
import { LayaEnv } from "../../../../LayaEnv";
import { IConeColliderShape } from "../../../Physics3D/interface/Shape/IConeColliderShape";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Physics3DColliderShape } from "./Physics3DColliderShape";
/**
 * @en ConeColliderShape class is used to create cone collider.
 * @zh ConeColliderShape 类用于创建圆锥碰撞器。
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
	 * @en The radius of the cone collider.
	 * @zh 圆锥碰撞器的半径。
	 */
	get radius(): number {
		return this._radius;
	}

	set radius(value: number) {
		this._radius = value;
		if (LayaEnv.isPlaying) this._shape.setRadius(value);
	}

	/**
	 * @en The height of the cone collider.
	 * @zh 圆锥碰撞器的高度。
	 */
	get height(): number {
		return this._height;
	}

	set height(value: number) {
		this._height = value;
		if (LayaEnv.isPlaying) this._shape.setHeight(value);
	}

	/**
	 * @en The orientation of the cone collider.
	 * @zh 圆锥碰撞器的方向。
	 */
	get orientation(): number {
		return this._orientation;
	}

	set orientation(value: number) {
		this._orientation = value;
		if (LayaEnv.isPlaying) this._shape.setUpAxis(value);
	}

	/**
	 * @en Constructor method, initialize ConeColliderShape.
	 * @param radius The radius of the cone collider.
	 * @param height The height of the cone collider.
	 * @param orientation The orientation of the cone collider.
	 * @zh 构造方法，初始化圆锥碰撞器。
	 * @param radius 半径。
	 * @param height 圆锥的高度。
	 * @param orientation 圆锥的朝向。
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
	 * @inheritDoc
	 * @override
	 * @en Clone a new ConeColliderShape object.
	 * @return A new ConeColliderShape object.
	 * @zh 克隆一个新的 圆锥碰撞器 对象。
	 * @return 一个新的 圆锥碰撞器 对象。
	 */
	clone(): any {
		var dest: ConeColliderShape = new ConeColliderShape(this._radius, this._height, this._orientation);
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Clone data to target object.
	 * @param destObject Target object.
	 * @zh 将数据克隆到目标对象
	 * @param destObject 目标对象。
	 */
	cloneTo(destObject: ConeColliderShape): void {
		super.cloneTo(destObject);
		destObject.radius = this.radius;
		destObject.height = this.height;
		destObject.orientation = this.orientation;
	}

}


