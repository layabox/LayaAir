import { Vector3 } from "../../maths/Vector3";

/**
 * @en Plane in 3D space.
 * @zh 三维空间中的平面。
 */
export class Plane {
    /**
     * @en Intersection type of the plane with other geometries, indicating the back side.
     * @zh 平面与其他几何体相交类型，表示背面。
     */
	static PlaneIntersectionType_Back: number = 0;
    /**
     * @en Intersection type of the plane with other geometries, indicating the front side.
     * @zh 平面与其他几何体相交类型，表示正面。
     */
	static PlaneIntersectionType_Front: number = 1;
    /**
     * @en Intersection type of the plane with other geometries, indicating intersection.
     * @zh 平面与其他几何体相交类型，表示相交。
     */
	static PlaneIntersectionType_Intersecting: number = 2;

    /**
	 * @internal
     * @en The normal vector of the plane.
     * @zh 平面的法线向量。
     */
	normal: Vector3;

    /**
	 * @internal
     * @en The distance from the plane to the origin of the coordinate system.
     * @zh 平面到坐标系原点的距离。
     */
	distance: number;

	/**
	 * @en Constructor method of the plane.
	 * @param normal The normal vector of the plane.
	 * @param d The distance from the plane to the origin of the coordinate system.
	 * @zh 平面的构造方法
	 * @param normal 平面的向量
	 * @param d  平面到原点的距离
	 */
	constructor(normal: Vector3 = new Vector3, d: number = 0) {
		this.normal = normal;
		this.distance = d;//this.distance = d;
	}


    /**
     * @en Creates a plane defined by three points.
     * @param point0 The first point.
     * @param point1 The second point.
     * @param point2 The third point.
     * @param out The plane to store the result.
     * @zh 通过三个点创建一个平面。
     * @param point0 第一个点。
     * @param point1 第二个点。
     * @param point2 第三个点。
     * @param out 存储结果的平面。
     */
	static createPlaneBy3P(point0: Vector3, point1: Vector3, point2: Vector3, out: Plane): void {
		var x1: number = point1.x - point0.x;
		var y1: number = point1.y - point0.y;
		var z1: number = point1.z - point0.z;
		var x2: number = point2.x - point0.x;
		var y2: number = point2.y - point0.y;
		var z2: number = point2.z - point0.z;
		var yz: number = (y1 * z2) - (z1 * y2);
		var xz: number = (z1 * x2) - (x1 * z2);
		var xy: number = (x1 * y2) - (y1 * x2);
		var invPyth: number = 1.0 / (Math.sqrt((yz * yz) + (xz * xz) + (xy * xy)));

		var x: number = yz * invPyth;
		var y: number = xz * invPyth;
		var z: number = xy * invPyth;

		var normal: Vector3 = out.normal;
		normal.x = x;
		normal.y = y;
		normal.z = z;
		out.normal = normal.normalize();
		out.distance = -((x * point0.x) + (y * point0.y) + (z * point0.z));
	}


    /**
     * @en Normalizes the plane's normal vector to unit length.
     * @zh 使平面的法线向量成为单位长度。
     */
	normalize(): void {
		var normalEX: number = this.normal.x;
		var normalEY: number = this.normal.y;
		var normalEZ: number = this.normal.z;
		var magnitude: number = 1.0 / Math.sqrt(normalEX * normalEX + normalEY * normalEY + normalEZ * normalEZ);

		this.normal.x = normalEX * magnitude;
		this.normal.y = normalEY * magnitude;
		this.normal.z = normalEZ * magnitude;
		this.distance *= magnitude;
	}

    /**
     * @en Clones the plane into another object.
     * @param destObject The destination object to clone into. 
	 * @zh 克隆平面到另一个对象。
     * @param destObject 克隆目标对象。
     */
	cloneTo(destObject: Plane): void {
		this.normal.cloneTo(destObject.normal);
		destObject.distance = this.distance;
	}

    /**
     * @en Creates a clone of this plane.
     * @return A new Plane instance that is a clone of this one.
	 * @zh 创建这个平面的克隆。
     * @return 一个新的 Plane 实例，是当前平面的克隆。
     */
	clone(): Plane {
		var dest = new Plane();
		this.cloneTo(dest);
		return dest;
	}

}



