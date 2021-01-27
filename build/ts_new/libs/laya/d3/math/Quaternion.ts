import { Vector3 } from "./Vector3";
import { Matrix4x4 } from "./Matrix4x4";
import { Matrix3x3 } from "./Matrix3x3";
import { MathUtils3D } from "./MathUtils3D";
import { Vector2 } from "./Vector2";
import { IClone } from "../core/IClone"
import { ILaya3D } from "../../../ILaya3D";

/**
 * <code>Quaternion</code> 类用于创建四元数。
 */
export class Quaternion implements IClone {
	/**@internal */
	static TEMPVector30: Vector3 = new Vector3();
	/**@internal */
	static TEMPVector31: Vector3 = new Vector3();
	/**@internal */
	static TEMPVector32: Vector3 = new Vector3();
	/**@internal */
	static TEMPVector33: Vector3 = new Vector3();

	/**@internal */
	static _tempMatrix3x3: Matrix3x3 = new Matrix3x3();

	/**默认矩阵,禁止修改*/
	static DEFAULT: Quaternion =/*[STATIC SAFE]*/ new Quaternion();
	/**无效矩阵,禁止修改*/
	static NAN: Quaternion = new Quaternion(NaN, NaN, NaN, NaN);


	/**
	 *  从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
	 * @param	yaw yaw值
	 * @param	pitch pitch值
	 * @param	roll roll值
	 * @param	out 输出四元数
	 */
	static createFromYawPitchRoll(yaw: number, pitch: number, roll: number, out: Quaternion): void {
		var halfRoll: number = roll * 0.5;
		var halfPitch: number = pitch * 0.5;
		var halfYaw: number = yaw * 0.5;

		var sinRoll: number = Math.sin(halfRoll);
		var cosRoll: number = Math.cos(halfRoll);
		var sinPitch: number = Math.sin(halfPitch);
		var cosPitch: number = Math.cos(halfPitch);
		var sinYaw: number = Math.sin(halfYaw);
		var cosYaw: number = Math.cos(halfYaw);


		out.x = (cosYaw * sinPitch * cosRoll) + (sinYaw * cosPitch * sinRoll);
		out.y = (sinYaw * cosPitch * cosRoll) - (cosYaw * sinPitch * sinRoll);
		out.z = (cosYaw * cosPitch * sinRoll) - (sinYaw * sinPitch * cosRoll);
		out.w = (cosYaw * cosPitch * cosRoll) + (sinYaw * sinPitch * sinRoll);
	}

	/**
	 * 计算两个四元数相乘
	 * @param	left left四元数
	 * @param	right  right四元数
	 * @param	out 输出四元数
	 */
	static multiply(left: Quaternion, right: Quaternion, out: Quaternion): void {
		var lx: number = left.x;
		var ly: number = left.y;
		var lz: number = left.z;
		var lw: number = left.w;
		var rx: number = right.x;
		var ry: number = right.y;
		var rz: number = right.z;
		var rw: number = right.w;
		var a: number = (ly * rz - lz * ry);
		var b: number = (lz * rx - lx * rz);
		var c: number = (lx * ry - ly * rx);
		var d: number = (lx * rx + ly * ry + lz * rz);
		out.x = (lx * rw + rx * lw) + a;
		out.y = (ly * rw + ry * lw) + b;
		out.z = (lz * rw + rz * lw) + c;
		out.w = lw * rw - d;
	}

	private static arcTanAngle(x: number, y: number): number {
		if (x == 0) {
			if (y == 1)
				return Math.PI / 2;
			return -Math.PI / 2;
		}
		if (x > 0)
			return Math.atan(y / x);
		if (x < 0) {
			if (y > 0)
				return Math.atan(y / x) + Math.PI;
			return Math.atan(y / x) - Math.PI;
		}
		return 0;
	}

	private static angleTo(from: Vector3, location: Vector3, angle: Vector3): void {
		Vector3.subtract(location, from, Quaternion.TEMPVector30);
		Vector3.normalize(Quaternion.TEMPVector30, Quaternion.TEMPVector30);

		angle.x = Math.asin(Quaternion.TEMPVector30.y);
		angle.y = Quaternion.arcTanAngle(-Quaternion.TEMPVector30.z, -Quaternion.TEMPVector30.x);
	}

	/**
	 * 从指定的轴和角度计算四元数
	 * @param	axis  轴
	 * @param	rad  角度
	 * @param	out  输出四元数
	 */
	static createFromAxisAngle(axis: Vector3, rad: number, out: Quaternion): void {
		rad = rad * 0.5;
		var s: number = Math.sin(rad);
		out.x = s * axis.x;
		out.y = s * axis.y;
		out.z = s * axis.z;
		out.w = Math.cos(rad);
	}


	/**
	 *  从旋转矩阵计算四元数
	 * @param	mat 旋转矩阵
	 * @param	out  输出四元数
	 */
	static createFromMatrix4x4(mat: Matrix4x4, out: Quaternion): void {
		var me: Float32Array = mat.elements;

		var sqrt: number;
		var half: number;
		var scale: number = me[0] + me[5] + me[10];

		if (scale > 0.0) {
			sqrt = Math.sqrt(scale + 1.0);
			out.w = sqrt * 0.5;
			sqrt = 0.5 / sqrt;

			out.x = (me[6] - me[9]) * sqrt;
			out.y = (me[8] - me[2]) * sqrt;
			out.z = (me[1] - me[4]) * sqrt;
		} else if ((me[0] >= me[5]) && (me[0] >= me[10])) {
			sqrt = Math.sqrt(1.0 + me[0] - me[5] - me[10]);
			half = 0.5 / sqrt;

			out.x = 0.5 * sqrt;
			out.y = (me[1] + me[4]) * half;
			out.z = (me[2] + me[8]) * half;
			out.w = (me[6] - me[9]) * half;
		} else if (me[5] > me[10]) {
			sqrt = Math.sqrt(1.0 + me[5] - me[0] - me[10]);
			half = 0.5 / sqrt;

			out.x = (me[4] + me[1]) * half;
			out.y = 0.5 * sqrt;
			out.z = (me[9] + me[6]) * half;
			out.w = (me[8] - me[2]) * half;
		} else {
			sqrt = Math.sqrt(1.0 + me[10] - me[0] - me[5]);
			half = 0.5 / sqrt;

			out.x = (me[8] + me[2]) * half;
			out.y = (me[9] + me[6]) * half;
			out.z = 0.5 * sqrt;
			out.w = (me[1] - me[4]) * half;
		}

	}

	/**
	 * 球面插值
	 * @param	left left四元数
	 * @param	right  right四元数
	 * @param	t 插值比例
	 * @param	out 输出四元数
	 * @returns 输出Float32Array
	 */
	static slerp(left: Quaternion, right: Quaternion, t: number, out: Quaternion): Quaternion {
		var ax: number = left.x, ay: number = left.y, az: number = left.z, aw: number = left.w, bx: number = right.x, by: number = right.y, bz: number = right.z, bw: number = right.w;

		var omega: number, cosom: number, sinom: number, scale0: number, scale1: number;

		// calc cosine 
		cosom = ax * bx + ay * by + az * bz + aw * bw;
		// adjust signs (if necessary) 
		if (cosom < 0.0) {
			cosom = -cosom;
			bx = -bx;
			by = -by;
			bz = -bz;
			bw = -bw;
		}
		// calculate coefficients 
		if ((1.0 - cosom) > 0.000001) {
			// standard case (slerp) 
			omega = Math.acos(cosom);
			sinom = Math.sin(omega);
			scale0 = Math.sin((1.0 - t) * omega) / sinom;
			scale1 = Math.sin(t * omega) / sinom;
		} else {
			// "from" and "to" quaternions are very close  
			//  ... so we can do a linear interpolation 
			scale0 = 1.0 - t;
			scale1 = t;
		}
		// calculate final values 
		out.x = scale0 * ax + scale1 * bx;
		out.y = scale0 * ay + scale1 * by;
		out.z = scale0 * az + scale1 * bz;
		out.w = scale0 * aw + scale1 * bw;

		return out;
	}

	/**
	 * 计算两个四元数的线性插值
	 * @param	left left四元数
	 * @param	right right四元数b
	 * @param	t 插值比例
	 * @param	out 输出四元数
	 */
	static lerp(left: Quaternion, right: Quaternion, amount: number, out: Quaternion): void {
		var inverse: number = 1.0 - amount;
		if (Quaternion.dot(left, right) >= 0) {
			out.x = (inverse * left.x) + (amount * right.x);
			out.y = (inverse * left.y) + (amount * right.y);
			out.z = (inverse * left.z) + (amount * right.z);
			out.w = (inverse * left.w) + (amount * right.w);
		} else {
			out.x = (inverse * left.x) - (amount * right.x);
			out.y = (inverse * left.y) - (amount * right.y);
			out.z = (inverse * left.z) - (amount * right.z);
			out.w = (inverse * left.w) - (amount * right.w);
		}
		out.normalize(out);
	}

	/**
	 * 计算两个四元数的和
	 * @param	left  left四元数
	 * @param	right right 四元数
	 * @param	out 输出四元数
	 */
	static add(left: Quaternion, right: Quaternion, out: Quaternion): void {
		out.x = left.x + right.x;
		out.y = left.y + right.y;
		out.z = left.z + right.z;
		out.w = left.w + right.w;
	}

	/**
	 * 计算两个四元数的点积
	 * @param	left left四元数
	 * @param	right right四元数
	 * @return  点积
	 */
	static dot(left: Quaternion, right: Quaternion): number {
		return left.x * right.x + left.y * right.y + left.z * right.z + left.w * right.w;
	}

	/**X轴坐标*/
	x: number;
	/**Y轴坐标*/
	y: number;
	/**Z轴坐标*/
	z: number;
	/**W轴坐标*/
	w: number;

	/**
	 * 创建一个 <code>Quaternion</code> 实例。
	 * @param	x 四元数的x值
	 * @param	y 四元数的y值
	 * @param	z 四元数的z值
	 * @param	w 四元数的w值
	 */
	constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	/**
	 * 根据缩放值缩放四元数
	 * @param	scale 缩放值
	 * @param	out 输出四元数
	 */
	scaling(scaling: number, out: Quaternion): void {
		out.x = this.x * scaling;
		out.y = this.y * scaling;
		out.z = this.z * scaling;
		out.w = this.w * scaling;
	}

	/**
	 * 归一化四元数
	 * @param	out 输出四元数
	 */
	normalize(out: Quaternion): void {
		var len: number = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			out.x = this.x * len;
			out.y = this.y * len;
			out.z = this.z * len;
			out.w = this.w * len;
		}
	}

	/**
	 * 计算四元数的长度
	 * @return  长度
	 */
	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}

	/**
	 * 根据绕X轴的角度旋转四元数
	 * @param	rad 角度
	 * @param	out 输出四元数
	 */
	rotateX(rad: number, out: Quaternion): void {
		rad *= 0.5;

		var bx: number = Math.sin(rad), bw: number = Math.cos(rad);

		out.x = this.x * bw + this.w * bx;
		out.y = this.y * bw + this.z * bx;
		out.z = this.z * bw - this.y * bx;
		out.w = this.w * bw - this.x * bx;
	}

	/**
	 * 根据绕Y轴的制定角度旋转四元数
	 * @param	rad 角度
	 * @param	out 输出四元数
	 */
	rotateY(rad: number, out: Quaternion): void {
		rad *= 0.5;

		var by: number = Math.sin(rad), bw: number = Math.cos(rad);

		out.x = this.x * bw - this.z * by;
		out.y = this.y * bw + this.w * by;
		out.z = this.z * bw + this.x * by;
		out.w = this.w * bw - this.y * by;
	}

	/**
	 * 根据绕Z轴的制定角度旋转四元数
	 * @param	rad 角度
	 * @param	out 输出四元数
	 */
	rotateZ(rad: number, out: Quaternion): void {
		rad *= 0.5;
		var bz: number = Math.sin(rad), bw: number = Math.cos(rad);

		out.x = this.x * bw + this.y * bz;
		out.y = this.y * bw - this.x * bz;
		out.z = this.z * bw + this.w * bz;
		out.w = this.w * bw - this.z * bz;
	}

	/**
	 * 分解四元数到欧拉角（顺序为Yaw、Pitch、Roll），参考自http://xboxforums.create.msdn.com/forums/p/4574/23988.aspx#23988,问题绕X轴翻转超过±90度时有，会产生瞬间反转
	 * @param	quaternion 源四元数
	 * @param	out 欧拉角值
	 */
	getYawPitchRoll(out: Vector3): void {

		Vector3.transformQuat(Vector3._ForwardRH, this, Quaternion.TEMPVector31/*forwarldRH*/);

		Vector3.transformQuat(Vector3._Up, this, Quaternion.TEMPVector32/*up*/);
		var upe: Vector3 = Quaternion.TEMPVector32;

		Quaternion.angleTo(Vector3._ZERO, Quaternion.TEMPVector31, Quaternion.TEMPVector33/*angle*/);
		var angle: Vector3 = Quaternion.TEMPVector33;

		if (angle.x == Math.PI / 2) {
			angle.y = Quaternion.arcTanAngle(upe.z, upe.x);
			angle.z = 0;
		} else if (angle.x == -Math.PI / 2) {
			angle.y = Quaternion.arcTanAngle(-upe.z, -upe.x);
			angle.z = 0;
		} else {
			ILaya3D.Matrix4x4.createRotationY(-angle.y, ILaya3D.Matrix4x4.TEMPMatrix0);
			ILaya3D.Matrix4x4.createRotationX(-angle.x, ILaya3D.Matrix4x4.TEMPMatrix1);

			Vector3.transformCoordinate(Quaternion.TEMPVector32, ILaya3D.Matrix4x4.TEMPMatrix0, Quaternion.TEMPVector32);
			Vector3.transformCoordinate(Quaternion.TEMPVector32, ILaya3D.Matrix4x4.TEMPMatrix1, Quaternion.TEMPVector32);
			angle.z = Quaternion.arcTanAngle(upe.y, -upe.x);
		}

		// Special cases.
		if (angle.y <= -Math.PI)
			angle.y = Math.PI;
		if (angle.z <= -Math.PI)
			angle.z = Math.PI;

		if (angle.y >= Math.PI && angle.z >= Math.PI) {
			angle.y = 0;
			angle.z = 0;
			angle.x = Math.PI - angle.x;
		}

		var oe: Vector3 = out;
		oe.x = angle.y;
		oe.y = angle.x;
		oe.z = angle.z;
	}

	/**
	 * 求四元数的逆
	 * @param	out  输出四元数
	 */
	invert(out: Quaternion): void {
		var a0: number = this.x, a1: number = this.y, a2: number = this.z, a3: number = this.w;
		var dot: number = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
		var invDot: number = dot ? 1.0 / dot : 0;

		// TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
		out.x = -a0 * invDot;
		out.y = -a1 * invDot;
		out.z = -a2 * invDot;
		out.w = a3 * invDot;
	}

	/**
	 *设置四元数为单位算数
	 * @param out  输出四元数
	 */
	identity(): void {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 1;
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
		this.w = array[offset + 3];
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		if (this === destObject) {
			return;
		}
		destObject.x = this.x;
		destObject.y = this.y;
		destObject.z = this.z;
		destObject.w = this.w;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: Quaternion = new Quaternion();
		this.cloneTo(dest);
		return dest;
	}

	equals(b: Quaternion): boolean {
		return MathUtils3D.nearEqual(this.x, b.x) && MathUtils3D.nearEqual(this.y, b.y) && MathUtils3D.nearEqual(this.z, b.z) && MathUtils3D.nearEqual(this.w, b.w);
	}

	/**
	 * 计算旋转观察四元数
	 * @param	forward 方向
	 * @param	up     上向量
	 * @param	out    输出四元数
	 */
	static rotationLookAt(forward: Vector3, up: Vector3, out: Quaternion): void {
		Quaternion.lookAt(Vector3._ZERO, forward, up, out);
	}

	/**
	 * 计算观察四元数
	 * @param	eye    观察者位置
	 * @param	target 目标位置
	 * @param	up     上向量
	 * @param	out    输出四元数
	 */
	static lookAt(eye: Vector3, target: Vector3, up: Vector3, out: Quaternion): void {
		Matrix3x3.lookAt(eye, target, up, Quaternion._tempMatrix3x3);
		Quaternion.rotationMatrix(Quaternion._tempMatrix3x3, out);
	}

	/**
	 * 计算长度的平方。
	 * @return 长度的平方。
	 */
	lengthSquared(): number {
		return (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w);
	}

	/**
	 * 计算四元数的逆四元数。
	 * @param	value 四元数。
	 * @param	out 逆四元数。
	 */
	static invert(value: Quaternion, out: Quaternion): void {
		var lengthSq: number = value.lengthSquared();
		if (!MathUtils3D.isZero(lengthSq)) {
			lengthSq = 1.0 / lengthSq;

			out.x = -value.x * lengthSq;
			out.y = -value.y * lengthSq;
			out.z = -value.z * lengthSq;
			out.w = value.w * lengthSq;
		}
	}

	/**
	 * 通过一个3x3矩阵创建一个四元数
	 * @param	matrix3x3  3x3矩阵
	 * @param	out        四元数
	 */
	static rotationMatrix(matrix3x3: Matrix3x3, out: Quaternion): void {
		var me: Float32Array = matrix3x3.elements;
		var m11: number = me[0];
		var m12: number = me[1];
		var m13: number = me[2];
		var m21: number = me[3];
		var m22: number = me[4];
		var m23: number = me[5];
		var m31: number = me[6];
		var m32: number = me[7];
		var m33: number = me[8];

		var sqrt: number, half: number;
		var scale: number = m11 + m22 + m33;

		if (scale > 0) {

			sqrt = Math.sqrt(scale + 1);
			out.w = sqrt * 0.5;
			sqrt = 0.5 / sqrt;

			out.x = (m23 - m32) * sqrt;
			out.y = (m31 - m13) * sqrt;
			out.z = (m12 - m21) * sqrt;

		} else if ((m11 >= m22) && (m11 >= m33)) {

			sqrt = Math.sqrt(1 + m11 - m22 - m33);
			half = 0.5 / sqrt;

			out.x = 0.5 * sqrt;
			out.y = (m12 + m21) * half;
			out.z = (m13 + m31) * half;
			out.w = (m23 - m32) * half;
		} else if (m22 > m33) {

			sqrt = Math.sqrt(1 + m22 - m11 - m33);
			half = 0.5 / sqrt;

			out.x = (m21 + m12) * half;
			out.y = 0.5 * sqrt;
			out.z = (m32 + m23) * half;
			out.w = (m31 - m13) * half;
		} else {

			sqrt = Math.sqrt(1 + m33 - m11 - m22);
			half = 0.5 / sqrt;

			out.x = (m31 + m13) * half;
			out.y = (m32 + m23) * half;
			out.z = 0.5 * sqrt;
			out.w = (m12 - m21) * half;
		}
	}

	forNativeElement(nativeElements: Float32Array = null): void//[NATIVE_TS]
	{

		if (nativeElements) {
			(<any>this).elements = nativeElements;
			(<any>this).elements[0] = this.x;
			(<any>this).elements[1] = this.y;
			(<any>this).elements[2] = this.z;
			(<any>this).elements[3] = this.w;
		}
		else {
			(<any>this).elements = new Float32Array([this.x, this.y, this.z, this.w]);
		}
		Vector2.rewriteNumProperty(this, "x", 0);
		Vector2.rewriteNumProperty(this, "y", 1);
		Vector2.rewriteNumProperty(this, "z", 2);
		Vector2.rewriteNumProperty(this, "w", 3);

	}
}


