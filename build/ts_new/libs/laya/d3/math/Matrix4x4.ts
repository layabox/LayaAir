import { Vector3 } from "./Vector3";
import { Quaternion } from "./Quaternion";
import { MathUtils3D } from "./MathUtils3D";
import { IClone } from "../core/IClone"
import { LayaGL } from "../../layagl/LayaGL"

/**
 * <code>Matrix4x4</code> 类用于创建4x4矩阵。
 */
export class Matrix4x4 implements IClone {
	/**@internal */
	private static _tempMatrix4x4: Matrix4x4 = new Matrix4x4();
	/**@internal */
	static TEMPMatrix0: Matrix4x4 = new Matrix4x4();
	/**@internal */
	static TEMPMatrix1: Matrix4x4 = new Matrix4x4();
	/**@internal */
	private static _tempVector0: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector1: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector2: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector3: Vector3 = new Vector3();
	/**@internal */
	private static _tempQuaternion: Quaternion = new Quaternion();

	/**默认矩阵,禁止修改*/
	static DEFAULT: Matrix4x4 = new Matrix4x4();
	/**默认矩阵,禁止修改*/
	static ZERO: Matrix4x4 = new Matrix4x4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	/**
	 * 绕X轴旋转
	 * @param	rad  旋转角度
	 * @param	out 输出矩阵
	 */
	static createRotationX(rad: number, out: Matrix4x4): void {
		var oe: Float32Array = out.elements;
		var s: number = Math.sin(rad), c: number = Math.cos(rad);

		oe[1] = oe[2] = oe[3] = oe[4] = oe[7] = oe[8] = oe[11] = oe[12] = oe[13] = oe[14] = 0;
		oe[0] = oe[15] = 1;
		oe[5] = oe[10] = c;
		oe[6] = s;
		oe[9] = -s;
	}

	/**
	 *
	 * 绕Y轴旋转
	 * @param	rad  旋转角度
	 * @param	out 输出矩阵
	 */
	static createRotationY(rad: number, out: Matrix4x4): void {

		var oe: Float32Array = out.elements;
		var s: number = Math.sin(rad), c: number = Math.cos(rad);

		oe[1] = oe[3] = oe[4] = oe[6] = oe[7] = oe[9] = oe[11] = oe[12] = oe[13] = oe[14] = 0;
		oe[5] = oe[15] = 1;
		oe[0] = oe[10] = c;
		oe[2] = -s;
		oe[8] = s;
	}

	/**
	 * 绕Z轴旋转
	 * @param	rad  旋转角度
	 * @param	out 输出矩阵
	 */
	static createRotationZ(rad: number, out: Matrix4x4): void {

		var oe: Float32Array = out.elements;
		var s: number = Math.sin(rad), c: number = Math.cos(rad);

		oe[2] = oe[3] = oe[6] = oe[7] = oe[8] = oe[9] = oe[11] = oe[12] = oe[13] = oe[14] = 0;
		oe[10] = oe[15] = 1;
		oe[0] = oe[5] = c;
		oe[1] = s;
		oe[4] = -s;
	}

	/**
	 * 通过yaw pitch roll旋转创建旋转矩阵。
	 * @param	yaw
	 * @param	pitch
	 * @param	roll
	 * @param	result
	 */
	static createRotationYawPitchRoll(yaw: number, pitch: number, roll: number, result: Matrix4x4): void {
		Quaternion.createFromYawPitchRoll(yaw, pitch, roll, Matrix4x4._tempQuaternion);
		Matrix4x4.createRotationQuaternion(Matrix4x4._tempQuaternion, result);
	}

	/**
	 * 通过旋转轴axis和旋转角度angle计算旋转矩阵。
	 * @param	axis 旋转轴,假定已经归一化。
	 * @param	angle 旋转角度。
	 * @param	result 结果矩阵。
	 */
	static createRotationAxis(axis: Vector3, angle: number, result: Matrix4x4): void {
		var x: number = axis.x;
		var y: number = axis.y;
		var z: number = axis.z;
		var cos: number = Math.cos(angle);
		var sin: number = Math.sin(angle);
		var xx: number = x * x;
		var yy: number = y * y;
		var zz: number = z * z;
		var xy: number = x * y;
		var xz: number = x * z;
		var yz: number = y * z;

		var resultE: Float32Array = result.elements;
		resultE[3] = resultE[7] = resultE[11] = resultE[12] = resultE[13] = resultE[14] = 0;
		resultE[15] = 1.0;
		resultE[0] = xx + (cos * (1.0 - xx));
		resultE[1] = (xy - (cos * xy)) + (sin * z);
		resultE[2] = (xz - (cos * xz)) - (sin * y);
		resultE[4] = (xy - (cos * xy)) - (sin * z);
		resultE[5] = yy + (cos * (1.0 - yy));
		resultE[6] = (yz - (cos * yz)) + (sin * x);
		resultE[8] = (xz - (cos * xz)) + (sin * y);
		resultE[9] = (yz - (cos * yz)) - (sin * x);
		resultE[10] = zz + (cos * (1.0 - zz));
	}

	setRotation(rotation: Quaternion): void {
		var rotationX: number = rotation.x;
		var rotationY: number = rotation.y;
		var rotationZ: number = rotation.z;
		var rotationW: number = rotation.w;

		var xx: number = rotationX * rotationX;
		var yy: number = rotationY * rotationY;
		var zz: number = rotationZ * rotationZ;
		var xy: number = rotationX * rotationY;
		var zw: number = rotationZ * rotationW;
		var zx: number = rotationZ * rotationX;
		var yw: number = rotationY * rotationW;
		var yz: number = rotationY * rotationZ;
		var xw: number = rotationX * rotationW;

		var e: Float32Array = this.elements;
		e[0] = 1.0 - (2.0 * (yy + zz));
		e[1] = 2.0 * (xy + zw);
		e[2] = 2.0 * (zx - yw);
		e[4] = 2.0 * (xy - zw);
		e[5] = 1.0 - (2.0 * (zz + xx));
		e[6] = 2.0 * (yz + xw);
		e[8] = 2.0 * (zx + yw);
		e[9] = 2.0 * (yz - xw);
		e[10] = 1.0 - (2.0 * (yy + xx));
	}

	setPosition(position: Vector3): void {
		var e: Float32Array = this.elements;
		e[12] = position.x;
		e[13] = position.y;
		e[14] = position.z;
	}

	/**
	 * 通过四元数创建旋转矩阵。
	 * @param	rotation 旋转四元数。
	 * @param	result 输出旋转矩阵
	 */
	static createRotationQuaternion(rotation: Quaternion, result: Matrix4x4): void {
		var resultE: Float32Array = result.elements;
		var rotationX: number = rotation.x;
		var rotationY: number = rotation.y;
		var rotationZ: number = rotation.z;
		var rotationW: number = rotation.w;

		var xx: number = rotationX * rotationX;
		var yy: number = rotationY * rotationY;
		var zz: number = rotationZ * rotationZ;
		var xy: number = rotationX * rotationY;
		var zw: number = rotationZ * rotationW;
		var zx: number = rotationZ * rotationX;
		var yw: number = rotationY * rotationW;
		var yz: number = rotationY * rotationZ;
		var xw: number = rotationX * rotationW;

		resultE[3] = resultE[7] = resultE[11] = resultE[12] = resultE[13] = resultE[14] = 0;
		resultE[15] = 1.0;
		resultE[0] = 1.0 - (2.0 * (yy + zz));
		resultE[1] = 2.0 * (xy + zw);
		resultE[2] = 2.0 * (zx - yw);
		resultE[4] = 2.0 * (xy - zw);
		resultE[5] = 1.0 - (2.0 * (zz + xx));
		resultE[6] = 2.0 * (yz + xw);
		resultE[8] = 2.0 * (zx + yw);
		resultE[9] = 2.0 * (yz - xw);
		resultE[10] = 1.0 - (2.0 * (yy + xx));
	}

	/**
	 * 根据平移计算输出矩阵
	 * @param	trans  平移向量
	 * @param	out 输出矩阵
	 */
	static createTranslate(trans: Vector3, out: Matrix4x4): void {

		var oe: Float32Array = out.elements;
		oe[4] = oe[8] = oe[1] = oe[9] = oe[2] = oe[6] = oe[3] = oe[7] = oe[11] = 0;
		oe[0] = oe[5] = oe[10] = oe[15] = 1;
		oe[12] = trans.x;
		oe[13] = trans.y;
		oe[14] = trans.z;
	}

	/**
	 * 根据缩放计算输出矩阵
	 * @param	scale  缩放值
	 * @param	out 输出矩阵
	 */
	static createScaling(scale: Vector3, out: Matrix4x4): void {

		var oe: Float32Array = out.elements;
		oe[0] = scale.x;
		oe[5] = scale.y;
		oe[10] = scale.z;
		oe[1] = oe[4] = oe[8] = oe[12] = oe[9] = oe[13] = oe[2] = oe[6] = oe[14] = oe[3] = oe[7] = oe[11] = 0;
		oe[15] = 1;
	}

	/**
	 * 计算两个矩阵的乘法
	 * @param	left left矩阵
	 * @param	right  right矩阵
	 * @param	out  输出矩阵
	 */
	static multiply(left: Matrix4x4, right: Matrix4x4, out: Matrix4x4): void {
		var l: Float32Array = right.elements;
		var r: Float32Array = left.elements;
		var e: Float32Array = out.elements;

		var l11: number = l[0], l12: number = l[1], l13: number = l[2], l14: number = l[3];
		var l21: number = l[4], l22: number = l[5], l23: number = l[6], l24: number = l[7];
		var l31: number = l[8], l32: number = l[9], l33: number = l[10], l34: number = l[11];
		var l41: number = l[12], l42: number = l[13], l43: number = l[14], l44: number = l[15];

		var r11: number = r[0], r12: number = r[1], r13: number = r[2], r14: number = r[3];
		var r21: number = r[4], r22: number = r[5], r23: number = r[6], r24: number = r[7];
		var r31: number = r[8], r32: number = r[9], r33: number = r[10], r34: number = r[11];
		var r41: number = r[12], r42: number = r[13], r43: number = r[14], r44: number = r[15];

		e[0] = (l11 * r11) + (l12 * r21) + (l13 * r31) + (l14 * r41);
		e[1] = (l11 * r12) + (l12 * r22) + (l13 * r32) + (l14 * r42);
		e[2] = (l11 * r13) + (l12 * r23) + (l13 * r33) + (l14 * r43);
		e[3] = (l11 * r14) + (l12 * r24) + (l13 * r34) + (l14 * r44);
		e[4] = (l21 * r11) + (l22 * r21) + (l23 * r31) + (l24 * r41);
		e[5] = (l21 * r12) + (l22 * r22) + (l23 * r32) + (l24 * r42);
		e[6] = (l21 * r13) + (l22 * r23) + (l23 * r33) + (l24 * r43);
		e[7] = (l21 * r14) + (l22 * r24) + (l23 * r34) + (l24 * r44);
		e[8] = (l31 * r11) + (l32 * r21) + (l33 * r31) + (l34 * r41);
		e[9] = (l31 * r12) + (l32 * r22) + (l33 * r32) + (l34 * r42);
		e[10] = (l31 * r13) + (l32 * r23) + (l33 * r33) + (l34 * r43);
		e[11] = (l31 * r14) + (l32 * r24) + (l33 * r34) + (l34 * r44);
		e[12] = (l41 * r11) + (l42 * r21) + (l43 * r31) + (l44 * r41);
		e[13] = (l41 * r12) + (l42 * r22) + (l43 * r32) + (l44 * r42);
		e[14] = (l41 * r13) + (l42 * r23) + (l43 * r33) + (l44 * r43);
		e[15] = (l41 * r14) + (l42 * r24) + (l43 * r34) + (l44 * r44);
	}

	static multiplyForNative(left: Matrix4x4, right: Matrix4x4, out: Matrix4x4): void {
		(<any>LayaGL.instance).matrix4x4Multiply(left.elements, right.elements, out.elements);
	}

	/**
	 * 从四元数计算旋转矩阵
	 * @param	rotation 四元数
	 * @param	out 输出矩阵
	 */
	static createFromQuaternion(rotation: Quaternion, out: Matrix4x4): void {
		var e: Float32Array = out.elements;
		var x: number = rotation.x, y: number = rotation.y, z: number = rotation.z, w: number = rotation.w;
		var x2: number = x + x;
		var y2: number = y + y;
		var z2: number = z + z;

		var xx: number = x * x2;
		var yx: number = y * x2;
		var yy: number = y * y2;
		var zx: number = z * x2;
		var zy: number = z * y2;
		var zz: number = z * z2;
		var wx: number = w * x2;
		var wy: number = w * y2;
		var wz: number = w * z2;

		e[0] = 1 - yy - zz;
		e[1] = yx + wz;
		e[2] = zx - wy;
		e[3] = 0;

		e[4] = yx - wz;
		e[5] = 1 - xx - zz;
		e[6] = zy + wx;
		e[7] = 0;

		e[8] = zx + wy;
		e[9] = zy - wx;
		e[10] = 1 - xx - yy;
		e[11] = 0;

		e[12] = 0;
		e[13] = 0;
		e[14] = 0;
		e[15] = 1;
	}

	/**
	 * 计算仿射矩阵
	 * @param	trans 平移
	 * @param	rot 旋转
	 * @param	scale 缩放
	 * @param	out 输出矩阵
	 */
	static createAffineTransformation(trans: Vector3, rot: Quaternion, scale: Vector3, out: Matrix4x4): void {
		var oe: Float32Array = out.elements;

		var x: number = rot.x, y: number = rot.y, z: number = rot.z, w: number = rot.w, x2: number = x + x, y2: number = y + y, z2: number = z + z;
		var xx: number = x * x2, xy: number = x * y2, xz: number = x * z2, yy: number = y * y2, yz: number = y * z2, zz: number = z * z2;
		var wx: number = w * x2, wy: number = w * y2, wz: number = w * z2, sx: number = scale.x, sy: number = scale.y, sz: number = scale.z;

		oe[0] = (1 - (yy + zz)) * sx;
		oe[1] = (xy + wz) * sx;
		oe[2] = (xz - wy) * sx;
		oe[3] = 0;
		oe[4] = (xy - wz) * sy;
		oe[5] = (1 - (xx + zz)) * sy;
		oe[6] = (yz + wx) * sy;
		oe[7] = 0;
		oe[8] = (xz + wy) * sz;
		oe[9] = (yz - wx) * sz;
		oe[10] = (1 - (xx + yy)) * sz;
		oe[11] = 0;
		oe[12] = trans.x;
		oe[13] = trans.y;
		oe[14] = trans.z;
		oe[15] = 1;
	}

	/**
	 * 计算观察矩阵
	 * @param	eye 视点位置
	 * @param	target 视点目标
	 * @param	up 向上向量
	 * @param	out 输出矩阵
	 */
	static createLookAt(eye: Vector3, target: Vector3, up: Vector3, out: Matrix4x4): void {
		var oE: Float32Array = out.elements;
		var xaxis: Vector3 = Matrix4x4._tempVector0;
		var yaxis: Vector3 = Matrix4x4._tempVector1;
		var zaxis: Vector3 = Matrix4x4._tempVector2;
		Vector3.subtract(eye, target, zaxis);
		Vector3.normalize(zaxis, zaxis);
		Vector3.cross(up, zaxis, xaxis);
		Vector3.normalize(xaxis, xaxis);
		Vector3.cross(zaxis, xaxis, yaxis);

		oE[3] = oE[7] = oE[11] = 0;
		oE[15] = 1;
		oE[0] = xaxis.x;
		oE[4] = xaxis.y;
		oE[8] = xaxis.z;
		oE[1] = yaxis.x;
		oE[5] = yaxis.y;
		oE[9] = yaxis.z;
		oE[2] = zaxis.x;
		oE[6] = zaxis.y;
		oE[10] = zaxis.z;

		oE[12] = -Vector3.dot(xaxis, eye);
		oE[13] = -Vector3.dot(yaxis, eye);
		oE[14] = -Vector3.dot(zaxis, eye);
	}

	/**
	 * 通过FOV创建透视投影矩阵。
	 * @param	fov  视角。
	 * @param	aspect 横纵比。
	 * @param	near 近裁面。
	 * @param	far 远裁面。
	 * @param	out 输出矩阵。
	 */
	static createPerspective(fov: number, aspect: number, znear: number, zfar: number, out: Matrix4x4): void {
		var yScale: number = 1.0 / Math.tan(fov * 0.5);
		var xScale: number = yScale / aspect;

		var halfWidth: number = znear / xScale;
		var halfHeight: number = znear / yScale;
		Matrix4x4.createPerspectiveOffCenter(-halfWidth, halfWidth, -halfHeight, halfHeight, znear, zfar, out);
	}

	/**
	 * 创建透视投影矩阵。
	 * @param	left 视椎左边界。
	 * @param	right 视椎右边界。
	 * @param	bottom 视椎底边界。
	 * @param	top 视椎顶边界。
	 * @param	znear 视椎近边界。
	 * @param	zfar 视椎远边界。
	 * @param	out 输出矩阵。
	 */
	static createPerspectiveOffCenter(left: number, right: number, bottom: number, top: number, znear: number, zfar: number, out: Matrix4x4): void {
		var oe: Float32Array = out.elements;
		var zRange: number = zfar / (zfar - znear);
		oe[1] = oe[2] = oe[3] = oe[4] = oe[6] = oe[7] = oe[12] = oe[13] = oe[15] = 0;
		oe[0] = 2.0 * znear / (right - left);
		oe[5] = 2.0 * znear / (top - bottom);
		oe[8] = (left + right) / (right - left);
		oe[9] = (top + bottom) / (top - bottom);
		oe[10] = -zRange;
		oe[11] = -1.0;
		oe[14] = -znear * zRange;
	}

	/**
	 * 计算正交投影矩阵。
	 * @param	left 视椎左边界。
	 * @param	right 视椎右边界。
	 * @param	bottom 视椎底边界。
	 * @param	top 视椎顶边界。
	 * @param	near 视椎近边界。
	 * @param	far 视椎远边界。
	 * @param	out 输出矩阵。
	 */
	static createOrthoOffCenter(left: number, right: number, bottom: number, top: number, znear: number, zfar: number, out: Matrix4x4): void {

		var oe: Float32Array = out.elements;
		var zRange: number = 1.0 / (zfar - znear);
		oe[1] = oe[2] = oe[3] = oe[4] = oe[6] = oe[8] = oe[7] = oe[9] = oe[11] = 0;
		oe[15] = 1;
		oe[0] = 2.0 / (right - left);
		oe[5] = 2.0 / (top - bottom);
		oe[10] = -zRange;
		oe[12] = (left + right) / (left - right);
		oe[13] = (top + bottom) / (bottom - top);
		oe[14] = -znear * zRange;
	}

	/**矩阵元素数组*/
	elements: Float32Array;

	/**
	 * 创建一个 <code>Matrix4x4</code> 实例。
	 * @param	4x4矩阵的各元素
	 */
	constructor(m11: number = 1, m12: number = 0, m13: number = 0, m14: number = 0, m21: number = 0, m22: number = 1, m23: number = 0, m24: number = 0, m31: number = 0, m32: number = 0, m33: number = 1, m34: number = 0, m41: number = 0, m42: number = 0, m43: number = 0, m44: number = 1, elements: Float32Array = null) {
		var e: Float32Array = elements ? this.elements = elements : this.elements = new Float32Array(16);//TODO:[NATIVE]临时
		e[0] = m11;
		e[1] = m12;
		e[2] = m13;
		e[3] = m14;
		e[4] = m21;
		e[5] = m22;
		e[6] = m23;
		e[7] = m24;
		e[8] = m31;
		e[9] = m32;
		e[10] = m33;
		e[11] = m34;
		e[12] = m41;
		e[13] = m42;
		e[14] = m43;
		e[15] = m44;
	}

	getElementByRowColumn(row: number, column: number): number {
		if (row < 0 || row > 3)
			throw new Error("row Rows and columns for matrices run from 0 to 3, inclusive.");
		if (column < 0 || column > 3)
			throw new Error("column Rows and columns for matrices run from 0 to 3, inclusive.");

		return this.elements[(row * 4) + column];
	}

	setElementByRowColumn(row: number, column: number, value: number): void {
		if (row < 0 || row > 3)
			throw new Error("row Rows and columns for matrices run from 0 to 3, inclusive.");
		if (column < 0 || column > 3)
			throw new Error("column Rows and columns for matrices run from 0 to 3, inclusive.");

		this.elements[(row * 4) + column] = value;
	}

	/**
	 * 判断两个4x4矩阵的值是否相等。
	 * @param	other 4x4矩阵
	 */
	equalsOtherMatrix(other: Matrix4x4): boolean {
		var e: Float32Array = this.elements;
		var oe: Float32Array = other.elements;

		return (MathUtils3D.nearEqual(e[0], oe[0]) && MathUtils3D.nearEqual(e[1], oe[1]) && MathUtils3D.nearEqual(e[2], oe[2]) && MathUtils3D.nearEqual(e[3], oe[3]) && MathUtils3D.nearEqual(e[4], oe[4]) && MathUtils3D.nearEqual(e[5], oe[5]) && MathUtils3D.nearEqual(e[6], oe[6]) && MathUtils3D.nearEqual(e[7], oe[7]) && MathUtils3D.nearEqual(e[8], oe[8]) && MathUtils3D.nearEqual(e[9], oe[9]) && MathUtils3D.nearEqual(e[10], oe[10]) && MathUtils3D.nearEqual(e[11], oe[11]) && MathUtils3D.nearEqual(e[12], oe[12]) && MathUtils3D.nearEqual(e[13], oe[13]) && MathUtils3D.nearEqual(e[14], oe[14]) && MathUtils3D.nearEqual(e[15], oe[15]));
	}

	/**
	 * 分解矩阵为平移向量、旋转四元数、缩放向量。
	 * @param	translation 平移向量。
	 * @param	rotation 旋转四元数。
	 * @param	scale 缩放向量。
	 * @return 是否分解成功。
	 */
	decomposeTransRotScale(translation: Vector3, rotation: Quaternion, scale: Vector3): boolean {
		var rotationMatrix: Matrix4x4 = Matrix4x4._tempMatrix4x4;
		if (this.decomposeTransRotMatScale(translation, rotationMatrix, scale)) {
			Quaternion.createFromMatrix4x4(rotationMatrix, rotation);
			return true;
		} else {
			rotation.identity();
			return false;
		}
	}

	/**
	 * 分解矩阵为平移向量、旋转矩阵、缩放向量。
	 * @param	translation 平移向量。
	 * @param	rotationMatrix 旋转矩阵。
	 * @param	scale 缩放向量。
	 * @return 是否分解成功。
	 */
	decomposeTransRotMatScale(translation: Vector3, rotationMatrix: Matrix4x4, scale: Vector3): boolean {
		var e: Float32Array = this.elements;
		var te: Vector3 = translation;
		var re: Float32Array = rotationMatrix.elements;
		var se: Vector3 = scale;

		//Get the translation. 
		te.x = e[12];
		te.y = e[13];
		te.z = e[14];

		//Scaling is the length of the rows. 
		var m11: number = e[0], m12: number = e[1], m13: number = e[2];
		var m21: number = e[4], m22: number = e[5], m23: number = e[6];
		var m31: number = e[8], m32: number = e[9], m33: number = e[10];

		var sX: number = se.x = Math.sqrt((m11 * m11) + (m12 * m12) + (m13 * m13));
		var sY: number = se.y = Math.sqrt((m21 * m21) + (m22 * m22) + (m23 * m23));
		var sZ: number = se.z = Math.sqrt((m31 * m31) + (m32 * m32) + (m33 * m33));

		//If any of the scaling factors are zero, than the rotation matrix can not exist. 
		if (MathUtils3D.isZero(sX) || MathUtils3D.isZero(sY) || MathUtils3D.isZero(sZ)) {
			re[1] = re[2] = re[3] = re[4] = re[6] = re[7] = re[8] = re[9] = re[11] = re[12] = re[13] = re[14] = 0;
			re[0] = re[5] = re[10] = re[15] = 1;
			return false;
		}

		// Calculate an perfect orthonormal matrix (no reflections)
		var at: Vector3 = Matrix4x4._tempVector0;
		at.x = m31 / sZ;
		at.y = m32 / sZ;
		at.z = m33 / sZ;
		var tempRight: Vector3 = Matrix4x4._tempVector1;
		tempRight.x = m11 / sX;
		tempRight.y = m12 / sX;
		tempRight.z = m13 / sX;
		var up: Vector3 = Matrix4x4._tempVector2;
		Vector3.cross(at, tempRight, up);
		var right: Vector3 = Matrix4x4._tempVector1;
		Vector3.cross(up, at, right);

		re[3] = re[7] = re[11] = re[12] = re[13] = re[14] = 0;
		re[15] = 1;
		re[0] = right.x;
		re[1] = right.y;
		re[2] = right.z;

		re[4] = up.x;
		re[5] = up.y;
		re[6] = up.z;

		re[8] = at.x;
		re[9] = at.y;
		re[10] = at.z;

		// In case of reflexions//TODO:是否不用计算dot后的值即为结果
		((re[0] * m11 + re[1] * m12 + re[2] * m13)/*Vector3.dot(right,Right)*/ < 0.0) && (se.x = -sX);
		((re[4] * m21 + re[5] * m22 + re[6] * m23)/* Vector3.dot(up, Up)*/ < 0.0) && (se.y = -sY);
		((re[8] * m31 + re[9] * m32 + re[10] * m33)/*Vector3.dot(at, Backward)*/ < 0.0) && (se.z = -sZ);

		return true;
	}

	/**
	 * 分解旋转矩阵的旋转为YawPitchRoll欧拉角。
	 * @param	out float yaw
	 * @param	out float pitch
	 * @param	out float roll
	 * @return
	 */
	decomposeYawPitchRoll(yawPitchRoll: Vector3): void {//TODO:经飞仙测试,好像有BUG。
		var pitch: number = Math.asin(-this.elements[9]);
		yawPitchRoll.y = pitch;
		// Hardcoded constant - burn him, he's a witch
		// double threshold = 0.001; 
		var test: number = Math.cos(pitch);
		if (test > MathUtils3D.zeroTolerance) {
			yawPitchRoll.z = Math.atan2(this.elements[1], this.elements[5]);
			yawPitchRoll.x = Math.atan2(this.elements[8], this.elements[10]);
		} else {
			yawPitchRoll.z = Math.atan2(-this.elements[4], this.elements[0]);
			yawPitchRoll.x = 0.0;
		}
	}

	/**
	 * 归一化矩阵 
	 */
	normalize(): void {
		var v: Float32Array = this.elements;
		var c: number = v[0], d: number = v[1], e: number = v[2], g: number = Math.sqrt(c * c + d * d + e * e);
		if (g) {
			if (g == 1)
				return;
		} else {
			v[0] = 0;
			v[1] = 0;
			v[2] = 0;
			return;
		}
		g = 1 / g;
		v[0] = c * g;
		v[1] = d * g;
		v[2] = e * g;
	}

	/**
	 * 计算矩阵的转置矩阵
	 */
	transpose(): Matrix4x4 {
		var e: Float32Array, t: number;
		e = this.elements;
		t = e[1];
		e[1] = e[4];
		e[4] = t;
		t = e[2];
		e[2] = e[8];
		e[8] = t;
		t = e[3];
		e[3] = e[12];
		e[12] = t;
		t = e[6];
		e[6] = e[9];
		e[9] = t;
		t = e[7];
		e[7] = e[13];
		e[13] = t;
		t = e[11];
		e[11] = e[14];
		e[14] = t;
		return this;
	}

	/**
	 * 计算一个矩阵的逆矩阵
	 * @param	out 输出矩阵
	 */
	invert(out: Matrix4x4): void {

		var ae: Float32Array = this.elements;
		var oe: Float32Array = out.elements;
		var a00: number = ae[0], a01: number = ae[1], a02: number = ae[2], a03: number = ae[3], a10: number = ae[4], a11: number = ae[5], a12: number = ae[6], a13: number = ae[7], a20: number = ae[8], a21: number = ae[9], a22: number = ae[10], a23: number = ae[11], a30: number = ae[12], a31: number = ae[13], a32: number = ae[14], a33: number = ae[15],

			b00: number = a00 * a11 - a01 * a10, b01: number = a00 * a12 - a02 * a10, b02: number = a00 * a13 - a03 * a10, b03: number = a01 * a12 - a02 * a11, b04: number = a01 * a13 - a03 * a11, b05: number = a02 * a13 - a03 * a12, b06: number = a20 * a31 - a21 * a30, b07: number = a20 * a32 - a22 * a30, b08: number = a20 * a33 - a23 * a30, b09: number = a21 * a32 - a22 * a31, b10: number = a21 * a33 - a23 * a31, b11: number = a22 * a33 - a23 * a32,

			// Calculate the determinant 
			det: number = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

		if (Math.abs(det) === 0.0) {
			return;
		}
		det = 1.0 / det;

		oe[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
		oe[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
		oe[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
		oe[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
		oe[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
		oe[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
		oe[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
		oe[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
		oe[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
		oe[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
		oe[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
		oe[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
		oe[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
		oe[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
		oe[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
		oe[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
	}

	/**
	 * 计算BlillBoard矩阵
	 * @param	objectPosition 物体位置
	 * @param	cameraPosition 相机位置
	 * @param	cameraUp       相机上向量
	 * @param	cameraForward  相机前向量
	 * @param	mat            变换矩阵
	 */
	static billboard(objectPosition: Vector3, cameraPosition: Vector3, cameraUp: Vector3, cameraForward: Vector3, mat: Matrix4x4): void {

		Vector3.subtract(objectPosition, cameraPosition, Matrix4x4._tempVector0);

		var lengthSq: number = Vector3.scalarLengthSquared(Matrix4x4._tempVector0);

		if (MathUtils3D.isZero(lengthSq)) {
			Vector3.scale(cameraForward, -1, Matrix4x4._tempVector1);
			Matrix4x4._tempVector1.cloneTo(Matrix4x4._tempVector0);
		} else {
			Vector3.scale(Matrix4x4._tempVector0, 1 / Math.sqrt(lengthSq), Matrix4x4._tempVector0);
		}

		Vector3.cross(cameraUp, Matrix4x4._tempVector0, Matrix4x4._tempVector2);
		Vector3.normalize(Matrix4x4._tempVector2, Matrix4x4._tempVector2);
		Vector3.cross(Matrix4x4._tempVector0, Matrix4x4._tempVector2, Matrix4x4._tempVector3);

		var crosse: Vector3 = Matrix4x4._tempVector2;
		var finale: Vector3 = Matrix4x4._tempVector3;
		var diffee: Vector3 = Matrix4x4._tempVector0;
		var obpose: Vector3 = objectPosition;

		var mate: Float32Array = mat.elements;
		mate[0] = crosse.x;
		mate[1] = crosse.y;
		mate[2] = crosse.z;
		mate[3] = 0.0;
		mate[4] = finale.x;
		mate[5] = finale.y;
		mate[6] = finale.z;
		mate[7] = 0.0;
		mate[8] = diffee.x;
		mate[9] = diffee.y;
		mate[10] = diffee.z;
		mate[11] = 0.0;
		mate[12] = obpose.x;
		mate[13] = obpose.y;
		mate[14] = obpose.z;
		mate[15] = 1.0;
	}

	/**设置矩阵为单位矩阵*/
	identity(): void {
		var e: Float32Array = this.elements;
		e[1] = e[2] = e[3] = e[4] = e[6] = e[7] = e[8] = e[9] = e[11] = e[12] = e[13] = e[14] = 0;
		e[0] = e[5] = e[10] = e[15] = 1;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {

		var i: number, s: Float32Array, d: Float32Array;
		s = this.elements;
		d = destObject.elements;
		if (s === d) {
			return;
		}
		for (i = 0; i < 16; ++i) {
			d[i] = s[i];
		}
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: Matrix4x4 = new Matrix4x4();
		this.cloneTo(dest);
		return dest;
	}

	static translation(v3: Vector3, out: Matrix4x4): void {
		var oe: Float32Array = out.elements;
		oe[0] = oe[5] = oe[10] = oe[15] = 1;
		oe[12] = v3.x;
		oe[13] = v3.y;
		oe[14] = v3.z;
	}

	/**
	 * 获取平移向量。
	 * @param	out 平移向量。
	 */
	getTranslationVector(out: Vector3): void {
		var me: Float32Array = this.elements;
		out.x = me[12];
		out.y = me[13];
		out.z = me[14];
	}

	/**
	 * 设置平移向量。
	 * @param	translate 平移向量。
	 */
	setTranslationVector(translate: Vector3): void {
		var me: Float32Array = this.elements;
		var ve: Vector3 = translate;
		me[12] = ve.x;
		me[13] = ve.y;
		me[14] = ve.z;
	}

	/**
	 * 获取前向量。
	 * @param	out 前向量。
	 */
	getForward(out: Vector3): void {
		var me: Float32Array = this.elements;
		out.x = -me[8];
		out.y = -me[9];
		out.z = -me[10];
	}

	/**
	 * 设置前向量。
	 * @param	forward 前向量。
	 */
	setForward(forward: Vector3): void {
		var me: Float32Array = this.elements;
		me[8] = -forward.x;
		me[9] = -forward.y;
		me[10] = -forward.z;
	}

	/**
	 * 判断此矩阵是否是反向矩阵
	 */
	getInvertFront():boolean{
		this.decomposeTransRotScale(Matrix4x4._tempVector0,Matrix4x4._tempQuaternion,Matrix4x4._tempVector1);
		var scale:Vector3 = Matrix4x4._tempVector1
		var isInvert: boolean = scale.x < 0;
		(scale.y < 0) && (isInvert = !isInvert);
		(scale.z < 0) && (isInvert = !isInvert);
		return isInvert;
	}

}

