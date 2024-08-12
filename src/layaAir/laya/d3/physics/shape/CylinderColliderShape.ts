
import { Laya3D } from "../../../../Laya3D";
import { LayaEnv } from "../../../../LayaEnv";
import { ICylinderColliderShape } from "../../../Physics3D/interface/Shape/ICylinderColliderShape";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Physics3DColliderShape } from "./Physics3DColliderShape";

/**
 * @en CylinderColliderShape class is used to create a cylinder collider.
 * @zh CylinderColliderShape 类用于创建圆柱碰撞器。
 */
export class CylinderColliderShape extends Physics3DColliderShape {
	/**@internal */
	_shape: ICylinderColliderShape;
	/**@internal */
	private _orientation: number;
	/**@internal */
	private _radius: number = 1;
	/**@internal */
	private _height: number = 0.5;

	/**
	 * @en The radius of the cylinder collider.
	 * @zh 圆柱碰撞器的半径。
	 */
	get radius(): number {
		return this._radius;
	}

	set radius(value: number) {
		this._radius = value;
		if (LayaEnv.isPlaying) this._shape.setRadius(value);
	}

	/**
	 * @en The height of the cylinder collider.
	 * @zh 圆柱碰撞器的高度。
	 */
	get height(): number {
		return this._height;
	}

	set height(value: number) {
		this._height = value;
		if (LayaEnv.isPlaying) this._shape.setHeight(value);
	}

	/**
	 * @en The orientation of the cylinder collider.
	 * @zh 圆柱碰撞器的方向。
	 */
	get orientation(): number {
		return this._orientation;
	}

	set orientation(value: number) {
		this._orientation = value;
		if (LayaEnv.isPlaying) this._shape.setUpAxis(value);
	}

	/**
	 * @en Constructor method, initialize a cylinder collider.
	 * @param radius The radius of the cylinder collider.
	 * @param height The height of the cylinder collider.
	 * @param orientation The orientation of the cylinder collider.
	 * @zh 构造方法，初始化圆柱碰撞器。
	 * @param radius 圆柱的半径。
	 * @param height 圆柱的高度。
	 * @param orientation 圆柱的朝向。
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
		if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_CylinderColliderShape)) {
			this._shape = Laya3D.PhysicsCreateUtil.createCylinderColliderShape();
		} else {
			console.error("CylinderColliderShape: cant enable CylinderColliderShape");
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Clone a new CylinderColliderShape object.
	 * @return A new CylinderColliderShape object.
	 * @zh 克隆一个新的 圆柱碰撞器 对象。
	 * @return 一个新的 圆柱碰撞器 对象。
	 */
	clone(): any {
		var dest: CylinderColliderShape = new CylinderColliderShape(this._radius, this._height, this._orientation);
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
	cloneTo(destObject: CylinderColliderShape): void {
		super.cloneTo(destObject);
		destObject.radius = this.radius;
		destObject.height = this.height;
		destObject.orientation = this.orientation;
	}

}


