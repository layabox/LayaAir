import { ConchVector3 } from "./ConchVector3";
import { MathUtils3D } from "../MathUtils3D";
import { Matrix3x3 } from "../Matrix3x3";
import { Matrix4x4 } from "../Matrix4x4";
/**
 * <code>Quaternion</code> 类用于创建四元数。
 */
export class ConchQuaternion {
    /**
     * 创建一个 <code>Quaternion</code> 实例。
     * @param	x 四元数的x值
     * @param	y 四元数的y值
     * @param	z 四元数的z值
     * @param	w 四元数的w值
     */
    constructor(x = 0, y = 0, z = 0, w = 1, nativeElements = null /*[NATIVE]*/) {
        var v;
        if (nativeElements) { ///*[NATIVE]*/
            v = nativeElements;
        }
        else {
            v = new Float32Array(4);
        }
        v[0] = x;
        v[1] = y;
        v[2] = z;
        v[3] = w;
        this.elements = v;
    }
    /**
     * @internal
     */
    static _dotArray(l, r) {
        return l[0] * r[0] + l[1] * r[1] + l[2] * r[2] + l[3] * r[3];
    }
    /**
     * @internal
     */
    static _normalizeArray(f, o) {
        var x = f[0], y = f[1], z = f[2], w = f[3];
        var len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            o[0] = x * len;
            o[1] = y * len;
            o[2] = z * len;
            o[3] = w * len;
        }
    }
    /**
     * @internal
     */
    static _lerpArray(l, r, amount, o) {
        var inverse = 1.0 - amount;
        if (ConchQuaternion._dotArray(l, r) >= 0) {
            o[0] = (inverse * l[0]) + (amount * r[0]);
            o[1] = (inverse * l[1]) + (amount * r[1]);
            o[2] = (inverse * l[2]) + (amount * r[2]);
            o[3] = (inverse * l[3]) + (amount * r[3]);
        }
        else {
            o[0] = (inverse * l[0]) - (amount * r[0]);
            o[1] = (inverse * l[1]) - (amount * r[1]);
            o[2] = (inverse * l[2]) - (amount * r[2]);
            o[3] = (inverse * l[3]) - (amount * r[3]);
        }
        ConchQuaternion._normalizeArray(o, o);
    }
    /**
     *  从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
     * @param	yaw yaw值
     * @param	pitch pitch值
     * @param	roll roll值
     * @param	out 输出四元数
     */
    static createFromYawPitchRoll(yaw, pitch, roll, out) {
        var halfRoll = roll * 0.5;
        var halfPitch = pitch * 0.5;
        var halfYaw = yaw * 0.5;
        var sinRoll = Math.sin(halfRoll);
        var cosRoll = Math.cos(halfRoll);
        var sinPitch = Math.sin(halfPitch);
        var cosPitch = Math.cos(halfPitch);
        var sinYaw = Math.sin(halfYaw);
        var cosYaw = Math.cos(halfYaw);
        var oe = out.elements;
        oe[0] = (cosYaw * sinPitch * cosRoll) + (sinYaw * cosPitch * sinRoll);
        oe[1] = (sinYaw * cosPitch * cosRoll) - (cosYaw * sinPitch * sinRoll);
        oe[2] = (cosYaw * cosPitch * sinRoll) - (sinYaw * sinPitch * cosRoll);
        oe[3] = (cosYaw * cosPitch * cosRoll) + (sinYaw * sinPitch * sinRoll);
    }
    /**
     * 计算两个四元数相乘
     * @param	left left四元数
     * @param	right  right四元数
     * @param	out 输出四元数
     */
    static multiply(left, right, out) {
        var le = left.elements;
        var re = right.elements;
        var oe = out.elements;
        var lx = le[0];
        var ly = le[1];
        var lz = le[2];
        var lw = le[3];
        var rx = re[0];
        var ry = re[1];
        var rz = re[2];
        var rw = re[3];
        var a = (ly * rz - lz * ry);
        var b = (lz * rx - lx * rz);
        var c = (lx * ry - ly * rx);
        var d = (lx * rx + ly * ry + lz * rz);
        oe[0] = (lx * rw + rx * lw) + a;
        oe[1] = (ly * rw + ry * lw) + b;
        oe[2] = (lz * rw + rz * lw) + c;
        oe[3] = lw * rw - d;
    }
    static arcTanAngle(x, y) {
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
    static angleTo(from, location, angle) {
        ConchVector3.subtract(location, from, ConchQuaternion.TEMPVector30);
        ConchVector3.normalize(ConchQuaternion.TEMPVector30, ConchQuaternion.TEMPVector30);
        angle.elements[0] = Math.asin(ConchQuaternion.TEMPVector30.y);
        angle.elements[1] = ConchQuaternion.arcTanAngle(-ConchQuaternion.TEMPVector30.z, -ConchQuaternion.TEMPVector30.x);
    }
    /**
     * 从指定的轴和角度计算四元数
     * @param	axis  轴
     * @param	rad  角度
     * @param	out  输出四元数
     */
    static createFromAxisAngle(axis, rad, out) {
        var e = out.elements;
        var f = axis.elements;
        rad = rad * 0.5;
        var s = Math.sin(rad);
        e[0] = s * f[0];
        e[1] = s * f[1];
        e[2] = s * f[2];
        e[3] = Math.cos(rad);
    }
    /**
     * 根据3x3矩阵计算四元数
     * @param	sou 源矩阵
     * @param	out 输出四元数
     */
    static createFromMatrix3x3(sou, out) {
        var e = out.elements;
        var f = sou.elements;
        var fTrace = f[0] + f[4] + f[8];
        var fRoot;
        if (fTrace > 0.0) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0); // 2w
            e[3] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot; // 1/(4w)
            e[0] = (f[5] - f[7]) * fRoot;
            e[1] = (f[6] - f[2]) * fRoot;
            e[2] = (f[1] - f[3]) * fRoot;
        }
        else {
            // |w| <= 1/2
            var i = 0;
            if (f[4] > f[0])
                i = 1;
            if (f[8] > f[i * 3 + i])
                i = 2;
            var j = (i + 1) % 3;
            var k = (i + 2) % 3;
            fRoot = Math.sqrt(f[i * 3 + i] - f[j * 3 + j] - f[k * 3 + k] + 1.0);
            e[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            e[3] = (f[j * 3 + k] - f[k * 3 + j]) * fRoot;
            e[j] = (f[j * 3 + i] + f[i * 3 + j]) * fRoot;
            e[k] = (f[k * 3 + i] + f[i * 3 + k]) * fRoot;
        }
        return;
    }
    /**
     *  从旋转矩阵计算四元数
     * @param	mat 旋转矩阵
     * @param	out  输出四元数
     */
    static createFromMatrix4x4(mat, out) {
        var me = mat.elements;
        var oe = out.elements;
        var sqrt;
        var half;
        var scale = me[0] + me[5] + me[10];
        if (scale > 0.0) {
            sqrt = Math.sqrt(scale + 1.0);
            oe[3] = sqrt * 0.5;
            sqrt = 0.5 / sqrt;
            oe[0] = (me[6] - me[9]) * sqrt;
            oe[1] = (me[8] - me[2]) * sqrt;
            oe[2] = (me[1] - me[4]) * sqrt;
        }
        else if ((me[0] >= me[5]) && (me[0] >= me[10])) {
            sqrt = Math.sqrt(1.0 + me[0] - me[5] - me[10]);
            half = 0.5 / sqrt;
            oe[0] = 0.5 * sqrt;
            oe[1] = (me[1] + me[4]) * half;
            oe[2] = (me[2] + me[8]) * half;
            oe[3] = (me[6] - me[9]) * half;
        }
        else if (me[5] > me[10]) {
            sqrt = Math.sqrt(1.0 + me[5] - me[0] - me[10]);
            half = 0.5 / sqrt;
            oe[0] = (me[4] + me[1]) * half;
            oe[1] = 0.5 * sqrt;
            oe[2] = (me[9] + me[6]) * half;
            oe[3] = (me[8] - me[2]) * half;
        }
        else {
            sqrt = Math.sqrt(1.0 + me[10] - me[0] - me[5]);
            half = 0.5 / sqrt;
            oe[0] = (me[8] + me[2]) * half;
            oe[1] = (me[9] + me[6]) * half;
            oe[2] = 0.5 * sqrt;
            oe[3] = (me[1] - me[4]) * half;
        }
    }
    /**
     * 球面插值
     * @param	left left四元数
     * @param	right  right四元数
     * @param	a 插值比例
     * @param	out 输出四元数
     * @return   输出Float32Array
     */
    static slerp(left, right, t, out) {
        var a = left.elements;
        var b = right.elements;
        var oe = out.elements;
        var ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];
        var omega, cosom, sinom, scale0, scale1;
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
        }
        else {
            // "from" and "to" quaternions are very close  
            //  ... so we can do a linear interpolation 
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values 
        oe[0] = scale0 * ax + scale1 * bx;
        oe[1] = scale0 * ay + scale1 * by;
        oe[2] = scale0 * az + scale1 * bz;
        oe[3] = scale0 * aw + scale1 * bw;
        return oe;
    }
    /**
     * 计算两个四元数的线性插值
     * @param	left left四元数
     * @param	right right四元数b
     * @param	t 插值比例
     * @param	out 输出四元数
     */
    static lerp(left, right, amount, out) {
        ConchQuaternion._lerpArray(left.elements, right.elements, amount, out.elements);
    }
    /**
     * 计算两个四元数的和
     * @param	left  left四元数
     * @param	right right 四元数
     * @param	out 输出四元数
     */
    static add(left, right, out) {
        var e = out.elements;
        var f = left.elements;
        var g = right.elements;
        e[0] = f[0] + g[0];
        e[1] = f[1] + g[1];
        e[2] = f[2] + g[2];
        e[3] = f[3] + g[3];
    }
    /**
     * 计算两个四元数的点积
     * @param	left left四元数
     * @param	right right四元数
     * @return  点积
     */
    static dot(left, right) {
        return ConchQuaternion._dotArray(left.elements, right.elements);
    }
    /**
     * 获取四元数的x值
     */
    get x() {
        return this.elements[0];
    }
    /**
     * 设置四元数的x值
     */
    set x(value) {
        this.elements[0] = value;
    }
    /**
     * 获取四元数的y值
     */
    get y() {
        return this.elements[1];
    }
    /**
     * 设置四元数的y值
     */
    set y(value) {
        this.elements[1] = value;
    }
    /**
     * 获取四元数的z值
     */
    get z() {
        return this.elements[2];
    }
    /**
     * 设置四元数的z值
     */
    set z(value) {
        this.elements[2] = value;
    }
    /**
     * 获取四元数的w值
     */
    get w() {
        return this.elements[3];
    }
    /**
     * 设置四元数的w值
     */
    set w(value) {
        this.elements[3] = value;
    }
    /**
     * 根据缩放值缩放四元数
     * @param	scale 缩放值
     * @param	out 输出四元数
     */
    scaling(scaling, out) {
        var e = out.elements;
        var f = this.elements;
        e[0] = f[0] * scaling;
        e[1] = f[1] * scaling;
        e[2] = f[2] * scaling;
        e[3] = f[3] * scaling;
    }
    /**
     * 归一化四元数
     * @param	out 输出四元数
     */
    normalize(out) {
        ConchQuaternion._normalizeArray(this.elements, out.elements);
    }
    /**
     * 计算四元数的长度
     * @return  长度
     */
    length() {
        var f = this.elements;
        var x = f[0], y = f[1], z = f[2], w = f[3];
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    /**
     * 根据绕X轴的角度旋转四元数
     * @param	rad 角度
     * @param	out 输出四元数
     */
    rotateX(rad, out) {
        var e = out.elements;
        var f = this.elements;
        rad *= 0.5;
        var ax = f[0], ay = f[1], az = f[2], aw = f[3];
        var bx = Math.sin(rad), bw = Math.cos(rad);
        e[0] = ax * bw + aw * bx;
        e[1] = ay * bw + az * bx;
        e[2] = az * bw - ay * bx;
        e[3] = aw * bw - ax * bx;
    }
    /**
     * 根据绕Y轴的制定角度旋转四元数
     * @param	rad 角度
     * @param	out 输出四元数
     */
    rotateY(rad, out) {
        var e = out.elements;
        var f = this.elements;
        rad *= 0.5;
        var ax = f[0], ay = f[1], az = f[2], aw = f[3], by = Math.sin(rad), bw = Math.cos(rad);
        e[0] = ax * bw - az * by;
        e[1] = ay * bw + aw * by;
        e[2] = az * bw + ax * by;
        e[3] = aw * bw - ay * by;
    }
    /**
     * 根据绕Z轴的制定角度旋转四元数
     * @param	rad 角度
     * @param	out 输出四元数
     */
    rotateZ(rad, out) {
        var e = out.elements;
        var f = this.elements;
        rad *= 0.5;
        var ax = f[0], ay = f[1], az = f[2], aw = f[3], bz = Math.sin(rad), bw = Math.cos(rad);
        e[0] = ax * bw + ay * bz;
        e[1] = ay * bw - ax * bz;
        e[2] = az * bw + aw * bz;
        e[3] = aw * bw - az * bz;
    }
    /**
     * 分解四元数到欧拉角（顺序为Yaw、Pitch、Roll），参考自http://xboxforums.create.msdn.com/forums/p/4574/23988.aspx#23988,问题绕X轴翻转超过±90度时有，会产生瞬间反转
     * @param	quaternion 源四元数
     * @param	out 欧拉角值
     */
    getYawPitchRoll(out) {
        ConchVector3.transformQuat(ConchVector3.ForwardRH, this, ConchQuaternion.TEMPVector31 /*forwarldRH*/);
        ConchVector3.transformQuat(ConchVector3.Up, this, ConchQuaternion.TEMPVector32 /*up*/);
        var upe = ConchQuaternion.TEMPVector32.elements;
        ConchQuaternion.angleTo(ConchVector3.ZERO, ConchQuaternion.TEMPVector31, ConchQuaternion.TEMPVector33 /*angle*/);
        var anglee = ConchQuaternion.TEMPVector33.elements;
        if (anglee[0] == Math.PI / 2) {
            anglee[1] = ConchQuaternion.arcTanAngle(upe[2], upe[0]);
            anglee[2] = 0;
        }
        else if (anglee[0] == -Math.PI / 2) {
            anglee[1] = ConchQuaternion.arcTanAngle(-upe[2], -upe[0]);
            anglee[2] = 0;
        }
        else {
            Matrix4x4.createRotationY(-anglee[1], ConchQuaternion.TEMPMatrix0);
            Matrix4x4.createRotationX(-anglee[0], ConchQuaternion.TEMPMatrix1);
            ConchVector3.transformCoordinate(ConchQuaternion.TEMPVector32, ConchQuaternion.TEMPMatrix0, ConchQuaternion.TEMPVector32);
            ConchVector3.transformCoordinate(ConchQuaternion.TEMPVector32, ConchQuaternion.TEMPMatrix1, ConchQuaternion.TEMPVector32);
            anglee[2] = ConchQuaternion.arcTanAngle(upe[1], -upe[0]);
        }
        // Special cases.
        if (anglee[1] <= -Math.PI)
            anglee[1] = Math.PI;
        if (anglee[2] <= -Math.PI)
            anglee[2] = Math.PI;
        if (anglee[1] >= Math.PI && anglee[2] >= Math.PI) {
            anglee[1] = 0;
            anglee[2] = 0;
            anglee[0] = Math.PI - anglee[0];
        }
        var oe = out.elements;
        oe[0] = anglee[1];
        oe[1] = anglee[0];
        oe[2] = anglee[2];
    }
    /**
     * 求四元数的逆
     * @param	out  输出四元数
     */
    invert(out) {
        var e = out.elements;
        var f = this.elements;
        var a0 = f[0], a1 = f[1], a2 = f[2], a3 = f[3];
        var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        var invDot = dot ? 1.0 / dot : 0;
        // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
        e[0] = -a0 * invDot;
        e[1] = -a1 * invDot;
        e[2] = -a2 * invDot;
        e[3] = a3 * invDot;
    }
    /**
     *设置四元数为单位算数
     * @param out  输出四元数
     */
    identity() {
        var e = this.elements;
        e[0] = 0;
        e[1] = 0;
        e[2] = 0;
        e[3] = 1;
    }
    /**
     * 从Array数组拷贝值。
     * @param  array 数组。
     * @param  offset 数组偏移。
     */
    fromArray(array, offset = 0) {
        this.elements[0] = array[offset + 0];
        this.elements[1] = array[offset + 1];
        this.elements[2] = array[offset + 2];
        this.elements[3] = array[offset + 3];
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var i, s, d;
        s = this.elements;
        d = destObject.elements;
        if (s === d) {
            return;
        }
        for (i = 0; i < 4; ++i) {
            d[i] = s[i];
        }
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new ConchQuaternion();
        this.cloneTo(dest);
        return dest;
    }
    equals(b) {
        var ae = this.elements;
        var be = b.elements;
        return MathUtils3D.nearEqual(ae[0], be[0]) && MathUtils3D.nearEqual(ae[1], be[1]) && MathUtils3D.nearEqual(ae[2], be[2]) && MathUtils3D.nearEqual(ae[3], be[3]);
    }
    /**
     * 计算旋转观察四元数
     * @param	forward 方向
     * @param	up     上向量
     * @param	out    输出四元数
     */
    static rotationLookAt(forward, up, out) {
        ConchQuaternion.lookAt(ConchVector3.ZERO, forward, up, out);
    }
    /**
     * 计算观察四元数
     * @param	eye    观察者位置
     * @param	target 目标位置
     * @param	up     上向量
     * @param	out    输出四元数
     */
    static lookAt(eye, target, up, out) {
        Matrix3x3.lookAt(eye, target, up, ConchQuaternion._tempMatrix3x3);
        ConchQuaternion.rotationMatrix(ConchQuaternion._tempMatrix3x3, out);
    }
    /**
     * 计算长度的平方。
     * @return 长度的平方。
     */
    lengthSquared() {
        var x = this.elements[0];
        var y = this.elements[1];
        var z = this.elements[2];
        var w = this.elements[3];
        return (x * x) + (y * y) + (z * z) + (w * w);
    }
    /**
     * 计算四元数的逆四元数。
     * @param	value 四元数。
     * @param	out 逆四元数。
     */
    static invert(value, out) {
        var vE = value.elements;
        var oE = out.elements;
        var lengthSq = value.lengthSquared();
        if (!MathUtils3D.isZero(lengthSq)) {
            lengthSq = 1.0 / lengthSq;
            oE[0] = -vE[0] * lengthSq;
            oE[1] = -vE[1] * lengthSq;
            oE[2] = -vE[2] * lengthSq;
            oE[3] = vE[3] * lengthSq;
        }
    }
    /**
     * 通过一个3x3矩阵创建一个四元数
     * @param	matrix3x3  3x3矩阵
     * @param	out        四元数
     */
    static rotationMatrix(matrix3x3, out) {
        var me = matrix3x3.elements;
        var m11 = me[0];
        var m12 = me[1];
        var m13 = me[2];
        var m21 = me[3];
        var m22 = me[4];
        var m23 = me[5];
        var m31 = me[6];
        var m32 = me[7];
        var m33 = me[8];
        var oe = out.elements;
        var sqrt, half;
        var scale = m11 + m22 + m33;
        if (scale > 0) {
            sqrt = Math.sqrt(scale + 1);
            oe[3] = sqrt * 0.5;
            sqrt = 0.5 / sqrt;
            oe[0] = (m23 - m32) * sqrt;
            oe[1] = (m31 - m13) * sqrt;
            oe[2] = (m12 - m21) * sqrt;
        }
        else if ((m11 >= m22) && (m11 >= m33)) {
            sqrt = Math.sqrt(1 + m11 - m22 - m33);
            half = 0.5 / sqrt;
            oe[0] = 0.5 * sqrt;
            oe[1] = (m12 + m21) * half;
            oe[2] = (m13 + m31) * half;
            oe[3] = (m23 - m32) * half;
        }
        else if (m22 > m33) {
            sqrt = Math.sqrt(1 + m22 - m11 - m33);
            half = 0.5 / sqrt;
            oe[0] = (m21 + m12) * half;
            oe[1] = 0.5 * sqrt;
            oe[2] = (m32 + m23) * half;
            oe[3] = (m31 - m13) * half;
        }
        else {
            sqrt = Math.sqrt(1 + m33 - m11 - m22);
            half = 0.5 / sqrt;
            oe[0] = (m31 + m13) * half;
            oe[1] = (m32 + m23) * half;
            oe[2] = 0.5 * sqrt;
            oe[3] = (m12 - m21) * half;
        }
    }
}
/*[FILEINDEX:10000]*/
/**@internal */
ConchQuaternion.TEMPVector30 = new ConchVector3();
/**@internal */
ConchQuaternion.TEMPVector31 = new ConchVector3();
/**@internal */
ConchQuaternion.TEMPVector32 = new ConchVector3();
/**@internal */
ConchQuaternion.TEMPVector33 = new ConchVector3();
/**@internal */
ConchQuaternion.TEMPMatrix0 = new Matrix4x4();
/**@internal */
ConchQuaternion.TEMPMatrix1 = new Matrix4x4();
/**@internal */
ConchQuaternion._tempMatrix3x3 = new Matrix3x3();
/**默认矩阵,禁止修改*/
ConchQuaternion.DEFAULT = new ConchQuaternion();
/**无效矩阵,禁止修改*/
ConchQuaternion.NAN = new ConchQuaternion(NaN, NaN, NaN, NaN);
