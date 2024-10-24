import { Vector3 } from "./Vector3";
import { Matrix4x4 } from "./Matrix4x4";
import { Matrix3x3 } from "./Matrix3x3";
import { MathUtils3D } from "./MathUtils3D";
import { Vector2 } from "./Vector2";
import { IClone } from "../utils/IClone";

/**@internal */
const TEMPVector30 = new Vector3();
/**@internal */
const TEMPVector31 = new Vector3();
/**@internal */
const TEMPVector32 = new Vector3();
/**@internal */
const TEMPVector33 = new Vector3();
/**@internal */
const _tempMatrix3x3 = new Matrix3x3();

/**
 * @en The `Quaternion` class is used to create quaternions.
 * @zh `Quaternion` 类用于创建四元数。
 */
export class Quaternion implements IClone {

    /**@internal */
    static TEMP = new Quaternion();

    /**
     * @en Default quaternion, read-only.
     * @zh 默认四元数，只读。
     */
    static readonly DEFAULT: Readonly<Quaternion> = new Quaternion();
    /**
     * @en Invalid quaternion, read-only.
     * @zh 无效四元数，只读。
     */
    static readonly NAN: Readonly<Quaternion> = new Quaternion(NaN, NaN, NaN, NaN);

    /**
     * @en Generate a quaternion from Euler angles (order is Yaw, Pitch, Roll)
     * @param yaw The yaw value
     * @param pitch The pitch value
     * @param roll The roll value
     * @param out The output quaternion
     * @zh 从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
     * @param yaw yaw值
     * @param pitch pitch值
     * @param roll roll值
     * @param out 输出四元数
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
     * @en Multiply two quaternions
     * @param left The left quaternion
     * @param right The right quaternion
     * @param out The output quaternion
     * @zh 计算两个四元数相乘
     * @param left left四元数
     * @param right right四元数
     * @param out 输出四元数
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

    /**
     * @en Calculate a quaternion that rotates around an arbitrary axis.
     * @param axis The rotation axis
     * @param rad The rotation angle in radians
     * @param out The output quaternion after rotation
     * @zh 计算绕任意轴旋转的四元数。
     * @param axis 旋转轴
     * @param rad 旋转角度（以弧度为单位）
     * @param out 旋转后的输出四元数
     */
    static rotationAxisAngle(axis: Vector3, rad: number, out: Quaternion): void {
        const normalAxis = Vector3._tempVector3
        Vector3.normalize(axis, normalAxis);
        rad *= 0.5;
        const s = Math.sin(rad);
        out.x = normalAxis.x * s;
        out.y = normalAxis.y * s;
        out.z = normalAxis.z * s;
        out.w = Math.cos(rad);
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
        Vector3.subtract(location, from, TEMPVector30);
        Vector3.normalize(TEMPVector30, TEMPVector30);

        angle.x = Math.asin(TEMPVector30.y);
        angle.y = Quaternion.arcTanAngle(-TEMPVector30.z, -TEMPVector30.x);
    }

    /**
     * @en Calculate a quaternion from the specified axis and angle.
     * @param axis The axis vector.
     * @param rad The angle in radians.
     * @param out The output quaternion.
     * @zh 从指定的轴和角度计算四元数。
     * @param axis 轴向量。
     * @param rad 角度（以弧度为单位）。
     * @param out 输出的四元数。
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
     * @en Calculate a quaternion from a rotation matrix.
     * @param mat The rotation matrix.
     * @param out The output quaternion.
     * @zh 从旋转矩阵计算四元数。
     * @param mat 旋转矩阵。
     * @param out 输出的四元数。
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
     * @en Spherical linear interpolation between two quaternions.
     * @param left The left quaternion.
     * @param right The right quaternion.
     * @param t The interpolation factor, ranging from 0 to 1.
     * @param out The output quaternion.
     * @returns The output quaternion.
     * @zh 两个四元数之间的球面线性插值。
     * @param left 左侧四元数。
     * @param right 右侧四元数。
     * @param t 插值因子，范围从0到1。
     * @param out 输出的四元数。
     * @returns 输出的四元数。
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
     * @en Calculate the linear interpolation between two quaternions.
     * @param left The left quaternion.
     * @param right The right quaternion.
     * @param amount The interpolation factor, ranging from 0 to 1.
     * @param out The output quaternion.
     * @zh 计算两个四元数的线性插值。
     * @param left 左侧四元数。
     * @param right 右侧四元数。
     * @param amount 插值因子，范围从0到1。
     * @param out 输出的四元数。
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
     * @en Calculate the sum of two quaternions.
     * @param left The left quaternion.
     * @param right The right quaternion.
     * @param out The output quaternion.
     * @zh 计算两个四元数的和。
     * @param left 左侧四元数。
     * @param right 右侧四元数。
     * @param out 输出的四元数。
     */
    static add(left: Quaternion, right: Quaternion, out: Quaternion): void {
        out.x = left.x + right.x;
        out.y = left.y + right.y;
        out.z = left.z + right.z;
        out.w = left.w + right.w;
    }

    /**
     * @en Calculate the dot product of two quaternions.
     * @param left The left quaternion.
     * @param right The right quaternion.
     * @returns The dot product.
     * @zh 计算两个四元数的点积。
     * @param left 左侧四元数。
     * @param right 右侧四元数。
     * @returns 点积结果。
     */
    static dot(left: Quaternion, right: Quaternion): number {
        return left.x * right.x + left.y * right.y + left.z * right.z + left.w * right.w;
    }

    /**
     * @en X-axis coordinate.
     * @zh X轴坐标。
     */
    x: number;

    /**
     * @en Y-axis coordinate.
     * @zh Y轴坐标。
     */
    y: number;

    /**
     * @en Z-axis coordinate.
     * @zh Z轴坐标。
     */
    z: number;

    /**
     * @en W-axis coordinate.
     * @zh W轴坐标。
     */
    w: number;

    /**
     * @en Constructor method, initializes the default value.
     * @param x The x value of the quaternion. Default is 0.
     * @param y The y value of the quaternion. Default is 0.
     * @param z The z value of the quaternion. Default is 0.
     * @param w The w value of the quaternion. Default is 1.
     * @zh 构造方法,初始化为默认值。
     * @param x 四元数的x值。默认为0。
     * @param y 四元数的y值。默认为0。
     * @param z 四元数的z值。默认为0。
     * @param w 四元数的w值。默认为1。
     */
    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * @en Set the values of the quaternion.
     * @param x The X value.
     * @param y The Y value.
     * @param z The Z value.
     * @param w The W value.
     * @zh 设置四元数的值。
     * @param x X值。
     * @param y Y值。
     * @param z Z值。
     * @param w W值。
     */
    setValue(x: number, y: number, z: number, w: number): void {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }

    /**
     * @en Set the values of the quaternion and return itself.
     * @param x The X value.
     * @param y The Y value.
     * @param z The Z value.
     * @param w The W value.
     * @returns The quaternion itself.
     * @zh 设置四元数的值并返回自身。
     * @param x X值。
     * @param y Y值。
     * @param z Z值。
     * @param w W值。
     * @returns 四元数自身。
     */
    set(x: number, y: number, z: number, w: number) {
        this.x = x; this.y = y; this.z = z; this.w = w;
        return this;
    }

    /**
     * @en Scale the quaternion by a scalar value.
     * @param scaling The scalar value to scale by.
     * @param out The output quaternion.
     * @zh 根据缩放值缩放四元数。
     * @param scaling 缩放值。
     * @param out 输出的四元数。
     */
    scaling(scaling: number, out: Quaternion): void {
        out.x = this.x * scaling;
        out.y = this.y * scaling;
        out.z = this.z * scaling;
        out.w = this.w * scaling;
    }

    /**
     * @en Normalize the quaternion.
     * @param out The output normalized quaternion.
     * @zh 归一化四元数。
     * @param out 输出的归一化四元数。
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
     * @en Calculate the length of the quaternion.
     * @returns The length of the quaternion.
     * @zh 计算四元数的长度。
     * @returns 四元数的长度。
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    /**
     * @en Rotate the quaternion around the X axis.
     * @param rad The angle of rotation.
     * @param out The output rotated quaternion.
     * @zh 根据绕X轴的角度旋转四元数。
     * @param rad 旋转角度。
     * @param out 输出的旋转后的四元数。
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
     * @en Rotate the quaternion around the Y axis by a specified angle.
     * @param rad The angle of rotation.
     * @param out The output rotated quaternion.
     * @zh 根据绕Y轴的指定角度旋转四元数。
     * @param rad 旋转角度。
     * @param out 输出的旋转后的四元数。
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
     * @en Rotate the quaternion around the Z axis by a specified angle.
     * @param rad The angle of rotation.
     * @param out The output rotated quaternion.
     * @zh 根据绕Z轴的指定角度旋转四元数。
     * @param rad 旋转角度。
     * @param out 输出的旋转后的四元数。
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
     * @en Decompose the quaternion into Euler angles (in the order of Yaw, Pitch, Roll).
     * Note: This method may produce sudden flips when rotating around the X axis beyond ±90 degrees.
     * @param out The output Vector3 to store the Euler angles.
     * @zh 将四元数分解为欧拉角（按Yaw、Pitch、Roll的顺序）。
     * 注意：当绕X轴旋转超过±90度时，此方法可能会产生突然的翻转。
     * @param out 用于存储欧拉角的输出Vector3。
     */
    getYawPitchRoll(out: Vector3): void {

        Vector3.transformQuat(Vector3.ForwardRH, this, TEMPVector31/*forwarldRH*/);

        Vector3.transformQuat(Vector3.Up, this, TEMPVector32/*up*/);
        var upe: Vector3 = TEMPVector32;

        Quaternion.angleTo(Vector3.ZERO, TEMPVector31, TEMPVector33/*angle*/);
        var angle: Vector3 = TEMPVector33;

        if (angle.x == Math.PI / 2) {
            angle.y = Quaternion.arcTanAngle(upe.z, upe.x);
            angle.z = 0;
        } else if (angle.x == -Math.PI / 2) {
            angle.y = Quaternion.arcTanAngle(-upe.z, -upe.x);
            angle.z = 0;
        } else {
            Matrix4x4.createRotationY(-angle.y, Matrix4x4.TEMPMatrix0);
            Matrix4x4.createRotationX(-angle.x, Matrix4x4.TEMPMatrix1);

            Vector3.transformCoordinate(TEMPVector32, Matrix4x4.TEMPMatrix0, TEMPVector32);
            Vector3.transformCoordinate(TEMPVector32, Matrix4x4.TEMPMatrix1, TEMPVector32);
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
     * @en Calculate the inverse of the quaternion.
     * @param out The output inverted quaternion.
     * @zh 计算四元数的逆。
     * @param out 输出的逆四元数。
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
     * @en Set the quaternion to identity quaternion.
     * @zh 将四元数设置为单位四元数。
     */
    identity(): void {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
    }

    /**
     * @en Copy values from an array.
     * @param array The source array.
     * @param offset The start offset in the array. Default is 0.
     * @zh 从数组中拷贝值。
     * @param array 源数组。
     * @param offset 数组中的起始偏移量。默认为0。
     */
    fromArray(array: any[], offset: number = 0): void {
        this.x = array[offset + 0];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];
    }

    /**
     * @en Clone the quaternion to a destination object.
     * @param destObject The destination object.
     * @zh 克隆四元数到目标对象。
     * @param destObject 目标对象。
     */
    cloneTo(destObject: Quaternion): void {
        if (this === destObject) {
            return;
        }
        destObject.x = this.x;
        destObject.y = this.y;
        destObject.z = this.z;
        destObject.w = this.w;
    }

    /**
     * @en Clone the quaternion.
     * @returns A new quaternion with the same values as this one.
     * @zh 克隆四元数。
     * @returns 一个与当前四元数值相同的新四元数。
     */
    clone(): any {
        var dest: Quaternion = new Quaternion();
        this.cloneTo(dest);
        return dest;
    }

    /**
     * @en Determines if two quaternions are equal.
     * @param b The quaternion to compare with.
     * @zh 如果四元数相等则返回true，否则返回false。
     * @param b 对比四元数
     */
    equals(b: Quaternion): boolean {
        return MathUtils3D.nearEqual(this.x, b.x) && MathUtils3D.nearEqual(this.y, b.y) && MathUtils3D.nearEqual(this.z, b.z) && MathUtils3D.nearEqual(this.w, b.w);
    }

    /**
     * @en Calculates a rotation quaternion to look at a direction.
     * @param forward The forward direction.
     * @param up The up vector.
     * @param out The output quaternion.
     * @zh 计算旋转观察四元数。
     * @param	forward 方向
     * @param	up     上向量
     * @param	out    输出四元数
     */
    static rotationLookAt(forward: Vector3, up: Vector3, out: Quaternion): void {
        Quaternion.lookAt(Vector3.ZERO, forward, up, out);
    }

    /**
     * @en Calculates a look-at quaternion (suitable for Camera and Light).
     * @param eye The position of the observer.
     * @param target The target position to look at.
     * @param up The up vector.
     * @param out The output quaternion.
     * @zh 计算观察四元数（适用于相机和灯光）。
     * @param	eye    观察者位置
     * @param	target 目标位置
     * @param	up     上向量
     * @param	out    输出四元数
     */
    static lookAt(eye: Vector3, target: Vector3, up: Vector3, out: Quaternion): void {
        Matrix3x3.lookAt(eye, target, up, _tempMatrix3x3);
        Quaternion.rotationMatrix(_tempMatrix3x3, out);
    }

    /**
     * @en Calculates a look-at quaternion (suitable for GameObject).
     * @param eye The position of the observer.
     * @param target The target position to look at.
     * @param up The up vector.
     * @param out The output quaternion.
     * @zh 计算观察四元数（适用于游戏对象）。
     * @param eye 观察者位置
     * @param target 目标位置
     * @param up 上向量
     * @param out 输出四元数
     */
    static forwardLookAt(eye: Vector3, target: Vector3, up: Vector3, out: Quaternion): void {
        Matrix3x3.forwardLookAt(eye, target, up, _tempMatrix3x3);
        Quaternion.rotationMatrix(_tempMatrix3x3, out);
    }

    /**
     * @en Calculates the squared length of the quaternion.
     * @returns The squared length of the quaternion.
     * @zh 计算四元数长度的平方。
     * @returns 四元数长度的平方。
     */
    lengthSquared(): number {
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w);
    }

    /**
     * @en Calculates the inverse of a quaternion.
     * @param value The input quaternion.
     * @param out The output inverse quaternion.
     * @zh 计算四元数的逆四元数。
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
     * @en Creates a quaternion from a 3x3 rotation matrix.
     * @param matrix3x3 The 3x3 rotation matrix.
     * @param out The output quaternion.
     * @zh 通过一个3x3旋转矩阵创建一个四元数。
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
}