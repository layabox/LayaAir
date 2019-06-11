import { Vector3 } from "././Vector3";
import { Quaternion } from "././Quaternion";
import { MathUtils3D } from "././MathUtils3D";
import { LayaGL } from "laya/layagl/LayaGL";
/**
 * <code>Matrix4x4</code> 类用于创建4x4矩阵。
 */
export class Matrix4x4 {
    /**
     * 创建一个 <code>Matrix4x4</code> 实例。
     * @param	4x4矩阵的各元素
     */
    constructor(m11 = 1, m12 = 0, m13 = 0, m14 = 0, m21 = 0, m22 = 1, m23 = 0, m24 = 0, m31 = 0, m32 = 0, m33 = 1, m34 = 0, m41 = 0, m42 = 0, m43 = 0, m44 = 1, elements = null) {
        var e = elements ? this.elements = elements : this.elements = new Float32Array(16); //TODO:[NATIVE]临时
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
    /**
     * 绕X轴旋转
     * @param	rad  旋转角度
     * @param	out 输出矩阵
     */
    static createRotationX(rad, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var oe = out.elements;
        var s = Math.sin(rad), c = Math.cos(rad);
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
    static createRotationY(rad, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var oe = out.elements;
        var s = Math.sin(rad), c = Math.cos(rad);
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
    static createRotationZ(rad, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var oe = out.elements;
        var s = Math.sin(rad), c = Math.cos(rad);
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
    static createRotationYawPitchRoll(yaw, pitch, roll, result) {
        Quaternion.createFromYawPitchRoll(yaw, pitch, roll, Matrix4x4._tempQuaternion);
        Matrix4x4.createRotationQuaternion(Matrix4x4._tempQuaternion, result);
    }
    /**
     * 通过旋转轴axis和旋转角度angle计算旋转矩阵。
     * @param	axis 旋转轴,假定已经归一化。
     * @param	angle 旋转角度。
     * @param	result 结果矩阵。
     */
    static createRotationAxis(axis, angle, result) {
        var x = axis.x;
        var y = axis.y;
        var z = axis.z;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var xx = x * x;
        var yy = y * y;
        var zz = z * z;
        var xy = x * y;
        var xz = x * z;
        var yz = y * z;
        var resultE = result.elements;
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
    setRotation(rotation) {
        var rotationX = rotation.x;
        var rotationY = rotation.y;
        var rotationZ = rotation.z;
        var rotationW = rotation.w;
        var xx = rotationX * rotationX;
        var yy = rotationY * rotationY;
        var zz = rotationZ * rotationZ;
        var xy = rotationX * rotationY;
        var zw = rotationZ * rotationW;
        var zx = rotationZ * rotationX;
        var yw = rotationY * rotationW;
        var yz = rotationY * rotationZ;
        var xw = rotationX * rotationW;
        var e = this.elements;
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
    setPosition(position) {
        var e = this.elements;
        e[12] = position.x;
        e[13] = position.y;
        e[14] = position.z;
    }
    /**
     * 通过四元数创建旋转矩阵。
     * @param	rotation 旋转四元数。
     * @param	result 输出旋转矩阵
     */
    static createRotationQuaternion(rotation, result) {
        var resultE = result.elements;
        var rotationX = rotation.x;
        var rotationY = rotation.y;
        var rotationZ = rotation.z;
        var rotationW = rotation.w;
        var xx = rotationX * rotationX;
        var yy = rotationY * rotationY;
        var zz = rotationZ * rotationZ;
        var xy = rotationX * rotationY;
        var zw = rotationZ * rotationW;
        var zx = rotationZ * rotationX;
        var yw = rotationY * rotationW;
        var yz = rotationY * rotationZ;
        var xw = rotationX * rotationW;
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
    static createTranslate(trans, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var oe = out.elements;
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
    static createScaling(scale, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var oe = out.elements;
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
    static multiply(left, right, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var i, e, a, b, ai0, ai1, ai2, ai3;
        e = out.elements;
        a = left.elements;
        b = right.elements;
        if (e === b) {
            b = new Float32Array(16);
            for (i = 0; i < 16; ++i) {
                b[i] = e[i];
            }
        }
        var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
        var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
        var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
        for (i = 0; i < 4; i++) {
            ai0 = a[i];
            ai1 = a[i + 4];
            ai2 = a[i + 8];
            ai3 = a[i + 12];
            e[i] = ai0 * b0 + ai1 * b1 + ai2 * b2 + ai3 * b3;
            e[i + 4] = ai0 * b4 + ai1 * b5 + ai2 * b6 + ai3 * b7;
            e[i + 8] = ai0 * b8 + ai1 * b9 + ai2 * b10 + ai3 * b11;
            e[i + 12] = ai0 * b12 + ai1 * b13 + ai2 * b14 + ai3 * b15;
        }
    }
    static multiplyForNative(left, right, out) {
        LayaGL.instance.matrix4x4Multiply(left.elements, right.elements, out.elements);
    }
    /**
     * 从四元数计算旋转矩阵
     * @param	rotation 四元数
     * @param	out 输出矩阵
     */
    static createFromQuaternion(rotation, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var e = out.elements;
        var x = rotation.x, y = rotation.y, z = rotation.z, w = rotation.w;
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var yx = y * x2;
        var yy = y * y2;
        var zx = z * x2;
        var zy = z * y2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
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
    static createAffineTransformation(trans, rot, scale, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var oe = out.elements;
        var x = rot.x, y = rot.y, z = rot.z, w = rot.w, x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2, sx = scale.x, sy = scale.y, sz = scale.z;
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
     *  计算观察矩阵
     * @param	eye 视点位置
     * @param	center 视点目标
     * @param	up 向上向量
     * @param	out 输出矩阵
     */
    static createLookAt(eye, target, up, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        //注:WebGL为右手坐标系统
        var oE = out.elements;
        var xaxis = Matrix4x4._tempVector0;
        var yaxis = Matrix4x4._tempVector1;
        var zaxis = Matrix4x4._tempVector2;
        Vector3.subtract(eye, target, zaxis);
        Vector3.normalize(zaxis, zaxis);
        Vector3.cross(up, zaxis, xaxis);
        Vector3.normalize(xaxis, xaxis);
        Vector3.cross(zaxis, xaxis, yaxis);
        out.identity();
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
    static createPerspective(fov, aspect, znear, zfar, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var yScale = 1.0 / Math.tan(fov * 0.5);
        var xScale = yScale / aspect;
        var halfWidth = znear / xScale;
        var halfHeight = znear / yScale;
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
    static createPerspectiveOffCenter(left, right, bottom, top, znear, zfar, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var oe = out.elements;
        var zRange = zfar / (zfar - znear);
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
    static createOrthoOffCenter(left, right, bottom, top, znear, zfar, out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var oe = out.elements;
        var zRange = 1.0 / (zfar - znear);
        oe[1] = oe[2] = oe[3] = oe[4] = oe[6] = oe[8] = oe[7] = oe[9] = oe[11] = 0;
        oe[15] = 1;
        oe[0] = 2.0 / (right - left);
        oe[5] = 2.0 / (top - bottom);
        oe[10] = -zRange;
        oe[12] = (left + right) / (left - right);
        oe[13] = (top + bottom) / (bottom - top);
        oe[14] = -znear * zRange;
    }
    getElementByRowColumn(row, column) {
        if (row < 0 || row > 3)
            throw new Error("row Rows and columns for matrices run from 0 to 3, inclusive.");
        if (column < 0 || column > 3)
            throw new Error("column Rows and columns for matrices run from 0 to 3, inclusive.");
        return this.elements[(row * 4) + column];
    }
    setElementByRowColumn(row, column, value) {
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
    equalsOtherMatrix(other) {
        var e = this.elements;
        var oe = other.elements;
        return (MathUtils3D.nearEqual(e[0], oe[0]) && MathUtils3D.nearEqual(e[1], oe[1]) && MathUtils3D.nearEqual(e[2], oe[2]) && MathUtils3D.nearEqual(e[3], oe[3]) && MathUtils3D.nearEqual(e[4], oe[4]) && MathUtils3D.nearEqual(e[5], oe[5]) && MathUtils3D.nearEqual(e[6], oe[6]) && MathUtils3D.nearEqual(e[7], oe[7]) && MathUtils3D.nearEqual(e[8], oe[8]) && MathUtils3D.nearEqual(e[9], oe[9]) && MathUtils3D.nearEqual(e[10], oe[10]) && MathUtils3D.nearEqual(e[11], oe[11]) && MathUtils3D.nearEqual(e[12], oe[12]) && MathUtils3D.nearEqual(e[13], oe[13]) && MathUtils3D.nearEqual(e[14], oe[14]) && MathUtils3D.nearEqual(e[15], oe[15]));
    }
    /**
     * 分解矩阵为平移向量、旋转四元数、缩放向量。
     * @param	translation 平移向量。
     * @param	rotation 旋转四元数。
     * @param	scale 缩放向量。
     * @return 是否分解成功。
     */
    decomposeTransRotScale(translation, rotation, scale) {
        var rotationMatrix = Matrix4x4._tempMatrix4x4;
        if (this.decomposeTransRotMatScale(translation, rotationMatrix, scale)) {
            Quaternion.createFromMatrix4x4(rotationMatrix, rotation);
            return true;
        }
        else {
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
    decomposeTransRotMatScale(translation, rotationMatrix, scale) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var e = this.elements;
        var te = translation;
        var re = rotationMatrix.elements;
        var se = scale;
        //Get the translation. 
        te.x = e[12];
        te.y = e[13];
        te.z = e[14];
        //Scaling is the length of the rows. 
        var m11 = e[0], m12 = e[1], m13 = e[2];
        var m21 = e[4], m22 = e[5], m23 = e[6];
        var m31 = e[8], m32 = e[9], m33 = e[10];
        var sX = se.x = Math.sqrt((m11 * m11) + (m12 * m12) + (m13 * m13));
        var sY = se.y = Math.sqrt((m21 * m21) + (m22 * m22) + (m23 * m23));
        var sZ = se.z = Math.sqrt((m31 * m31) + (m32 * m32) + (m33 * m33));
        //If any of the scaling factors are zero, than the rotation matrix can not exist. 
        if (MathUtils3D.isZero(sX) || MathUtils3D.isZero(sY) || MathUtils3D.isZero(sZ)) {
            re[1] = re[2] = re[3] = re[4] = re[6] = re[7] = re[8] = re[9] = re[11] = re[12] = re[13] = re[14] = 0;
            re[0] = re[5] = re[10] = re[15] = 1;
            return false;
        }
        // Calculate an perfect orthonormal matrix (no reflections)
        var at = Matrix4x4._tempVector0;
        at.x = m31 / sZ;
        at.y = m32 / sZ;
        at.z = m33 / sZ;
        var tempRight = Matrix4x4._tempVector1;
        tempRight.x = m11 / sX;
        tempRight.y = m12 / sX;
        tempRight.z = m13 / sX;
        var up = Matrix4x4._tempVector2;
        Vector3.cross(at, tempRight, up);
        var right = Matrix4x4._tempVector1;
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
        ((re[0] * m11 + re[1] * m12 + re[2] * m13) /*Vector3.dot(right,Right)*/ < 0.0) && (se[0] = -sX);
        ((re[4] * m21 + re[5] * m22 + re[6] * m23) /* Vector3.dot(up, Up)*/ < 0.0) && (se[1] = -sY);
        ((re[8] * m31 + re[9] * m32 + re[10] * m33) /*Vector3.dot(at, Backward)*/ < 0.0) && (se[2] = -sZ);
        return true;
    }
    /**
     * 分解旋转矩阵的旋转为YawPitchRoll欧拉角。
     * @param	out float yaw
     * @param	out float pitch
     * @param	out float roll
     * @return
     */
    decomposeYawPitchRoll(yawPitchRoll) {
        var pitch = Math.asin(-this.elements[9]);
        yawPitchRoll.y = pitch;
        // Hardcoded constant - burn him, he's a witch
        // double threshold = 0.001; 
        var test = Math.cos(pitch);
        if (test > MathUtils3D.zeroTolerance) {
            yawPitchRoll.z = Math.atan2(this.elements[1], this.elements[5]);
            yawPitchRoll.x = Math.atan2(this.elements[8], this.elements[10]);
        }
        else {
            yawPitchRoll.z = Math.atan2(-this.elements[4], this.elements[0]);
            yawPitchRoll.x = 0.0;
        }
    }
    /**归一化矩阵 */
    normalize() {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var v = this.elements;
        var c = v[0], d = v[1], e = v[2], g = Math.sqrt(c * c + d * d + e * e);
        if (g) {
            if (g == 1)
                return;
        }
        else {
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
    /**计算矩阵的转置矩阵*/
    transpose() {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var e, t;
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
    invert(out) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var ae = this.elements;
        var oe = out.elements;
        var a00 = ae[0], a01 = ae[1], a02 = ae[2], a03 = ae[3], a10 = ae[4], a11 = ae[5], a12 = ae[6], a13 = ae[7], a20 = ae[8], a21 = ae[9], a22 = ae[10], a23 = ae[11], a30 = ae[12], a31 = ae[13], a32 = ae[14], a33 = ae[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, 
        // Calculate the determinant 
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
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
    static billboard(objectPosition, cameraPosition, cameraRight, cameraUp, cameraForward, mat) {
        Vector3.subtract(objectPosition, cameraPosition, Matrix4x4._tempVector0);
        var lengthSq = Vector3.scalarLengthSquared(Matrix4x4._tempVector0);
        if (MathUtils3D.isZero(lengthSq)) {
            Vector3.scale(cameraForward, -1, Matrix4x4._tempVector1);
            Matrix4x4._tempVector1.cloneTo(Matrix4x4._tempVector0);
        }
        else {
            Vector3.scale(Matrix4x4._tempVector0, 1 / Math.sqrt(lengthSq), Matrix4x4._tempVector0);
        }
        Vector3.cross(cameraUp, Matrix4x4._tempVector0, Matrix4x4._tempVector2);
        Vector3.normalize(Matrix4x4._tempVector2, Matrix4x4._tempVector2);
        Vector3.cross(Matrix4x4._tempVector0, Matrix4x4._tempVector2, Matrix4x4._tempVector3);
        var crosse = Matrix4x4._tempVector2;
        var finale = Matrix4x4._tempVector3;
        var diffee = Matrix4x4._tempVector0;
        var obpose = objectPosition;
        var mate = mat.elements;
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
    identity() {
        var e = this.elements;
        e[1] = e[2] = e[3] = e[4] = e[6] = e[7] = e[8] = e[9] = e[11] = e[12] = e[13] = e[14] = 0;
        e[0] = e[5] = e[10] = e[15] = 1;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        var i, s, d;
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
    clone() {
        var dest = new Matrix4x4();
        this.cloneTo(dest);
        return dest;
    }
    static translation(v3, out) {
        var oe = out.elements;
        oe[0] = oe[5] = oe[10] = oe[15] = 1;
        oe[12] = v3.x;
        oe[13] = v3.y;
        oe[14] = v3.z;
    }
    /**
     * 获取平移向量。
     * @param	out 平移向量。
     */
    getTranslationVector(out) {
        var me = this.elements;
        out.x = me[12];
        out.y = me[13];
        out.z = me[14];
    }
    /**
     * 设置平移向量。
     * @param	translate 平移向量。
     */
    setTranslationVector(translate) {
        var me = this.elements;
        var ve = translate;
        me[12] = ve.x;
        me[13] = ve.y;
        me[14] = ve.z;
    }
    /**
     * 获取前向量。
     * @param	out 前向量。
     */
    getForward(out) {
        var me = this.elements;
        out.x = -me[8];
        out.y = -me[9];
        out.z = -me[10];
    }
    /**
     * 设置前向量。
     * @param	forward 前向量。
     */
    setForward(forward) {
        var me = this.elements;
        me[8] = -forward.x;
        me[9] = -forward.y;
        me[10] = -forward.z;
    }
}
/**@private */
Matrix4x4._tempMatrix4x4 = new Matrix4x4();
/**@private */
Matrix4x4.TEMPMatrix0 = new Matrix4x4();
/**@private */
Matrix4x4.TEMPMatrix1 = new Matrix4x4();
/**@private */
Matrix4x4._tempVector0 = new Vector3();
/**@private */
Matrix4x4._tempVector1 = new Vector3();
/**@private */
Matrix4x4._tempVector2 = new Vector3();
/**@private */
Matrix4x4._tempVector3 = new Vector3();
/**@private */
Matrix4x4._tempQuaternion = new Quaternion();
/**默认矩阵,禁止修改*/
Matrix4x4.DEFAULT = new Matrix4x4();
/**默认矩阵,禁止修改*/
Matrix4x4.ZERO = new Matrix4x4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
