import { Vector4 } from "././Vector4";
import { MathUtils3D } from "././MathUtils3D";
import { Vector2 } from "././Vector2";
/**
 * <code>Vector3</code> 类用于创建三维向量。
 */
export class Vector3 {
    /**
     * 创建一个 <code>Vector3</code> 实例。
     * @param	x  X轴坐标。
     * @param	y  Y轴坐标。
     * @param	z  Z轴坐标。
     */
    constructor(x = 0, y = 0, z = 0, nativeElements = null /*[NATIVE]*/) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * 两个三维向量距离的平方。
     * @param	value1 向量1。
     * @param	value2 向量2。
     * @return	距离的平方。
     */
    static distanceSquared(value1, value2) {
        var x = value1.x - value2.x;
        var y = value1.y - value2.y;
        var z = value1.z - value2.z;
        return (x * x) + (y * y) + (z * z);
    }
    /**
     * 两个三维向量距离。
     * @param	value1 向量1。
     * @param	value2 向量2。
     * @return	距离。
     */
    static distance(value1, value2) {
        var x = value1.x - value2.x;
        var y = value1.y - value2.y;
        var z = value1.z - value2.z;
        return Math.sqrt((x * x) + (y * y) + (z * z));
    }
    /**
     * 分别取两个三维向量x、y、z的最小值计算新的三维向量。
     * @param	a。
     * @param	b。
     * @param	out。
     */
    static min(a, b, out) {
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
    static max(a, b, out) {
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
    static transformQuat(source, rotation, out) {
        var x = source.x, y = source.y, z = source.z, qx = rotation.x, qy = rotation.y, qz = rotation.z, qw = rotation.w, ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
        out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    }
    /**
     * 计算标量长度。
     * @param	a 源三维向量。
     * @return 标量长度。
     */
    static scalarLength(a) {
        var x = a.x, y = a.y, z = a.z;
        return Math.sqrt(x * x + y * y + z * z);
    }
    /**
     * 计算标量长度的平方。
     * @param	a 源三维向量。
     * @return 标量长度的平方。
     */
    static scalarLengthSquared(a) {
        var x = a.x, y = a.y, z = a.z;
        return x * x + y * y + z * z;
    }
    /**
     * 归一化三维向量。
     * @param	s 源三维向量。
     * @param	out 输出三维向量。
     */
    static normalize(s, out) {
        var x = s.x, y = s.y, z = s.z;
        var len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = s.x * len;
            out.y = s.y * len;
            out.z = s.z * len;
        }
    }
    /**
     * 计算两个三维向量的乘积。
     * @param	a left三维向量。
     * @param	b right三维向量。
     * @param	out 输出三维向量。
     */
    static multiply(a, b, out) {
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
    static scale(a, b, out) {
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
    static lerp(a, b, t, out) {
        var ax = a.x, ay = a.y, az = a.z;
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
    static transformV3ToV3(vector, transform, result) {
        var intermediate = Vector3._tempVector4;
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
    static transformV3ToV4(vector, transform, result) {
        var vectorX = vector.x;
        var vectorY = vector.y;
        var vectorZ = vector.z;
        var transformElem = transform.elements;
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
    static TransformNormal(normal, transform, result) {
        var normalX = normal.x;
        var normalY = normal.y;
        var normalZ = normal.z;
        var transformElem = transform.elements;
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
    static transformCoordinate(coordinate, transform, result) {
        var coordinateX = coordinate.x;
        var coordinateY = coordinate.y;
        var coordinateZ = coordinate.z;
        var transformElem = transform.elements;
        var w = ((coordinateX * transformElem[3]) + (coordinateY * transformElem[7]) + (coordinateZ * transformElem[11]) + transformElem[15]);
        result.x = (coordinateX * transformElem[0]) + (coordinateY * transformElem[4]) + (coordinateZ * transformElem[8]) + transformElem[12] / w;
        result.y = (coordinateX * transformElem[1]) + (coordinateY * transformElem[5]) + (coordinateZ * transformElem[9]) + transformElem[13] / w;
        result.z = (coordinateX * transformElem[2]) + (coordinateY * transformElem[6]) + (coordinateZ * transformElem[10]) + transformElem[14] / w;
    }
    /**
     * 求一个指定范围的向量
     * @param	value clamp向量
     * @param	min  最小
     * @param	max  最大
     * @param   out 输出向量
     */
    static Clamp(value, min, max, out) {
        var x = value.x;
        var y = value.y;
        var z = value.z;
        var mineX = min.x;
        var mineY = min.y;
        var mineZ = min.z;
        var maxeX = max.x;
        var maxeY = max.y;
        var maxeZ = max.z;
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
    static add(a, b, out) {
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
    static subtract(a, b, o) {
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
    static cross(a, b, o) {
        var ax = a.x, ay = a.y, az = a.z, bx = b.x, by = b.y, bz = b.z;
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
    static dot(a, b) {
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
    }
    /**
     * 判断两个三维向量是否相等。
     * @param	a 三维向量。
     * @param	b 三维向量。
     * @return  是否相等。
     */
    static equals(a, b) {
        return MathUtils3D.nearEqual(a.x, b.x) && MathUtils3D.nearEqual(a.y, b.y) && MathUtils3D.nearEqual(a.z, b.z);
    }
    /**
     * 设置xyz值。
     * @param	x X值。
     * @param	y Y值。
     * @param	z Z值。
     */
    setValue(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
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
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destVector3 = destObject;
        destVector3.x = this.x;
        destVector3.y = this.y;
        destVector3.z = this.z;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destVector3 = new Vector3();
        this.cloneTo(destVector3);
        return destVector3;
    }
    toDefault() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    forNativeElement(nativeElements = null) {
        if (nativeElements) {
            this.elements = nativeElements;
            this.elements[0] = this.x;
            this.elements[1] = this.y;
            this.elements[2] = this.z;
        }
        else {
            this.elements = new Float32Array([this.x, this.y, this.z]);
        }
        Vector2.rewriteNumProperty(this, "x", 0);
        Vector2.rewriteNumProperty(this, "y", 1);
        Vector2.rewriteNumProperty(this, "z", 2);
    }
}
/**@private	*/
Vector3._tempVector4 = new Vector4();
/**@private	*/
Vector3._ZERO = new Vector3(0.0, 0.0, 0.0);
/**@private	*/
Vector3._ONE = new Vector3(1.0, 1.0, 1.0);
/**@private	*/
Vector3._NegativeUnitX = new Vector3(-1, 0, 0);
/**@private	*/
Vector3._UnitX = new Vector3(1, 0, 0);
/**@private	*/
Vector3._UnitY = new Vector3(0, 1, 0);
/**@private	*/
Vector3._UnitZ = new Vector3(0, 0, 1);
/**@private	*/
Vector3._ForwardRH = new Vector3(0, 0, -1);
/**@private	*/
Vector3._ForwardLH = new Vector3(0, 0, 1);
/**@private	*/
Vector3._Up = new Vector3(0, 1, 0);
