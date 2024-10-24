import { Vector3 } from "./Vector3";
import { Vector2 } from "./Vector2";
import { Matrix4x4 } from "./Matrix4x4";
import { Quaternion } from "./Quaternion";
import { IClone } from "../utils/IClone";

const _DEFAULTELEMENTS = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
const _tempV30 = new Vector3();
const _tempV31 = new Vector3();
const _tempV32 = new Vector3();

/**
 * @en The Matrix3x3 class is used to create a 3x3 matrix.
 * @zh Matrix3x3 类用于创建 3x3 矩阵。
 */
export class Matrix3x3 implements IClone {
    /**
     * @en Default value
     * @zh 默认值
     */
    static readonly DEFAULT: Readonly<Matrix3x3> = new Matrix3x3();
    /**
     * @en Temporary variable
     * @zh 临时变量
     */
    static Temp: Matrix3x3 = new Matrix3x3();
    /**
     * @en Create a rotation matrix from a quaternion.
     * @param rotation The rotation quaternion.
     * @param out The output rotation matrix.
     * @zh 通过四元数创建旋转矩阵。
     * @param rotation 旋转四元数。
     * @param out 输出的旋转矩阵。
     */
    static createRotationQuaternion(rotation: Quaternion, out: Matrix3x3) {
        var rotX: number = rotation.x;
        var rotY: number = rotation.y;
        var rotZ: number = rotation.z;
        var rotW: number = rotation.w;

        var xx: number = rotX * rotX;
        var yy: number = rotY * rotY;
        var zz: number = rotZ * rotZ;
        var xy: number = rotX * rotY;
        var zw: number = rotZ * rotW;
        var zx: number = rotZ * rotX;
        var yw: number = rotY * rotW;
        var yz: number = rotY * rotZ;
        var xw: number = rotX * rotW;

        var resultE: Float32Array = out.elements;
        resultE[0] = 1.0 - (2.0 * (yy + zz));
        resultE[1] = 2.0 * (xy + zw);
        resultE[2] = 2.0 * (zx - yw);
        resultE[3] = 2.0 * (xy - zw);
        resultE[4] = 1.0 - (2.0 * (zz + xx));
        resultE[5] = 2.0 * (yz + xw);
        resultE[6] = 2.0 * (zx + yw);
        resultE[7] = 2.0 * (yz - xw);
        resultE[8] = 1.0 - (2.0 * (yy + xx));
    }

    /**
     * @en Generate a 3x3 matrix based on the specified translation.
     * @param trans The translation vector.
     * @param out The output matrix.
     * @zh 根据指定平移生成 3x3 矩阵。
     * @param trans 平移向量。
     * @param out 输出矩阵。
     */
    static createFromTranslation(trans: Vector2, out: Matrix3x3): void {
        var e: Float32Array = out.elements;
        e[0] = 1;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;
        e[4] = 1;
        e[5] = 0;
        e[6] = trans.x;
        e[7] = trans.y;
        e[8] = 1;
    }

    /**
     * @en Generate a 3x3 matrix based on the specified rotation.
     * @param rad The rotation value.
     * @param out The output matrix.
     * @zh 根据指定旋转生成 3x3 矩阵。
     * @param rad 旋转值。
     * @param out 输出矩阵。
     */
    static createFromRotation(rad: number, out: Matrix3x3): void {
        var e: Float32Array = out.elements;

        var s: number = Math.sin(rad), c: number = Math.cos(rad);

        e[0] = c;
        e[1] = s;
        e[2] = 0;

        e[3] = -s;
        e[4] = c;
        e[5] = 0;

        e[6] = 0;
        e[7] = 0;
        e[8] = 1;
    }

    /**
     * @en Generate a 3x3 matrix based on the specified scaling.
     * @param scale The scaling vector.
     * @param out The output matrix.
     * @zh 根据指定缩放生成 3x3 矩阵。
     * @param scale 缩放向量。
     * @param out 输出矩阵。
     */
    static createFromScaling(scale: Vector3, out: Matrix3x3): void {
        var e: Float32Array = out.elements;

        e[0] = scale.x;
        e[1] = 0;
        e[2] = 0;

        e[3] = 0;
        e[4] = scale.y;
        e[5] = 0;

        e[6] = 0;
        e[7] = 0;
        e[8] = scale.z;
    }

    /**
     * @en Convert a 4x4 matrix to a 3x3 matrix (upper-left principle, ignoring the fourth row and column).
     * @param sou The source 4x4 matrix.
     * @param out The output 3x3 matrix.
     * @zh 从 4x4 矩阵转换为一个 3x3 的矩阵（原则为 upper-left，忽略第四行四列）。
     * @param sou 4x4 源矩阵。
     * @param out 3x3 输出矩阵。
     */
    static createFromMatrix4x4(sou: Matrix4x4, out: Matrix3x3): void {
        var souE: Float32Array = sou.elements;
        var outE: Float32Array = out.elements;
        outE[0] = souE[0];
        outE[1] = souE[1];
        outE[2] = souE[2];
        outE[3] = souE[4];
        outE[4] = souE[5];
        outE[5] = souE[6];
        outE[6] = souE[8];
        outE[7] = souE[9];
        outE[8] = souE[10];
    }

    /**
     * @en Multiply two 3x3 matrices.
     * @param left The left matrix.
     * @param right The right matrix.
     * @param out The output matrix.
     * @zh 两个 3x3 矩阵的相乘。
     * @param left 左矩阵。
     * @param right 右矩阵。
     * @param out 输出矩阵。
     */
    static multiply(left: Matrix3x3, right: Matrix3x3, out: Matrix3x3): void {
        var l: Float32Array = left.elements;
        var r: Float32Array = right.elements;
        var e: Float32Array = out.elements;

        var l11: number = l[0], l12: number = l[1], l13: number = l[2];
        var l21: number = l[3], l22: number = l[4], l23: number = l[5];
        var l31: number = l[6], l32: number = l[7], l33: number = l[8];

        var r11: number = r[0], r12: number = r[1], r13: number = r[2];
        var r21: number = r[3], r22: number = r[4], r23: number = r[5];
        var r31: number = r[6], r32: number = r[7], r33: number = r[8];

        e[0] = r11 * l11 + r12 * l21 + r13 * l31;
        e[1] = r11 * l12 + r12 * l22 + r13 * r32;
        e[2] = r11 * l13 + r12 * l23 + r13 * l33;

        e[3] = r21 * l11 + r22 * l21 + r23 * l31;
        e[4] = r21 * l12 + r22 * l22 + r23 * l32;
        e[5] = r21 * l13 + r22 * l23 + r23 * l33;

        e[6] = r31 * l11 + r32 * l21 + r33 * l31;
        e[7] = r31 * l12 + r32 * l22 + r33 * l32;
        e[8] = r31 * l13 + r32 * l23 + r33 * l33;
    }

    /**
     * @en Matrix element array
     * @zh 矩阵元素数组
     */
    elements: Float32Array;

    constructor(createElement: boolean = true) {
        createElement && (this.elements = _DEFAULTELEMENTS.slice());
    }

    /**
     * @en Clone the matrix by array.
     * @param destObject The target array to clone to.
     * @zh 通过数组克隆矩阵。
     * @param destObject 克隆目标数组。
     */
    cloneByArray(destObject: Float32Array) {
        this.elements.set(destObject);
    }

    /**
     * @en Calculate the determinant of the 3x3 matrix.
     * @returns The determinant of the matrix.
     * @zh 计算 3x3 矩阵的行列式。
     * @returns 返回矩阵的行列式。
     */
    determinant(): number {
        var f: Float32Array = this.elements;

        var a00: number = f[0], a01: number = f[1], a02: number = f[2];
        var a10: number = f[3], a11: number = f[4], a12: number = f[5];
        var a20: number = f[6], a21: number = f[7], a22: number = f[8];

        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    }

    /**
     * @en Transform the 3x3 matrix by a two-dimensional vector.
     * @param trans The translation vector.
     * @param out The output matrix.
     * @zh 通过一个二维向量转换 3x3 矩阵。
     * @param trans 转换向量。
     * @paramh out 输出矩阵。
     */
    translate(trans: Vector2, out: Matrix3x3): void {
        var e: Float32Array = out.elements;
        var f: Float32Array = this.elements;

        var a00: number = f[0], a01: number = f[1], a02: number = f[2];
        var a10: number = f[3], a11: number = f[4], a12: number = f[5];
        var a20: number = f[6], a21: number = f[7], a22: number = f[8];
        var x: number = trans.x, y: number = trans.y;

        e[0] = a00;
        e[1] = a01;
        e[2] = a02;

        e[3] = a10;
        e[4] = a11;
        e[5] = a12;

        e[6] = x * a00 + y * a10 + a20;
        e[7] = x * a01 + y * a11 + a21;
        e[8] = x * a02 + y * a12 + a22;
    }

    /**
     * @en Rotate the 3x3 matrix by a specified angle.
     * @param rad The rotation angle in radians.
     * @param out The output matrix.
     * @zh 根据指定角度旋转 3x3 矩阵。
     * @param rad 旋转角度（弧度）。
     * @param out 输出矩阵。
     */
    rotate(rad: number, out: Matrix3x3): void {
        var e: Float32Array = out.elements;
        var f: Float32Array = this.elements;

        var a00: number = f[0], a01: number = f[1], a02: number = f[2];
        var a10: number = f[3], a11: number = f[4], a12: number = f[5];
        var a20: number = f[6], a21: number = f[7], a22: number = f[8];

        var s: number = Math.sin(rad);
        var c: number = Math.cos(rad);

        e[0] = c * a00 + s * a10;
        e[1] = c * a01 + s * a11;
        e[2] = c * a02 + s * a12;

        e[3] = c * a10 - s * a00;
        e[4] = c * a11 - s * a01;
        e[5] = c * a12 - s * a02;

        e[6] = a20;
        e[7] = a21;
        e[8] = a22;
    }

    /**
     * @en Scale the 3x3 matrix by a specified value.
     * @param scale The scaling vector.
     * @param out The output matrix.
     * @zh 根据指定缩放值缩放 3x3 矩阵。
     * @param scale 缩放向量。
     * @param out 输出矩阵。
     */
    scale(scale: Vector2, out: Matrix3x3): void {
        var e: Float32Array = out.elements;
        var f: Float32Array = this.elements;

        var x: number = scale.x, y: number = scale.y;

        e[0] = x * f[0];
        e[1] = x * f[1];
        e[2] = x * f[2];

        e[3] = y * f[3];
        e[4] = y * f[4];
        e[5] = y * f[5];

        e[6] = f[6];
        e[7] = f[7];
        e[8] = f[8];
    }

    /**
     * @en Calculate the inverse of the 3x3 matrix.
     * @param out The output inverse matrix.
     * @zh 计算 3x3 矩阵的逆矩阵。
     * @param out 输出的逆矩阵。
     */
    invert(out: Matrix3x3): void {
        var e = out.elements;
        var f = this.elements;

        var a00 = f[0], a01 = f[1], a02 = f[2];
        var a10 = f[3], a11 = f[4], a12 = f[5];
        var a20 = f[6], a21 = f[7], a22 = f[8];

        var b01: number = a22 * a11 - a12 * a21;
        var b11: number = -a22 * a10 + a12 * a20;
        var b21: number = a21 * a10 - a11 * a20;

        // Calculate the determinant
        var det: number = a00 * b01 + a01 * b11 + a02 * b21;

        if (!det) {
            return;
        }
        det = 1.0 / det;

        e[0] = b01 * det;
        e[1] = (-a22 * a01 + a02 * a21) * det;
        e[2] = (a12 * a01 - a02 * a11) * det;
        e[3] = b11 * det;
        e[4] = (a22 * a00 - a02 * a20) * det;
        e[5] = (-a12 * a00 + a02 * a10) * det;
        e[6] = b21 * det;
        e[7] = (-a21 * a00 + a01 * a20) * det;
        e[8] = (a11 * a00 - a01 * a10) * det;
    }

    /**
     * @en Calculate the transpose of the 3x3 matrix.
     * @param out The output matrix.
     * @zh 计算 3x3 矩阵的转置矩阵。
     * @param  out 输出矩阵。
     */
    transpose(out: Matrix3x3): void {
        var e: Float32Array = out.elements;
        var f: Float32Array = this.elements;

        if (out === this) {
            var a01: number = f[1], a02: number = f[2], a12: number = f[5];
            e[1] = f[3];
            e[2] = f[6];
            e[3] = a01;
            e[5] = f[7];
            e[6] = a02;
            e[7] = a12;
        } else {
            e[0] = f[0];
            e[1] = f[3];
            e[2] = f[6];
            e[3] = f[1];
            e[4] = f[4];
            e[5] = f[7];
            e[6] = f[2];
            e[7] = f[5];
            e[8] = f[8];
        }
    }

    /**
     * @en Set the existing matrix to an identity matrix.
     * @zh 设置已有的矩阵为单位矩阵。
     */
    identity(): void {
        this.elements.set(_DEFAULTELEMENTS);
        /*
        var e: Float32Array = this.elements;
        e[0] = 1;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;
        e[4] = 1;
        e[5] = 0;
        e[6] = 0;
        e[7] = 0;
        e[8] = 1;*/
    }

    /**
     * @en Clone the matrix.
     * @param destObject The clone target.
     * @zh 克隆矩阵。
     * @param destObject 克隆目标。
     */
    cloneTo(destObject: Matrix3x3): void {
        var i: number, s: Float32Array, d: Float32Array;
        s = this.elements;
        d = destObject.elements;
        if (s === d) {
            return;
        }
        d.set(s);
        /*
        for (i = 0; i < 9; ++i) {
            d[i] = s[i];
        }*/
    }

    /**
     * @en Clone the matrix.
     * @returns A clone of the matrix.
     * @zh 克隆矩阵。
     * @returns 矩阵的克隆副本。
     */
    clone(): any {
        var dest: Matrix3x3 = new Matrix3x3(false);
        dest.elements = this.elements.slice();
        return dest;
    }

    /**
     * @en Calculate the 3x3 view matrix.
     * @param eye The position of the observer.
     * @param target The position of the target.
     * @param up The up vector.
     * @param out The output 3x3 matrix.
     * @zh 计算观察3x3矩阵。
     * @param eye 观察者位置。
     * @param target 目标位置。
     * @param up 上向量。
     * @param out 输出3x3矩阵。
     */
    static lookAt(eye: Vector3, target: Vector3, up: Vector3, out: Matrix3x3): void {
        Vector3.subtract(eye, target, _tempV30);//WebGL为右手坐标系统
        Vector3.normalize(_tempV30, _tempV30);

        Vector3.cross(up, _tempV30, _tempV31);
        Vector3.normalize(_tempV31, _tempV31);

        Vector3.cross(_tempV30, _tempV31, _tempV32);

        var v0: Vector3 = _tempV30;
        var v1: Vector3 = _tempV31;
        var v2: Vector3 = _tempV32;

        var me: Float32Array = out.elements;
        me[0] = v1.x;
        me[3] = v1.y;
        me[6] = v1.z;

        me[1] = v2.x;
        me[4] = v2.y;
        me[7] = v2.z;

        me[2] = v0.x;
        me[5] = v0.y;
        me[8] = v0.z;
    }

    /**
     * @en Calculate the 3x3 view matrix with forward direction looking at target. Forward is defined as the z-axis here.
     * @param eye The starting point.
     * @param target The target point.
     * @param up The up vector.
     * @param out The output matrix.
     * @zh 计算前向看向目标的3x3观察矩阵。这里规定前向为z轴。
     * @param eye 起始点。
     * @param target 目标点。
     * @param up 向上轴。
     * @param out 输出矩阵。
     */
    static forwardLookAt(eye: Vector3, target: Vector3, up: Vector3, out: Matrix3x3): void {
        var vx = _tempV31;
        var vy = _tempV32;
        var vz = _tempV30;

        target.vsub(eye, vz).normalize();
        up.cross(vz, vx).normalize();
        vz.cross(vx, vy);

        var m = out.elements;
        m[0] = vx.x; m[1] = vx.y; m[2] = vx.z;
        m[3] = vy.x; m[4] = vy.y; m[5] = vy.z;
        m[6] = vz.x; m[7] = vz.y; m[8] = vz.z;
    }
}