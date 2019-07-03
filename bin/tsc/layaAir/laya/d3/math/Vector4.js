import { MathUtils3D } from "./MathUtils3D";
import { Vector2 } from "./Vector2";
/**
 * <code>Vector4</code> 类用于创建四维向量。
 */
export class Vector4 {
    /**
     * 创建一个 <code>Vector4</code> 实例。
     * @param	x  X轴坐标。
     * @param	y  Y轴坐标。
     * @param	z  Z轴坐标。
     * @param	w  W轴坐标。
     */
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    /**
     * 设置xyzw值。
     * @param	x X值。
     * @param	y Y值。
     * @param	z Z值。
     * @param	w W值。
     */
    setValue(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    /**
     * 从Array数组拷贝值。
     * @param  array 数组。
     * @param  offset 数组偏移。
     */
    fromArray(array, offset = 0) {
        this.x = array[offset + 0];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destVector4 = destObject;
        destVector4.x = this.x;
        destVector4.y = this.y;
        destVector4.z = this.z;
        destVector4.w = this.w;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destVector4 = new Vector4();
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
        var ax = a.x, ay = a.y, az = a.z, aw = a.w;
        out.x = ax + t * (b.x - ax);
        out.y = ay + t * (b.y - ay);
        out.z = az + t * (b.z - az);
        out.w = aw + t * (b.w - aw);
    }
    /**
     * 通过4x4矩阵把一个四维向量转换为另一个四维向量
     * @param	vector4 带转换四维向量。
     * @param	M4x4    4x4矩阵。
     * @param	out     转换后四维向量。
     */
    static transformByM4x4(vector4, m4x4, out) {
        var vx = vector4.x;
        var vy = vector4.y;
        var vz = vector4.z;
        var vw = vector4.w;
        var me = m4x4.elements;
        out.x = vx * me[0] + vy * me[4] + vz * me[8] + vw * me[12];
        out.y = vx * me[1] + vy * me[5] + vz * me[9] + vw * me[13];
        out.z = vx * me[2] + vy * me[6] + vz * me[10] + vw * me[14];
        out.w = vx * me[3] + vy * me[7] + vz * me[11] + vw * me[15];
    }
    /**
     * 判断两个四维向量是否相等。
     * @param	a 四维向量。
     * @param	b 四维向量。
     * @return  是否相等。
     */
    static equals(a, b) {
        return MathUtils3D.nearEqual(Math.abs(a.x), Math.abs(b.x)) && MathUtils3D.nearEqual(Math.abs(a.y), Math.abs(b.y)) && MathUtils3D.nearEqual(Math.abs(a.z), Math.abs(b.z)) && MathUtils3D.nearEqual(Math.abs(a.w), Math.abs(b.w));
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
        var len = s.length();
        if (len > 0) {
            out.x = s.x * len;
            out.y = s.y * len;
            out.z = s.z * len;
            out.w = s.w * len;
        }
    }
    /**
     * 求两个四维向量的和。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 输出向量。
     */
    static add(a, b, out) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        out.w = a.w + b.w;
    }
    /**
     * 求两个四维向量的差。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 输出向量。
     */
    static subtract(a, b, out) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        out.w = a.w - b.w;
    }
    /**
     * 计算两个四维向量的乘积。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 输出向量。
     */
    static multiply(a, b, out) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
        out.w = a.w * b.w;
    }
    /**
     * 缩放四维向量。
     * @param	a   源四维向量。
     * @param	b   缩放值。
     * @param	out 输出四维向量。
     */
    static scale(a, b, out) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        out.w = a.w * b;
    }
    /**
     * 求一个指定范围的四维向量
     * @param	value clamp向量
     * @param	min   最小
     * @param	max   最大
     * @param   out   输出向量
     */
    static Clamp(value, min, max, out) {
        var x = value.x;
        var y = value.y;
        var z = value.z;
        var w = value.w;
        var mineX = min.x;
        var mineY = min.y;
        var mineZ = min.z;
        var mineW = min.w;
        var maxeX = max.x;
        var maxeY = max.y;
        var maxeZ = max.z;
        var maxeW = max.w;
        x = (x > maxeX) ? maxeX : x;
        x = (x < mineX) ? mineX : x;
        y = (y > maxeY) ? maxeY : y;
        y = (y < mineY) ? mineY : y;
        z = (z > maxeZ) ? maxeZ : z;
        z = (z < mineZ) ? mineZ : z;
        w = (w > maxeW) ? maxeW : w;
        w = (w < mineW) ? mineW : w;
        out.x = x;
        out.y = y;
        out.z = z;
        out.w = w;
    }
    /**
     * 两个四维向量距离的平方。
     * @param	value1 向量1。
     * @param	value2 向量2。
     * @return	距离的平方。
     */
    static distanceSquared(value1, value2) {
        var x = value1.x - value2.x;
        var y = value1.y - value2.y;
        var z = value1.z - value2.z;
        var w = value1.w - value2.w;
        return (x * x) + (y * y) + (z * z) + (w * w);
    }
    /**
     * 两个四维向量距离。
     * @param	value1 向量1。
     * @param	value2 向量2。
     * @return	距离。
     */
    static distance(value1, value2) {
        var x = value1.x - value2.x;
        var y = value1.y - value2.y;
        var z = value1.z - value2.z;
        var w = value1.w - value2.w;
        return Math.sqrt((x * x) + (y * y) + (z * z) + (w * w));
    }
    /**
     * 求两个四维向量的点积。
     * @param	a 向量。
     * @param	b 向量。
     * @return  点积。
     */
    static dot(a, b) {
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z) + (a.w * b.w);
    }
    /**
     * 分别取两个四维向量x、y、z的最小值计算新的四维向量。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 结果三维向量。
     */
    static min(a, b, out) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        out.w = Math.min(a.w, b.w);
    }
    /**
     * 分别取两个四维向量x、y、z的最大值计算新的四维向量。
     * @param	a   四维向量。
     * @param	b   四维向量。
     * @param	out 结果三维向量。
     */
    static max(a, b, out) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        out.w = Math.max(a.w, b.w);
    }
    forNativeElement(nativeElements = null) {
        if (nativeElements) {
            this.elements = nativeElements;
            this.elements[0] = this.x;
            this.elements[1] = this.y;
            this.elements[2] = this.z;
            this.elements[3] = this.w;
        }
        else {
            this.elements = new Float32Array([this.x, this.y, this.z, this.w]);
        }
        Vector2.rewriteNumProperty(this, "x", 0);
        Vector2.rewriteNumProperty(this, "y", 1);
        Vector2.rewriteNumProperty(this, "z", 2);
        Vector2.rewriteNumProperty(this, "w", 3);
    }
}
/**零向量，禁止修改*/
Vector4.ZERO = new Vector4();
/*一向量，禁止修改*/
Vector4.ONE = new Vector4(1.0, 1.0, 1.0, 1.0);
/*X单位向量，禁止修改*/
Vector4.UnitX = new Vector4(1.0, 0.0, 0.0, 0.0);
/*Y单位向量，禁止修改*/
Vector4.UnitY = new Vector4(0.0, 1.0, 0.0, 0.0);
/*Z单位向量，禁止修改*/
Vector4.UnitZ = new Vector4(0.0, 0.0, 1.0, 0.0);
/*W单位向量，禁止修改*/
Vector4.UnitW = new Vector4(0.0, 0.0, 0.0, 1.0);
