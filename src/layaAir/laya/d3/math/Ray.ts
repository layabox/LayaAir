import { Vector3 } from "../../maths/Vector3";

/**
 * @en Ray class used to create a ray.
 * @zh Ray 类用于创建射线。
 */
export class Ray {
    /**
     * @en The origin point of the ray.
     * @zh 射线的原点。
     */
	origin: Vector3;
    /**
     * @en The direction of the ray.
     * @zh 射线的方向。
     */
	direction: Vector3;

	/**
	 * @en Constructor method of the ray class.
	 * @param origin The origin point of the ray.
	 * @param direction The direction vector of the ray.
	 * @zh 射线的构造方法
	 * @param origin 射线的起点
	 * @param direction 射线的方向
	 */
	constructor(origin: Vector3, direction: Vector3) {
		this.origin = origin;
		this.direction = direction;
	}

    /**
     * @en Calculates a point on the ray at the specified parameter t.
     * @param t The parameter along the ray at which to calculate the point. 
     * @param out The `Vector3` object to store the result.
	 * @zh 计算在指定参数 t 处的射线上的点。
	 * @param t 沿射线计算点的参数。
     * @param out 存储结果的 `Vector3` 对象。
     */
	at(t: number, out: Vector3) {
		Vector3.scale(this.direction, t, out);
		Vector3.add(this.origin, out, out);
	}

}

