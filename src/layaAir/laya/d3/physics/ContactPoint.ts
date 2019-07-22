import { PhysicsComponent } from "./PhysicsComponent"
import { Vector3 } from "../math/Vector3"

/**
 * <code>ContactPoint</code> 类用于创建物理碰撞信息。
 */
export class ContactPoint {
	/**@internal */
	_idCounter: number = 0;

	/**@internal */
	_id: number;

	/**碰撞器A。*/
	colliderA: PhysicsComponent = null;
	/**碰撞器B。*/
	colliderB: PhysicsComponent = null;
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


