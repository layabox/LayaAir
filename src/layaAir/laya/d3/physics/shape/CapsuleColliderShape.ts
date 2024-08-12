import { Laya3D } from "../../../../Laya3D";
import { LayaEnv } from "../../../../LayaEnv";
import { ICapsuleColliderShape } from "../../../Physics3D/interface/Shape/ICapsuleColliderShape";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Physics3DColliderShape } from "./Physics3DColliderShape";
/**
 * @en CapsuleColliderShape class is used to create capsule collider shape.
 * @zh CapsuleColliderShape 类用于创建胶囊形状碰撞器。
 */
export class CapsuleColliderShape extends Physics3DColliderShape {
	/**@internal */
	_shape: ICapsuleColliderShape;

	/**@internal */
	private _radius: number;

	/**@internal */
	private _length: number;

	/**@internal */
	private _orientation: number;

    /**
     * @en The radius of the capsule collider.
     * @zh 胶囊碰撞器的半径。
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
     * @en The length of the capsule collider.
     * @zh 胶囊碰撞器的长度。
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
     * @en The orientation of the capsule collider.
     * @zh 胶囊碰撞器的方向。
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
	 * @en initialize the capsule collider radius, length and direction.
	 * @param radius The radius of the capsule collider.
	 * @param length The length of the capsule collider.
	 * @param orientation The orientation of the capsule collider.
	 * @zh 初始化胶囊碰撞器的半径、长度和方向。
	 * @param radius 胶囊半径。
	 * @param length 胶囊长度。
	 * @param orientation 胶囊体方向。
	 */
	constructor(radius: number = 0.5, length: number = 2, orientation: number = Physics3DColliderShape.SHAPEORIENTATION_UPY) {
		super();
		this.radius = radius;
		this.length = length;
		this.orientation = orientation;
	}

	/**
	 * @internal
	 * @override
	 */
	protected _createShape() {
		if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_CapsuleColliderShape))
			this._shape = Laya3D.PhysicsCreateUtil.createCapsuleColliderShape();
		else {
			console.error("CapsuleColliderShape: cant enable CapsuleColliderShape");
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Clone a new CapsuleColliderShape object.
	 * @rerurn Clone CapsuleColliderShape object.
	 * @zh 克隆一个新的 胶囊形状碰撞器 对象。
	 * @return 克隆的 胶囊形状碰撞器 对象。
	 */
	clone(): any {
		var dest: CapsuleColliderShape = new CapsuleColliderShape(this._radius, this._length, this._orientation);
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Clone data to target.
	 * @param destObject Clone target.
	 * @zh 克隆数据到目标
	 * @param destObject 克隆目标
	 */
	cloneTo(destObject: CapsuleColliderShape): void {
		super.cloneTo(destObject);
		destObject.radius = this.radius;
		destObject.length = this.length;
		destObject.orientation = this.orientation;
	}

}


