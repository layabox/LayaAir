import { ILaya3D } from "ILaya3D";
import { ColliderShape } from "././ColliderShape";
import { Physics } from "../Physics";

/**
 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
 */
export class SphereColliderShape extends ColliderShape {
	/**@private */
	private _radius: number;

	/**
	 * 获取半径。
	 */
	get radius(): number {
		return this._radius;
	}

	/**
	 * 创建一个新的 <code>SphereColliderShape</code> 实例。
	 * @param radius 半径。
	 */
	constructor(radius: number = 0.5) {//TODO:球形旋转无效，需要优化
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		super();
		this._radius = radius;
		this._type = ColliderShape.SHAPETYPES_SPHERE;

		this._nativeShape = new Physics._physics3D.btSphereShape(radius);
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  clone(): any {
		var dest: SphereColliderShape = new SphereColliderShape(this._radius);
		this.cloneTo(dest);
		return dest;
	}

}


