import { Ray } from "./Ray";
import { CollisionUtils } from "./CollisionUtils";
import { IClone } from "../../utils/IClone"
import { Vector3 } from "../../maths/Vector3";

/**
 * @en The BoundSphere class is used to create bounding balls.
 * @zh BoundSphere 类用于创建包围球。
 */
export class BoundSphere implements IClone {
	/** @internal 包围球的中心。*/
	_center: Vector3;
	/** @internal 包围球的半径。*/
	_radius: number;

	/**
	 * @en The center of the bounding sphere.
	 * @zh 包围球的中心。
	 */
	get center() {
		return this._center;
	}

	set center(value: Vector3) {
		value.cloneTo(this._center);
	}


	/**
	 * @en The radius of the bounding sphere.
	 * @zh 包围球的半径。
	 */
	get radius(): number {
		return this._radius
	}

	set radius(value: number) {
		this._radius = value;
	}


	/**
	 * @en Constructor method.
	 * @param center The center of the bounding sphere.
	 * @param radius The radius of the bounding sphere.
	 * @zh 构造方法
	 * @param center 包围球的中心。
	 * @param radius 包围球的半径。
	 */
	constructor(center: Vector3 = new Vector3, radius: number = 0) {
		this._center = center;
		this._radius = radius;
	}

	/**
	 * @en Resets the bound sphere to its default state.
	 * @zh 将包围球重置为其默认状态。
	 */
	toDefault(): void {
		this._center.toDefault();
		this._radius = 0;
	}

	/**
	 * @en Generates a bounding sphere from a subset of vertex points.
	 * @param points The array of vertex points.
	 * @param start The starting offset of the vertex subset.
	 * @param count The number of vertices in the subset.
	 * @param out The resulting bounding sphere.
	 * @zh 从顶点的子队列生成包围球。
	 * @param points 顶点的队列。
	 * @param start 顶点子队列的起始偏移。
	 * @param count 顶点子队列的顶点数。
	 * @param out 生成的包围球。
	 */

	static createFromSubPoints(points: Vector3[], start: number, count: number, out: BoundSphere): void {
		if (points == null) {
			throw new Error("points");
		}

		// Check that start is in the correct range 
		if (start < 0 || start >= points.length) {
			throw new Error("start" + start + "Must be in the range [0, " + (points.length - 1) + "]");
		}

		// Check that count is in the correct range 
		if (count < 0 || (start + count) > points.length) {
			throw new Error("count" + count + "Must be in the range <= " + points.length + "}");
		}

		var upperEnd: number = start + count;

		//Find the center of all points. 
		var center: Vector3 = _tempVector3;
		center.x = 0;
		center.y = 0;
		center.z = 0;
		for (var i: number = start; i < upperEnd; ++i) {
			Vector3.add(points[i], center, center);
		}

		var outCenter: Vector3 = out.center;
		//This is the center of our sphere. 
		Vector3.scale(center, 1 / count, outCenter);

		//Find the radius of the sphere 
		var radius: number = 0.0;
		for (i = start; i < upperEnd; ++i) {
			//We are doing a relative distance comparison to find the maximum distance 
			//from the center of our sphere. 
			var distance: number = Vector3.distanceSquared(outCenter, points[i]);

			if (distance > radius)
				radius = distance;
		}

		//Find the real distance from the DistanceSquared. 
		out.radius = Math.sqrt(radius);
	}

	/**
	 * @en Generates a bounding sphere from a vertex point array.
	 * @param points The array of vertex points.
	 * @param out The resulting bounding sphere.
	 * @zh 从顶点队列生成包围球。
	 * @param points 顶点的队列。
	 * @param out 生成的包围球。
	 */

	static createfromPoints(points: Vector3[], out: BoundSphere): void {
		if (points == null) {
			throw new Error("points");
		}

		BoundSphere.createFromSubPoints(points, 0, points.length, out);
	}

	/**
	 * @en Determines whether a ray intersects with the bounding sphere and returns the distance to the intersection point.
	 * @param ray The ray.
	 * @returns The distance to the intersection point, or -1 if there is no intersection.
	 * @zh 判断射线是否与包围球相交，并返回到交点的距离。
	 * @param ray 射线。
	 * @returns 到交点的距离，如果没有交点则为 -1。
	 */
	intersectsRayDistance(ray: Ray): number {
		return CollisionUtils.intersectsRayAndSphereRD(ray, this);
	}

	/**
	 * @en Determines whether a ray intersects with the bounding sphere and returns the intersection point.
	 * @param ray The ray.
	 * @param outPoint The intersection point.
	 * @returns The distance to the intersection point, or -1 if there is no intersection.
	 * @zh 判断射线是否与包围球相交，并返回交点。
	 * @param ray 射线。
	 * @param outPoint 交点。
	 * @returns 到交点的距离，如果没有交点则为 -1。
	 */
	intersectsRayPoint(ray: Ray, outPoint: Vector3): number {
		return CollisionUtils.intersectsRayAndSphereRP(ray, this, outPoint);
	}

	/**
	 * @en Clones this bounding sphere into another object.
	 * @param destObject The destination object to clone into.
	 * @zh 克隆这个包围球到另一个对象。
	 * @param destObject 克隆目标对象。
	 */
	cloneTo(destObject: BoundSphere): void {
		this._center.cloneTo(destObject._center);
		destObject._radius = this._radius;
	}

	/**
	 * @en Creates a clone of this bounding sphere.
	 * @return A new `BoundSphere` instance that is a clone of this one.
	 * @zh 创建这个包围球的克隆。
	 * @return 一个新的 `BoundSphere` 实例，是当前包围球的克隆。
	 */
	clone(): any {
		var dest: BoundSphere = new BoundSphere(new Vector3(), 0);
		this.cloneTo(dest);
		return dest;
	}

}

const _tempVector3: Vector3 = new Vector3();