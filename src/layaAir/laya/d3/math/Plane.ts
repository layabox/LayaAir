import { Vector3 } from "../../maths/Vector3";

/**
 * 平面。
 */
export class Plane {
	/**平面与其他几何体相交类型，后面*/
	static PlaneIntersectionType_Back: number = 0;
	/**平面与其他几何体相交类型，前面*/
	static PlaneIntersectionType_Front: number = 1;
	/**平面与其他几何体相交类型，相交*/
	static PlaneIntersectionType_Intersecting: number = 2;

	/**@internal 平面的向量*/
	_normal: Vector3;

	/**@internal 平面到坐标系原点的距离*/
	_distance: number;

	/**
	 * 创建一个 <code>Plane</code> 实例。
	 * @param	normal 平面的向量
	 * @param	d  平面到原点的距离
	 */
	constructor(normal: Vector3 = new Vector3, d: number = 0) {
		this._normal = normal;
		this._distance = d;//this.distance = d;
	}

	/**
	 * 平面法线
	 */
	set normal(value: Vector3) {
		value.cloneTo(this._normal);
	}

	get normal() {
		return this._normal;
	}

	/**
	 * 平面距离
	 */
	set distance(value: number) {
		this._distance = value;
	}

	get distance(): number {
		return this._distance;
	}

	/**
	 * 通过三个点创建一个平面。
	 * @param	point0 第零个点
	 * @param	point1 第一个点
	 * @param	point2 第二个点
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
	 * 更改平面法线向量的系数，使之成单位长度。
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
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var dest: Plane = <Plane>destObject;
		this.normal.cloneTo(dest.normal);
		dest.distance = this.distance;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): Plane {
		var dest = new Plane();
		this.cloneTo(dest);
		return dest;
	}

}



