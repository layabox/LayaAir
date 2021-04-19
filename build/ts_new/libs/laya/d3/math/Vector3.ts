import { Vector4 } from "./Vector4";
import { Quaternion } from "./Quaternion";
import { Matrix4x4 } from "./Matrix4x4";
import { MathUtils3D } from "./MathUtils3D";
import { Vector2 } from "./Vector2";
import { IClone } from "../core/IClone"
/**
 * <code>Vector3</code> 类用于创建三维向量。
 */
export class Vector3 implements IClone {
	/**@internal	*/
	static _tempVector4: Vector4 = new Vector4();

	/**@internal	*/
	static _ZERO: Vector3 = new Vector3(0.0, 0.0, 0.0);
	/**@internal	*/
	static _ONE: Vector3 = new Vector3(1.0, 1.0, 1.0);
	/**@internal	*/
	static _NegativeUnitX: Vector3 = new Vector3(-1, 0, 0);
	/**@internal	*/
	static _UnitX: Vector3 = new Vector3(1, 0, 0);
	/**@internal	*/
	static _UnitY: Vector3 = new Vector3(0, 1, 0);
	/**@internal	*/
	static _UnitZ: Vector3 = new Vector3(0, 0, 1);
	/**@internal	*/
	static _ForwardRH: Vector3 = new Vector3(0, 0, -1);
	/**@internal	*/
	static _ForwardLH: Vector3 = new Vector3(0, 0, 1);
	/**@internal	*/
	static _Up: Vector3 = new Vector3(0, 1, 0);

	/**
	 * 两个三维向量距离的平方。
	 * @param	value1 向量1。
	 * @param	value2 向量2。
	 * @return	距离的平方。
	 */
	static distanceSquared(value1: Vector3, value2: Vector3): number {
		var x: number = value1.x - value2.x;
		var y: number = value1.y - value2.y;
		var z: number = value1.z - value2.z;
		return (x * x) + (y * y) + (z * z);
	}

	/**
	 * 两个三维向量距离。
	 * @param	value1 向量1。
	 * @param	value2 向量2。
	 * @return	距离。
	 */
	static distance(value1: Vector3, value2: Vector3): number {
		var x: number = value1.x - value2.x;
		var y: number = value1.y - value2.y;
		var z: number = value1.z - value2.z;
		return Math.sqrt((x * x) + (y * y) + (z * z));
	}

	/**
	 * 分别取两个三维向量x、y、z的最小值计算新的三维向量。
	 * @param	a。
	 * @param	b。
	 * @param	out。
	 */
	static min(a: Vector3, b: Vector3, out: Vector3): void {
		out.x = Math.min(a.x, b.x);
		out.y = Math.min(a.y, b.y);
		out.z = Math.min(a.z, b.z);
	}

	/**
	 * 分别取两个三维向量x、y、z的最大值计算新的三维向量。
	 * @param	a a三维向量。
	 * @param	b b三维向量。
	 * @param	out 结果三维向量。
	 */
	static max(a: Vector3, b: Vector3, out: Vector3): void {
		out.x = Math.max(a.x, b.x);
		out.y = Math.max(a.y, b.y);
		out.z = Math.max(a.z, b.z);
	}

	/**
	 * 根据四元数旋转三维向量。
	 * @param	source 源三维向量。
	 * @param	rotation 旋转四元数。
	 * @param	out 输出三维向量。
	 */
	static transformQuat(source: Vector3, rotation: Quaternion, out: Vector3): void {
		var x: number = source.x, y: number = source.y, z: number = source.z, qx: number = rotation.x, qy: number = rotation.y, qz: number = rotation.z, qw: number = rotation.w,

			ix: number = qw * x + qy * z - qz * y, iy: number = qw * y + qz * x - qx * z, iz: number = qw * z + qx * y - qy * x, iw: number = -qx * x - qy * y - qz * z;

		out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	}

	/**
	 * 计算标量长度。
	 * @param	a 源三维向量。
	 * @return 标量长度。
	 */
	static scalarLength(a: Vector3): number {
		var x: number = a.x, y: number = a.y, z: number = a.z;
		return Math.sqrt(x * x + y * y + z * z);
	}

	/**
	 * 计算标量长度的平方。
	 * @param	a 源三维向量。
	 * @return 标量长度的平方。
	 */
	static scalarLengthSquared(a: Vector3): number {
		var x: number = a.x, y: number = a.y, z: number = a.z;
		return x * x + y * y + z * z;
	}

	/**
	 * 归一化三维向量。
	 * @param	s 源三维向量。
	 * @param	out 输出三维向量。
	 */
	static normalize(s: Vector3, out: Vector3): void {
		var x: number = s.x, y: number = s.y, z: number = s.z;
		var len: number = x * x + y * y + z * z;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			out.x = x * len;
			out.y = y * len;
			out.z = z * len;
		}
	}

	/**
	 * 计算两个三维向量的乘积。
	 * @param	a left三维向量。
	 * @param	b right三维向量。
	 * @param	out 输出三维向量。
	 */
	static multiply(a: Vector3, b: Vector3, out: Vector3): void {
		out.x = a.x * b.x;
		out.y = a.y * b.y;
		out.z = a.z * b.z;
	}

	/**
	 * 缩放三维向量。
	 * @param	a 源三维向量。
	 * @param	b 缩放值。
	 * @param	out 输出三维向量。
	 */
	static scale(a: Vector3, b: number, out: Vector3): void {
		out.x = a.x * b;
		out.y = a.y * b;
		out.z = a.z * b;
	}

	/**
	 * 插值三维向量。
	 * @param	a left向量。
	 * @param	b right向量。
	 * @param	t 插值比例。
	 * @param	out 输出向量。
	 */
	static lerp(a: Vector3, b: Vector3, t: number, out: Vector3): void {
		var ax: number = a.x, ay: number = a.y, az: number = a.z;
		out.x = ax + t * (b.x - ax);
		out.y = ay + t * (b.y - ay);
		out.z = az + t * (b.z - az);
	}

	/**
	 * 通过矩阵转换一个三维向量到另外一个三维向量。
	 * @param	vector 源三维向量。
	 * @param	transform  变换矩阵。
	 * @param	result 输出三维向量。
	 */
	static transformV3ToV3(vector: Vector3, transform: Matrix4x4, result: Vector3): void {
		var intermediate: Vector4 = Vector3._tempVector4;
		Vector3.transformV3ToV4(vector, transform, intermediate);
		result.x = intermediate.x;
		result.y = intermediate.y;
		result.z = intermediate.z;
	}

	/**
	 * 通过矩阵转换一个三维向量到另外一个四维向量。
	 * @param	vector 源三维向量。
	 * @param	transform  变换矩阵。
	 * @param	result 输出四维向量。
	 */
	static transformV3ToV4(vector: Vector3, transform: Matrix4x4, result: Vector4): void {
		var vectorX: number = vector.x;
		var vectorY: number = vector.y;
		var vectorZ: number = vector.z;

		var transformElem: Float32Array = transform.elements;
		result.x = (vectorX * transformElem[0]) + (vectorY * transformElem[4]) + (vectorZ * transformElem[8]) + transformElem[12];
		result.y = (vectorX * transformElem[1]) + (vectorY * transformElem[5]) + (vectorZ * transformElem[9]) + transformElem[13];
		result.z = (vectorX * transformElem[2]) + (vectorY * transformElem[6]) + (vectorZ * transformElem[10]) + transformElem[14];
		result.w = (vectorX * transformElem[3]) + (vectorY * transformElem[7]) + (vectorZ * transformElem[11]) + transformElem[15];
	}

	/**
	 * 通过法线矩阵转换一个法线三维向量到另外一个三维向量。
	 * @param	normal 源法线三维向量。
	 * @param	transform  法线变换矩阵。
	 * @param	result 输出法线三维向量。
	 */
	static TransformNormal(normal: Vector3, transform: Matrix4x4, result: Vector3): void {
		var normalX: number = normal.x;
		var normalY: number = normal.y;
		var normalZ: number = normal.z;

		var transformElem: Float32Array = transform.elements;
		result.x = (normalX * transformElem[0]) + (normalY * transformElem[4]) + (normalZ * transformElem[8]);
		result.y = (normalX * transformElem[1]) + (normalY * transformElem[5]) + (normalZ * transformElem[9]);
		result.z = (normalX * transformElem[2]) + (normalY * transformElem[6]) + (normalZ * transformElem[10]);
	}

	/**
	 * 通过矩阵转换一个三维向量到另外一个归一化的三维向量。
	 * @param	vector 源三维向量。
	 * @param	transform  变换矩阵。
	 * @param	result 输出三维向量。
	 */
	static transformCoordinate(coordinate: Vector3, transform: Matrix4x4, result: Vector3): void {
		var coordinateX: number = coordinate.x;
		var coordinateY: number = coordinate.y;
		var coordinateZ: number = coordinate.z;

		var transformElem: Float32Array = transform.elements;
		var w: number = coordinateX * transformElem[3] + coordinateY * transformElem[7] + coordinateZ * transformElem[11] + transformElem[15];
		result.x = (coordinateX * transformElem[0] + coordinateY * transformElem[4] + coordinateZ * transformElem[8] + transformElem[12]) / w;
		result.y = (coordinateX * transformElem[1] + coordinateY * transformElem[5] + coordinateZ * transformElem[9] + transformElem[13]) / w;
		result.z = (coordinateX * transformElem[2] + coordinateY * transformElem[6] + coordinateZ * transformElem[10] + transformElem[14]) / w;
	}

	/**
	 * 求一个指定范围的向量
	 * @param	value clamp向量
	 * @param	min  最小
	 * @param	max  最大
	 * @param   out 输出向量
	 */
	static Clamp(value: Vector3, min: Vector3, max: Vector3, out: Vector3): void {
		var x: number = value.x;
		var y: number = value.y;
		var z: number = value.z;

		var mineX: number = min.x;
		var mineY: number = min.y;
		var mineZ: number = min.z;

		var maxeX: number = max.x;
		var maxeY: number = max.y;
		var maxeZ: number = max.z;

		x = (x > maxeX) ? maxeX : x;
		x = (x < mineX) ? mineX : x;

		y = (y > maxeY) ? maxeY : y;
		y = (y < mineY) ? mineY : y;

		z = (z > maxeZ) ? maxeZ : z;
		z = (z < mineZ) ? mineZ : z;

		out.x = x;
		out.y = y;
		out.z = z;
	}

	/**
	 * 求两个三维向量的和。
	 * @param	a left三维向量。
	 * @param	b right三维向量。
	 * @param	out 输出向量。
	 */
	static add(a: Vector3, b: Vector3, out: Vector3): void {
		out.x = a.x + b.x;
		out.y = a.y + b.y;
		out.z = a.z + b.z;
	}

	/**
	 * 求两个三维向量的差。
	 * @param	a  left三维向量。
	 * @param	b  right三维向量。
	 * @param	o out 输出向量。
	 */
	static subtract(a: Vector3, b: Vector3, o: Vector3): void {
		o.x = a.x - b.x;
		o.y = a.y - b.y;
		o.z = a.z - b.z;
	}

	/**
	 * 求两个三维向量的叉乘。
	 * @param	a left向量。
	 * @param	b right向量。
	 * @param	o 输出向量。
	 */
	static cross(a: Vector3, b: Vector3, o: Vector3): void {
		var ax: number = a.x, ay: number = a.y, az: number = a.z, bx: number = b.x, by: number = b.y, bz: number = b.z;
		o.x = ay * bz - az * by;
		o.y = az * bx - ax * bz;
		o.z = ax * by - ay * bx;
	}

	/**
	 * 求两个三维向量的点积。
	 * @param	a left向量。
	 * @param	b right向量。
	 * @return   点积。
	 */
	static dot(a: Vector3, b: Vector3): number {
		return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
	}

	/**
	 * 判断两个三维向量是否相等。
	 * @param	a 三维向量。
	 * @param	b 三维向量。
	 * @return  是否相等。
	 */
	static equals(a: Vector3, b: Vector3): boolean {
		return MathUtils3D.nearEqual(a.x, b.x) && MathUtils3D.nearEqual(a.y, b.y) && MathUtils3D.nearEqual(a.z, b.z);
	}

	/**X轴坐标*/
	x: number;
	/**Y轴坐标*/
	y: number;
	/**Z轴坐标*/
	z: number;

	/**
	 * 创建一个 <code>Vector3</code> 实例。
	 * @param	x  X轴坐标。
	 * @param	y  Y轴坐标。
	 * @param	z  Z轴坐标。
	 */
	constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * 设置xyz值。
	 * @param	x X值。
	 * @param	y Y值。
	 * @param	z Z值。
	 */
	setValue(x: number, y: number, z: number): void {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * 从Array数组拷贝值。
	 * @param  array 数组。
	 * @param  offset 数组偏移。
	 */
	fromArray(array: any[], offset: number = 0): void {
		this.x = array[offset + 0];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
	}

	
	/**
	 * 写入Array数组
	 * @param array 数组。
	 * @param offset 数组偏移。 
	 */
	toArray(array:Float32Array,offset:number = 0):void{
		array[offset + 0] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destVector3: Vector3 = (<Vector3>destObject);
		destVector3.x = this.x;
		destVector3.y = this.y;
		destVector3.z = this.z;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destVector3: Vector3 = new Vector3();
		this.cloneTo(destVector3);
		return destVector3;
	}

	toDefault(): void {
		this.x = 0;
		this.y = 0;
		this.z = 0;
	}

	forNativeElement(nativeElements: Float32Array = null): void {
		if (nativeElements) {
			(<any>this).elements = nativeElements;
			(<any>this).elements[0] = this.x;
			(<any>this).elements[1] = this.y;
			(<any>this).elements[2] = this.z;
		}
		else {
			(<any>this).elements = new Float32Array([this.x, this.y, this.z]);
		}
		Vector2.rewriteNumProperty(this, "x", 0);
		Vector2.rewriteNumProperty(this, "y", 1);
		Vector2.rewriteNumProperty(this, "z", 2);
	}
}

