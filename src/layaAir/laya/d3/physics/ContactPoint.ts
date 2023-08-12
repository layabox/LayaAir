import { ICollider } from "../../Physics3D/interface/ICollider";
import { Vector3 } from "../../maths/Vector3";

/**
 * <code>ContactPoint</code> 类用于创建物理碰撞信息。
 */
export class ContactPoint {
	/**@internal */
	_idCounter: number = 0;

	/**@internal */
	_id: number;

	/**碰撞器A。*/
	_colliderA: ICollider = null;
	/**碰撞器B。*/
	_colliderB: ICollider = null;
	/**距离。*/
	distance: number = 0;
	/**法线。*/
	normal: Vector3 = new Vector3();
	/**碰撞器A的碰撞点。*/
	positionOnA: Vector3 = new Vector3();
	/**碰撞器B的碰撞点。*/
	positionOnB: Vector3 = new Vector3();

	/**
	 * 创建一个 <code>ContactPoint</code> 实例。
	 */
	constructor() {
		this._id = ++this._idCounter;
	}

}


