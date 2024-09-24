import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { LayaEnv } from "../../../../LayaEnv";
import { ISphereColliderShape } from "../../../Physics3D/interface/Shape/ISphereColliderShape";
import { Laya3D } from "../../../../Laya3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

/**
 * @en The `SphereColliderShape` class is used to create spherical colliders.
 * @zh `SphereColliderShape` 类用于创建球形碰撞器。
 */
export class SphereColliderShape extends Physics3DColliderShape {
	/**@internal */
	_shape: ISphereColliderShape;
	/** @internal */
	private _radius: number;

    /**
     * @en The radius of the sphere collider.
     * @zh 球形碰撞器的半径。
     */
	get radius(): number {
		return this._radius;
	}

	set radius(value: number) {
		this._radius = value;
		if (LayaEnv.isPlaying) this._shape.setRadius(value);
	}

	/**
	 * @en Constructor method, initialize the sphere collider.
	 * @param radius The radius of the sphere collider.
	 * @zh 构造方法，初始化球形碰撞器。
	 * @param radius 球形碰撞器的半径。
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
	 * @inheritDoc
	 * @override
	 * @en Clone a new SphereColliderShape object.
	 * @return A new SphereColliderShape object.
	 * @zh 克隆一个新的 球形碰撞器 对象。
	 * @return 一个新的 球形碰撞器 对象。
	 */
	clone(): any {
		var dest: SphereColliderShape = new SphereColliderShape(this._radius);
		this.cloneTo(dest);
		return dest;
	}

	/**
     * @internal 
	 * @en Clone data to target object.
	 * @param destObject Target object.
	 * @zh 将数据克隆到目标对象
	 * @param destObject 目标对象。
	 */
	cloneTo(destObject: SphereColliderShape): void {
		super.cloneTo(destObject);
		destObject.radius = this.radius
	}

}


