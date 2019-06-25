import { MathUtils3D } from "../MathUtils3D";
/**
 * <code>Vector4</code> 类用于创建四维向量。
 */
export class ConchVector4 {
    /**
     * 创建一个 <code>Vector4</code> 实例。
     * @param	x  X轴坐标。
     * @param	y  Y轴坐标。
     * @param	z  Z轴坐标。
     * @param	w  W轴坐标。
     */
    constructor(x = 0, y = 0, z = 0, w = 0) {
        var v = this.elements = new Float32Array(4);
        v[0] = x;
        v[1] = y;
        v[2] = z;
        v[3] = w;
    }
    /**
     * 获取X轴坐标。
     * @return  X轴坐标。
     */
    get x() {
        return this.elements[0];
    }
    /**
     * 设置X轴坐标。
     * @param value X轴坐标。
     */
    set x(value) {
        this.elements[0] = value;
    }
    /**
     * 获取Y轴坐标。
     * @return	Y轴坐标。
     */
    get y() {
        return this.elements[1];
    }
    /**
     * 设置Y轴坐标。
     * @param	value  Y轴坐标。
     */
    set y(value) {
        this.elements[1] = value;
    }
    /**
     * 获取Z轴坐标。
     * @return	 Z轴坐标。
     */
    get z() {
        return this.elements[2];
    }
    /**
     * 设置Z轴坐标。
     * @param	value  Z轴坐标。
     */
    set z(value) {
        this.elements[2] = value;
    }
    /**
     * 获取W轴坐标。
     * @return	W轴坐标。
     */
    get w() {
        return this.elements[3];
    }
    /**
     * 设置W轴坐标。
     * @param value	W轴坐标。
     */
    set w(value) {
        this.elements[3] = value;
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
        var destVector4 = destObject;
        var destE = destVector4.elements;
        var s = this.elements;
        destE[0] = s[0];
        destE[1] = s[1];
        destE[2] = s[2];
        destE[3] = s[3];
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destVector4 = new ConchVector4();
        this.cloneTo(destVector4);
        return destVector4;
    }
    /**
     * 插值四维向量。
     * @param	a left向量。
     * @param	b right向量。
     * @param	t 插值比例。
     * @param	out 输出向量。
     */
    static lerp(a, b, t, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        var ax = f[0], ay = f[1], az = f[2], aw = f[3];
        e[0] = ax + t * (g[0] - ax);
        e[1] = ay + t * (g[1] - ay);
        e[2] = az + t * (g[2] - az);
        e[3] = aw + t * (g[3] - aw);
    }
    /**
     * 通过4x4矩阵把一个四维向量转换为另一个四维向量
     * @param	vector4 带转换四维向量。
     * @param	M4x4    4x4矩阵。
     * @param	out     转换后四维向量。
     */
    static transformByM4x4(vector4, m4x4, out) {
        var ve = vector4.elements;
        var vx = ve[0];
        var vy = ve[1];
        var vz = ve[2];
        var vw = ve[3];
        var me = m4x4.elements;
        var oe = out.elements;
        oe[0] = vx * me[0] + vy * me[4] + vz * me[8] + vw * me[12];
        oe[1] = vx * me[1] + vy * me[5] + vz * me[9] + vw * me[13];
        oe[2] = vx * me[2] + vy * me[6] + vz * me[10] + vw * me[14];
        oe[3] = vx * me[3] + vy * me[7] + vz * me[11] + vw * me[15];
    }
    /**
     * 判断两个四维向量是否相等。
     * @param	a 四维向量。
     * @param	b 四维向量。
     * @return  是否相等。
     */
    static equals(a, b) {
        var ae = a.elements;
        var be = b.elements;
        return MathUtils3D.nearEqual(Math.abs(ae[0]), Math.abs(be[0])) && MathUtils3D.nearEqual(Math.abs(ae[1]), Math.abs(be[1])) && MathUtils3D.nearEqual(Math.abs(ae[2]), Math.abs(be[2])) && MathUtils3D.nearEqual(Math.abs(ae[3]), Math.abs(be[3]));
    }
    /**
     * 求四维向量的长度。
     * @return  长度。
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    /**
     * 求四维向量长度的平方。
     * @return  长度的平方。
     */
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    /**
     * 归一化四维向量。
     * @param	s   源四维向量。
     * @param	out 输出四维向量。
     */
    static normalize(s, out) {
        var se = s.elements;
        var oe = out.elements;
        var len = s.length();
        if (len > 0) {
            oe[0] = se[0] * len;
            oe[1] = se[1] * len;
            oe[2] = se[2] * len;
            oe[3] = se[3] * len;
        }
    }
    /**
     * 求两个四维向量的和。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 输出向量。
     */
    static add(a, b, out) {
        var oe = out.elements;
        var ae = a.elements;
        var be = b.elements;
        oe[0] = ae[0] + be[0];
        oe[1] = ae[1] + be[1];
        oe[2] = ae[2] + be[2];
        oe[3] = ae[3] + be[3];
    }
    /**
     * 求两个四维向量的差。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 输出向量。
     */
    static subtract(a, b, out) {
        var oe = out.elements;
        var ae = a.elements;
        var be = b.elements;
        oe[0] = ae[0] - be[0];
        oe[1] = ae[1] - be[1];
        oe[2] = ae[2] - be[2];
        oe[3] = ae[3] - be[3];
    }
    /**
     * 计算两个四维向量的乘积。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 输出向量。
     */
    static multiply(a, b, out) {
        var oe = out.elements;
        var ae = a.elements;
        var be = b.elements;
        oe[0] = ae[0] * be[0];
        oe[1] = ae[1] * be[1];
        oe[2] = ae[2] * be[2];
        oe[3] = ae[3] * be[3];
    }
    /**
     * 缩放四维向量。
     * @param	a   源四维向量。
     * @param	b   缩放值。
     * @param	out 输出四维向量。
     */
    static scale(a, b, out) {
        var oe = out.elements;
        var ae = a.elements;
        oe[0] = ae[0] * b;
        oe[1] = ae[1] * b;
        oe[2] = ae[2] * b;
        oe[3] = ae[3] * b;
    }
    /**
     * 求一个指定范围的四维向量
     * @param	value clamp向量
     * @param	min   最小
     * @param	max   最大
     * @param   out   输出向量
     */
    static Clamp(value, min, max, out) {
        var valuee = value.elements;
        var x = valuee[0];
        var y = valuee[1];
        var z = valuee[2];
        var w = valuee[3];
        var mine = min.elements;
        var mineX = mine[0];
        var mineY = mine[1];
        var mineZ = mine[2];
        var mineW = mine[3];
        var maxe = max.elements;
        var maxeX = maxe[0];
        var maxeY = maxe[1];
        var maxeZ = maxe[2];
        var maxeW = maxe[3];
        var oute = out.elements;
        x = (x > maxeX) ? maxeX : x;
        x = (x < mineX) ? mineX : x;
        y = (y > maxeY) ? maxeY : y;
        y = (y < mineY) ? mineY : y;
        z = (z > maxeZ) ? maxeZ : z;
        z = (z < mineZ) ? mineZ : z;
        w = (w > maxeW) ? maxeW : w;
        w = (w < mineW) ? mineW : w;
        oute[0] = x;
        oute[1] = y;
        oute[2] = z;
        oute[3] = w;
    }
    /**
     * 两个四维向量距离的平方。
     * @param	value1 向量1。
     * @param	value2 向量2。
     * @return	距离的平方。
     */
    static distanceSquared(value1, value2) {
        var value1e = value1.elements;
        var value2e = value2.elements;
        var x = value1e[0] - value2e[0];
        var y = value1e[1] - value2e[1];
        var z = value1e[2] - value2e[2];
        var w = value1e[3] - value2e[3];
        return (x * x) + (y * y) + (z * z) + (w * w);
    }
    /**
     * 两个四维向量距离。
     * @param	value1 向量1。
     * @param	value2 向量2。
     * @return	距离。
     */
    static distance(value1, value2) {
        var value1e = value1.elements;
        var value2e = value2.elements;
        var x = value1e[0] - value2e[0];
        var y = value1e[1] - value2e[1];
        var z = value1e[2] - value2e[2];
        var w = value1e[3] - value2e[3];
        return Math.sqrt((x * x) + (y * y) + (z * z) + (w * w));
    }
    /**
     * 求两个四维向量的点积。
     * @param	a 向量。
     * @param	b 向量。
     * @return  点积。
     */
    static dot(a, b) {
        var ae = a.elements;
        var be = b.elements;
        var r = (ae[0] * be[0]) + (ae[1] * be[1]) + (ae[2] * be[2]) + (ae[3] * be[3]);
        return r;
    }
    /**
     * 分别取两个四维向量x、y、z的最小值计算新的四维向量。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 结果三维向量。
     */
    static min(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        e[0] = Math.min(f[0], g[0]);
        e[1] = Math.min(f[1], g[1]);
        e[2] = Math.min(f[2], g[2]);
        e[3] = Math.min(f[3], g[3]);
    }
    /**
     * 分别取两个四维向量x、y、z的最大值计算新的四维向量。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 结果三维向量。
     */
    static max(a, b, out) {
        var e = out.elements;
        var f = a.elements;
        var g = b.elements;
        e[0] = Math.max(f[0], g[0]);
        e[1] = Math.max(f[1], g[1]);
        e[2] = Math.max(f[2], g[2]);
        e[3] = Math.max(f[3], g[3]);
    }
}
/*[FILEINDEX:10000]*/
/**零向量，禁止修改*/
ConchVector4.ZERO = new ConchVector4();
/*一向量，禁止修改*/
ConchVector4.ONE = new ConchVector4(1.0, 1.0, 1.0, 1.0);
/*X单位向量，禁止修改*/
ConchVector4.UnitX = new ConchVector4(1.0, 0.0, 0.0, 0.0);
/*Y单位向量，禁止修改*/
ConchVector4.UnitY = new ConchVector4(0.0, 1.0, 0.0, 0.0);
/*Z单位向量，禁止修改*/
ConchVector4.UnitZ = new ConchVector4(0.0, 0.0, 1.0, 0.0);
/*W单位向量，禁止修改*/
ConchVector4.UnitW = new ConchVector4(0.0, 0.0, 0.0, 1.0);
