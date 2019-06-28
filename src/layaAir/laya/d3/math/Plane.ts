import { Vector3 } from "./Vector3";
/**
	 * <code>Plane</code> 类用于创建平面。
	 */
export class Plane {

	/** @internal */
	private static _TEMPVec3: Vector3 = new Vector3();
	/**平面的向量*/
	normal: Vector3;
	/**平面到坐标系原点的距离*/
	distance: number;
	/**平面与其他几何体相交类型*/
	static PlaneIntersectionType_Back: number = 0;
	static PlaneIntersectionType_Front: number = 1;
	static PlaneIntersectionType_Intersecting: number = 2;

	/**
	 * 创建一个 <code>Plane</code> 实例。
	 * @param	normal 平面的向量
	 * @param	d  平面到原点的距离
	 */
	constructor(normal: Vector3, d: number = 0) {
		this.normal = normal;
		this.distance = d;
	}

	/**
	 * 创建一个 <code>Plane</code> 实例。
	 * @param	point1 第一点
	 * @param	point2 第二点
	 * @param	point3 第三点
	 */
	static createPlaneBy3P(point1: Vector3, point2: Vector3, point3: Vector3): Plane {
		var x1: number = point2.x - point1.x;
		var y1: number = point2.y - point1.y;
		var z1: number = point2.z - point1.z;
		var x2: number = point3.x - point1.x;
		var y2: number = point3.y - point1.y;
		var z2: number = point3.z - point1.z;
		var yz: number = (y1 * z2) - (z1 * y2);
		var xz: number = (z1 * x2) - (x1 * z2);
		var xy: number = (x1 * y2) - (y1 * x2);
		var invPyth: number = 1 / (Math.sqrt((yz * yz) + (xz * xz) + (xy * xy)));

		var x: number = yz * invPyth;
		var y: number = xz * invPyth;
		var z: number = xy * invPyth;

		Plane._TEMPVec3.x = x;
		Plane._TEMPVec3.y = y;
		Plane._TEMPVec3.z = z;

		var d: number = -((x * point1.x) + (y * point1.y) + (z * point1.z));

		var plane: Plane = new Plane(Plane._TEMPVec3, d);
		return plane;
	}

	/**
	 * 更改平面法线向量的系数，使之成单位长度。
	 */
	normalize(): void {
		var normalEX: number = this.normal.x;
		var normalEY: number = this.normal.y;
		var normalEZ: number = this.normal.z;
		var magnitude: number = 1 / Math.sqrt(normalEX * normalEX + normalEY * normalEY + normalEZ * normalEZ);

		this.normal.x = normalEX * magnitude;
		this.normal.y = normalEY * magnitude;
		this.normal.z = normalEZ * magnitude;

		this.distance *= magnitude;
	}

}



