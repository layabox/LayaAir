import { ColliderShape } from "./ColliderShape";
import { Vector3 } from "../../math/Vector3"
import { ILaya3D } from "../../../../ILaya3D";

/**
 * <code>StaticPlaneColliderShape</code> 类用于创建静态平面碰撞器。
 */
export class StaticPlaneColliderShape extends ColliderShape {
	/** @internal */
	private static _btNormal: number;

	/**@internal */
	_offset: number;
	/**@internal */
	_normal: Vector3;

	/**
	 * @internal
	 */
	static __init__(): void {
		StaticPlaneColliderShape._btNormal = ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
	}

	/**
	 * 创建一个新的 <code>StaticPlaneColliderShape</code> 实例。
	 */
	constructor(normal: Vector3, offset: number) {
		super();
		this._normal = normal;
		this._offset = offset;
		this._type = ColliderShape.SHAPETYPES_STATICPLANE;

		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btVector3_setValue(StaticPlaneColliderShape._btNormal, -normal.x, normal.y, normal.z);
		this._btShape = bt.btStaticPlaneShape_create(StaticPlaneColliderShape._btNormal, offset);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: StaticPlaneColliderShape = new StaticPlaneColliderShape(this._normal, this._offset);
		this.cloneTo(dest);
		return dest;
	}

}


