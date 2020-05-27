import { CannonColliderShape } from "./CannonColliderShape";
import { Vector3 } from "../../math/Vector3";

/**
 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
 */
export class CannonSphereColliderShape extends CannonColliderShape {
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
		this._type = CannonColliderShape.SHAPETYPES_SPHERE;
		this._btShape =new CANNON.Sphere(radius);
	}
	/**
	 * @inheritDoc
	 * @override
	 */
	_setScale(scale:Vector3){
		var max:number = Math.max(scale.x,scale.y,scale.z);
		this._scale.setValue(max,max,max);
		(<CANNON.Sphere>this._btShape).radius = max*this.radius;
		(<CANNON.Sphere>this._btShape).updateBoundingSphereRadius();
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: CannonSphereColliderShape = new CannonSphereColliderShape(this._radius);
		this.cloneTo(dest);
		return dest;
	}

}


