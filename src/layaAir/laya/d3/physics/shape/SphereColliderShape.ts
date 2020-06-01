import { ColliderShape } from "./ColliderShape";
import { ILaya3D } from "../../../../ILaya3D";

/**
 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
 */
export class SphereColliderShape extends ColliderShape {
	/** @internal */
	private _radius: number;

	/**
	 * 半径。
	 */
	get radius(): number {
		return this._radius;
	}

	/**
	 * 创建一个新的 <code>SphereColliderShape</code> 实例。
	 * @param radius 半径。
	 */
	constructor(radius: number = 0.5) {//TODO:球形旋转无效，需要优化

		super();
		this._radius = radius;
		this._type = ColliderShape.SHAPETYPES_SPHERE;

		this._btShape = ILaya3D.Physics3D._bullet.btSphereShape_create(radius);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: SphereColliderShape = new SphereColliderShape(this._radius);
		this.cloneTo(dest);
		return dest;
	}

}


