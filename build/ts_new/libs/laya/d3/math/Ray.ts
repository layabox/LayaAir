import { Vector3 } from "./Vector3";
/**
	 * <code>Ray</code> 类用于创建射线。
	 */
export class Ray {
	/**原点*/
	origin: Vector3;
	/**方向*/
	direction: Vector3;

	/**
	 * 创建一个 <code>Ray</code> 实例。
	 * @param	origin 射线的起点
	 * @param	direction  射线的方向
	 */
	constructor(origin: Vector3, direction: Vector3) {
		this.origin = origin;
		this.direction = direction;
	}
}

