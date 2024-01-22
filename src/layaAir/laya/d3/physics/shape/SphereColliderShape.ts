import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { LayaEnv } from "../../../../LayaEnv";
import { ISphereColliderShape } from "../../../Physics3D/interface/Shape/ISphereColliderShape";
import { Laya3D } from "../../../../Laya3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

/**
 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
 */
export class SphereColliderShape extends Physics3DColliderShape {
	/**@internal */
	_shape: ISphereColliderShape;
	/** @internal */
	private _radius: number;

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
	 * 创建一个新的 <code>SphereColliderShape</code> 实例。
	 * @param radius 半径。
	 */
	constructor(radius: number = 0.5) {//TODO:球形旋转无效，需要优化
		super();
		this.radius = radius;

	}

	/**@internal */
	protected _createShape() {
		if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_SphereColliderShape))
			this._shape = Laya3D.PhysicsCreateUtil.createSphereColliderShape()
		else
			console.error("SphereColliderShape: cant enable SphereColliderShape");
	}

	/**
	 * 克隆
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: SphereColliderShape = new SphereColliderShape(this._radius);
		this.cloneTo(dest);
		return dest;
	}

	/**@internal 克隆到目标对象*/
	cloneTo(destObject: SphereColliderShape): void {
		super.cloneTo(destObject);
		destObject.radius = this.radius
	}

}


