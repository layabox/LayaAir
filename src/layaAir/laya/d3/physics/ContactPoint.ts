import { ICollider } from "../../Physics3D/interface/ICollider";
import { Vector3 } from "../../maths/Vector3";

/**
 * @en ContactPoint class used to create physical contact information.
 * @zh ContactPoint 类用于创建物理碰撞信息。
 */
export class ContactPoint {
	/**@internal */
	_idCounter: number = 0;

	/**@internal */
	_id: number;

	/**
	 * @en Collider A.
	 * @zh 碰撞器A。
	 */
	_colliderA: ICollider = null;
	/**
	 * @en Collider B.
	 * @zh 碰撞器B。
	 */
	_colliderB: ICollider = null;
	/**
	 * @en Distance.
	 * @zh 距离。
	 */
	distance: number = 0;
	/**
	 * @en Normal.
	 * @zh 法线。
	 */
	normal: Vector3 = new Vector3();
	/**
	 * @en Collider A's contact point.
	 * @zh 碰撞器A的碰撞点。
	 */
	positionOnA: Vector3 = new Vector3();
	/**
	 * @en Collider B's contact point.
	 * @zh 碰撞器B的碰撞点。
	 */
	positionOnB: Vector3 = new Vector3();

	/**
	 * @en constructor of ContactPoint.	
	 * @zh ContactPoint 构造函数。
	 */
	constructor() {
		this._id = ++this._idCounter;
	}

}


