import { Vector2 } from "../../../../../maths/Vector2";
import { Vector3 } from "../../../../../maths/Vector3";
import { Rand } from "../../../../math/Rand"

/**
 * @internal
 * @en Utility class for generating random points in various shapes.
 * @zh 用于在各种形状中生成随机点的实用工具类。
 */
export class ShapeUtils {
	/**
	 * @en Generates a random point on the arc of a unit circle.
	 * @param arc The arc angle in radians.
	 * @param out The output Vector2 to store the result.
	 * @param rand Optional random number generator. If not provided, Math.random() will be used.
	 * @zh 在单位圆弧上生成一个随机点。
	 * @param arc 弧度角度。
	 * @param out 输出 Vector2 用于存储结果。
	 * @param rand 可选的随机数生成器。如果不提供，则使用 Math.random()。
	 */
	static _randomPointUnitArcCircle(arc: number, out: Vector2, rand: Rand = null): void {
		var angle: number;
		if (rand)
			angle = rand.getFloat() * arc;
		else
			angle = Math.random() * arc;
		out.x = Math.cos(angle);
		out.y = Math.sin(angle);
	}

	/**
	 * @en Generates a random point inside the arc of a unit circle.
	 * @param arc The arc angle in radians.
	 * @param out The output Vector2 to store the result.
	 * @param rand Optional random number generator. If not provided, Math.random() will be used.
	 * @zh 在单位圆弧内生成一个随机点。
	 * @param arc 弧度角度。
	 * @param out 输出 Vector2 用于存储结果。
	 * @param rand 可选的随机数生成器。如果不提供，则使用 Math.random()。
	 */
	static _randomPointInsideUnitArcCircle(arc: number, out: Vector2, rand: Rand = null): void {
		ShapeUtils._randomPointUnitArcCircle(arc, out, rand);
		var range: number;
		if (rand)
			range = Math.pow(rand.getFloat(), 1.0 / 2.0);
		else
			range = Math.pow(Math.random(), 1.0 / 2.0);
		out.x = out.x * range;
		out.y = out.y * range;
	}

	/**
	 * @en Generates a random point on the circumference of a unit circle.
	 * @param out The output Vector2 to store the result.
	 * @param rand Optional random number generator. If not provided, Math.random() will be used.
	 * @zh 在单位圆周上生成一个随机点。
	 * @param out 输出 Vector2 用于存储结果。
	 * @param rand 可选的随机数生成器。如果不提供，则使用 Math.random()。
	 */
	static _randomPointUnitCircle(out: Vector2, rand: Rand = null): void {
		var angle: number;
		if (rand)
			angle = rand.getFloat() * Math.PI * 2;
		else
			angle = Math.random() * Math.PI * 2;
		out.x = Math.cos(angle);
		out.y = Math.sin(angle);
	}

	/**
	 * @en Generates a random point inside a unit circle.
	 * @param out The output Vector2 to store the result.
	 * @param rand Optional random number generator. If not provided, Math.random() will be used.
	 * @zh 在单位圆内生成一个随机点。
	 * @param out 输出 Vector2 用于存储结果。
	 * @param rand 可选的随机数生成器。如果不提供，则使用 Math.random()。
	 */
	static _randomPointInsideUnitCircle(out: Vector2, rand: Rand = null): void {
		ShapeUtils._randomPointUnitCircle(out);
		var range: number;
		if (rand)
			range = Math.pow(rand.getFloat(), 1.0 / 2.0);
		else
			range = Math.pow(Math.random(), 1.0 / 2.0);
		out.x = out.x * range;
		out.y = out.y * range;
	}

	/**
	 * @en Generates a random point on the surface of a unit sphere.
	 * @param out The output Vector3 to store the result.
	 * @param rand Optional random number generator. If not provided, Math.random() will be used.
	 * @zh 在单位球面上生成一个随机点。
	 * @param out 输出 Vector3 用于存储结果。
	 * @param rand 可选的随机数生成器。如果不提供，则使用 Math.random()。
	 */
	static _randomPointUnitSphere(out: Vector3, rand: Rand = null): void {
		var z: number;
		var a: number;
		if (rand) {
			z = out.z = rand.getFloat() * 2 - 1.0;
			a = rand.getFloat() * Math.PI * 2;
		} else {
			z = out.z = Math.random() * 2 - 1.0;
			a = Math.random() * Math.PI * 2;
		}

		var r: number = Math.sqrt(1.0 - z * z);

		out.x = r * Math.cos(a);
		out.y = r * Math.sin(a);
	}

	/**
	 * @en Generates a random point inside a unit sphere.
	 * @param out The output Vector3 to store the result.
	 * @param rand Optional random number generator. If not provided, Math.random() will be used.
	 * @zh 在单位球体内生成一个随机点。
	 * @param out 输出 Vector3 用于存储结果。
	 * @param rand 可选的随机数生成器。如果不提供，则使用 Math.random()。
	 */
	static _randomPointInsideUnitSphere(out: Vector3, rand: Rand = null): void {
		;
		ShapeUtils._randomPointUnitSphere(out);
		var range: number;
		if (rand)
			range = Math.pow(rand.getFloat(), 1.0 / 3.0);
		else
			range = Math.pow(Math.random(), 1.0 / 3.0);
		out.x = out.x * range;
		out.y = out.y * range;
		out.z = out.z * range;
	}

	/**
	 * @en Generates a random point inside half of a unit box (cube).
	 * @param out The output Vector3 to store the result.
	 * @param rand Optional random number generator. If not provided, Math.random() will be used.
	 * @zh 在半单位立方体内生成一个随机点。
	 * @param out 输出 Vector3 用于存储结果。
	 * @param rand 可选的随机数生成器。如果不提供，则使用 Math.random()。
	 */
	static _randomPointInsideHalfUnitBox(out: Vector3, rand: Rand = null): void {
		if (rand) {
			out.x = (rand.getFloat() - 0.5);
			out.y = (rand.getFloat() - 0.5);
			out.z = (rand.getFloat() - 0.5);
		} else {
			out.x = (Math.random() - 0.5);
			out.y = (Math.random() - 0.5);
			out.z = (Math.random() - 0.5);
		}
	}

	constructor() {
	}

}


