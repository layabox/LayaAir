import { Matrix4x4 } from "./Matrix4x4";
import { MathUtils3D } from "./MathUtils3D";
import { Vector2 } from "./Vector2";
import { IClone } from "../utils/IClone";

/**
 * @en The `Vector4` class is used to create four-dimensional vectors.
 * @zh `Vector4` 类用于创建四维向量。
 */
export class Vector4 implements IClone {

    /**
     * @en Zero vector (0, 0, 0, 0).
     * @zh 零向量 (0, 0, 0, 0)。
     */
    static readonly ZERO: Readonly<Vector4> = new Vector4();

    /**
     * @en One vector (1, 1, 1, 1).
     * @zh 一向量 (1, 1, 1, 1)。
     */
    static readonly ONE: Readonly<Vector4> = new Vector4(1.0, 1.0, 1.0, 1.0);

    /**
     * @en Unit X vector (1, 0, 0, 0).
     * @zh X 单位向量 (1, 0, 0, 0)。
     */
    static readonly UnitX: Readonly<Vector4> = new Vector4(1.0, 0.0, 0.0, 0.0);

    /**
     * @en Unit Y vector (0, 1, 0, 0).
     * @zh Y 单位向量 (0, 1, 0, 0)。
     */
    static readonly UnitY: Readonly<Vector4> = new Vector4(0.0, 1.0, 0.0, 0.0);

    /**
     * @en Unit Z vector (0, 0, 1, 0).
     * @zh Z 单位向量 (0, 0, 1, 0)。
     */
    static readonly UnitZ: Readonly<Vector4> = new Vector4(0.0, 0.0, 1.0, 0.0);

    /**
     * @en Unit W vector (0, 0, 0, 1).
     * @zh W 单位向量 (0, 0, 0, 1)。
     */
    static readonly UnitW: Readonly<Vector4> = new Vector4(0.0, 0.0, 0.0, 1.0);

    /** @internal */
    static tempVec4: Vector4 = new Vector4(0.0, 0.0, 0.0, 0.0);

    /**
     * @en X coordinate.
     * @zh X 轴坐标。
     */
    x: number;

    /**
     * @en Y coordinate.
     * @zh Y 轴坐标。
     */
    y: number;

    /**
     * @en Z coordinate.
     * @zh Z 轴坐标。
     */
    z: number;

    /**
     * @en W coordinate.
     * @zh W 轴坐标。
     */
    w: number;

    /**
     * @en Constructor method, initializes the vector4.
     * @param x X coordinate. Default is 0.
     * @param y Y coordinate. Default is 0.
     * @param z Z coordinate. Default is 0.
     * @param w W coordinate. Default is 0.
     * @zh 构造方法，初始化四维向量。
     * @param x X 轴坐标。默认为 0。
     * @param y Y 轴坐标。默认为 0。
     * @param z Z 轴坐标。默认为 0。
     * @param w W 轴坐标。默认为 0。
     */
    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * @en Sets the x, y, z, and w values of the vector.
     * @param x The x value.
     * @param y The y value.
     * @param z The z value.
     * @param w The w value.
     * @zh 设置向量的 x、y、z 和 w 值。
     * @param x X值。
     * @param y Y值。
     * @param z Z值。
     * @param w W值。
     */
    setValue(x: number, y: number, z: number, w: number): void {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * @en Copies values from an array.
     * @param arr The source array.
     * @param offset The offset in the array. Default is 0.
     * @zh 从数组中拷贝值。
     * @param arr 源数组。
     * @param offset 数组偏移。默认值为 0。
     */
    fromArray(arr: ArrayLike<number>, offset: number = 0): void {
        this.x = arr[offset + 0];
        this.y = arr[offset + 1];
        this.z = arr[offset + 2];
        this.w = arr[offset + 3];
    }

    /**
     * @en Converts the vector to an array.
     * @returns An array containing the vector components [x, y, z, w].
     * @zh 将向量转换为数组。
     * @returns 包含向量分量的数组 [x, y, z, w]。
     */
    toArray(): Array<number> {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * @en Writes the vector values to a Float32Array.
     * @param arr The target Float32Array.
     * @param offset The offset in the array. Default is 0.
     * @zh 将向量值写入 Float32Array 数组。
     * @zh arr 目标 Float32Array 数组。
     * @zh offset 数组偏移。默认值为 0。
     */
    writeTo(arr: Float32Array, offset: number = 0): void {
        arr[offset + 0] = this.x;
        arr[offset + 1] = this.y;
        arr[offset + 2] = this.z;
        arr[offset + 3] = this.w;
    }

    /**
     * @en Clones this vector to another object.
     * @param destObject The destination object to clone to.
     * @zh 将当前向量克隆到目标对象。
     * @param destObject 克隆的目标对象。
     */
    cloneTo(destObject: any): void {
        var destVector4: Vector4 = (<Vector4>destObject);
        destVector4.x = this.x;
        destVector4.y = this.y;
        destVector4.z = this.z;
        destVector4.w = this.w;
    }

    /**
     * @en Creates a clone of this vector.
     * @returns A new Vector4 object with the same values as this vector.
     * @zh 创建当前向量的克隆。
     * @returns 返回一个新的 Vector4 对象，其值与当前向量相同。
     */
    clone(): any {
        var destVector4: Vector4 = new Vector4();
        this.cloneTo(destVector4);
        return destVector4;
    }

    /**
     * @en Performs a linear interpolation between two vectors.
     * @param a The first vector.
     * @param b The second vector.
     * @param t The interpolation coefficient.
     * @param out The output vector.
     * @zh 在两个向量之间进行线性插值。
     * @param a 起始向量。
     * @param b 目标向量。
     * @param t 插值系数。
     * @param out 输出向量。
     */
    static lerp(a: Vector4, b: Vector4, t: number, out: Vector4): void {
        var ax: number = a.x, ay: number = a.y, az: number = a.z, aw: number = a.w;
        out.x = ax + t * (b.x - ax);
        out.y = ay + t * (b.y - ay);
        out.z = az + t * (b.z - az);
        out.w = aw + t * (b.w - aw);
    }

    /**
     * @en Transforms a Vector4 by a 4x4 matrix.
     * @param vector4 The vector to transform.
     * @param m4x4 The transformation matrix.
     * @param out The output vector.
     * @zh 通过 4x4 矩阵转换一个四维向量。
     * @param vector4 待转换的四维向量。
     * @param m4x4 4x4 变换矩阵。
     * @param out 转换后的四维向量。
     */
    static transformByM4x4(vector4: Vector4, m4x4: Matrix4x4, out: Vector4): void {
        var vx: number = vector4.x;
        var vy: number = vector4.y;
        var vz: number = vector4.z;
        var vw: number = vector4.w;

        var me: Float32Array = m4x4.elements;

        out.x = vx * me[0] + vy * me[4] + vz * me[8] + vw * me[12];
        out.y = vx * me[1] + vy * me[5] + vz * me[9] + vw * me[13];
        out.z = vx * me[2] + vy * me[6] + vz * me[10] + vw * me[14];
        out.w = vx * me[3] + vy * me[7] + vz * me[11] + vw * me[15];
    }

    /**
     * @en Determines whether two Vector4 objects are equal.
     * @param a The first Vector4.
     * @param b The second Vector4.
     * @returns True if the vectors are equal, false otherwise.
     * @zh 判断两个四维向量是否相等。
     * @param a 第一个四维向量。
     * @param b 第二个四维向量。
     * @returns 如果向量相等则返回 true，否则返回 false。
     */
    static equals(a: Vector4, b: Vector4): boolean {
        return MathUtils3D.nearEqual(Math.abs(a.x), Math.abs(b.x)) && MathUtils3D.nearEqual(Math.abs(a.y), Math.abs(b.y)) && MathUtils3D.nearEqual(Math.abs(a.z), Math.abs(b.z)) && MathUtils3D.nearEqual(Math.abs(a.w), Math.abs(b.w));
    }

    /**
     * @en Determines whether this vector is equal to another vector.
     * @param value The vector to compare with.
     * @returns True if the vectors are equal, false otherwise.
     * @zh 判断当前向量是否与另一个向量相等。
     * @param value 用于比较的向量。
     * @returns 如果向量相等则返回 true，否则返回 false。
     */
    equal(value: Vector4) {
        return Vector4.equals(this, value);
    }

    /**
     * @en Calculates the length of the vector4.
     * @returns The length of the vector4.
     * @zh 计算四维向量的长度。
     * @return  四维向量的长度。
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    /**
     * @en Calculates the squared length of the vector4.
     * @returns The squared length of the vector4.
     * @zh 计算四维向量长度的平方。
     * @returns 返回四维向量长度的平方。
     */
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    /**
     * @en Normalize a vector4.
     * @param s Source vector4.
     * @param out Output vector4.
     * @zh 归一化四维向量。
     * @param s 源四维向量。
     * @param out 输出四维向量。
     */
    static normalize(s: Vector4, out: Vector4): void {
        var len: number = s.length();
        if (len > 0) {
            var inverse: number = 1.0 / len;
            out.x = s.x * inverse;
            out.y = s.y * inverse;
            out.z = s.z * inverse;
            out.w = s.w * inverse;
        }
    }

    /**
     * @en Calculate the sum of two four-dimensional vectors.
     * @param a First vector4.
     * @param b Second vector4.
     * @param out Output vector.
     * @zh 求两个四维向量的和。
     * @param a 第一个四维向量。
     * @param b 第二个四维向量。
     * @param out 输出向量。
     */
    static add(a: Vector4, b: Vector4, out: Vector4): void {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        out.w = a.w + b.w;
    }

    /**
     * @en Calculate the difference between two four-dimensional vectors.
     * @param a First vector4.
     * @param b Second vector4.
     * @param out Output vector.
     * @zh 求两个四维向量的差。
     * @param a 第一个四维向量。
     * @param b 第二个四维向量。
     * @param out 输出向量。
     */
    static subtract(a: Vector4, b: Vector4, out: Vector4): void {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        out.w = a.w - b.w;
    }

    /**
     * @en Calculate the product of two four-dimensional vectors.
     * @param a First vector4.
     * @param b Second vector4.
     * @param out Output vector.
     * @zh 计算两个四维向量的乘积。
     * @param a 第一个四维向量。
     * @param b 第二个四维向量。
     * @param out 输出向量。
     */
    static multiply(a: Vector4, b: Vector4, out: Vector4): void {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
        out.w = a.w * b.w;
    }

    /**
     * @en Scale a four-dimensional vector.
     * @param a Source vector4.
     * @param b Scale value.
     * @param out Output vector4.
     * @zh 缩放四维向量。
     * @param a 源四维向量。
     * @param b 缩放值。
     * @param out 输出四维向量。
     */
    static scale(a: Vector4, b: number, out: Vector4): void {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        out.w = a.w * b;
    }

    /**
     * @en Clamp a four-dimensional vector within a specified range.
     * @param value Vector to be clamped.
     * @param min Minimum values.
     * @param max Maximum values.
     * @param out Output vector.
     * @zh 将四维向量限制在指定的范围内。
     * @param value 要限制的向量。
     * @param min 最小值。
     * @param max 最大值。
     * @param out 输出向量。
     */
    static Clamp(value: Vector4, min: Vector4, max: Vector4, out: Vector4): void {
        var x: number = value.x;
        var y: number = value.y;
        var z: number = value.z;
        var w: number = value.w;

        var mineX: number = min.x;
        var mineY: number = min.y;
        var mineZ: number = min.z;
        var mineW: number = min.w;

        var maxeX: number = max.x;
        var maxeY: number = max.y;
        var maxeZ: number = max.z;
        var maxeW: number = max.w;

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
     * @en Calculate the squared distance between two four-dimensional vectors.
     * @param value1 The first vector4.
     * @param value2 The second vector4.
     * @returns The squared distance.
     * @zh 计算两个四维向量之间距离的平方。
     * @param value1 第一个四维向量。
     * @param value2 第二个四维向量。
     * @returns 距离的平方。
     */
    static distanceSquared(value1: Vector4, value2: Vector4): number {
        var x: number = value1.x - value2.x;
        var y: number = value1.y - value2.y;
        var z: number = value1.z - value2.z;
        var w: number = value1.w - value2.w;

        return (x * x) + (y * y) + (z * z) + (w * w);
    }

    /**
     * @en Calculate the distance between two four-dimensional vectors.
     * @param value1 The first vector.
     * @param value2 The second vector.
     * @returns The distance.
     * @zh 计算两个四维向量之间的距离。
     * @param value1 第一个向量。
     * @param value2 第二个向量。
     * @returns 距离。
     */
    static distance(value1: Vector4, value2: Vector4): number {
        var x: number = value1.x - value2.x;
        var y: number = value1.y - value2.y;
        var z: number = value1.z - value2.z;
        var w: number = value1.w - value2.w;

        return Math.sqrt((x * x) + (y * y) + (z * z) + (w * w));
    }

    /**
     * @en Calculate the dot product of two four-dimensional vectors.
     * @param a The first vector.
     * @param b The second vector.
     * @returns The dot product.
     * @zh 计算两个四维向量的点积。
     * @param a 第一个向量。
     * @param b 第二个向量。
     * @returns 点积。
     */
    static dot(a: Vector4, b: Vector4): number {
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z) + (a.w * b.w);
    }

    /**
     * @en Calculate a new four-dimensional vector using the minimum values of x, y, z, and w from two vectors.
     * @param a The first vector4.
     * @param b The second vector4.
     * @param out The resulting vector4.
     * @zh 分别取两个四维向量x、y、z、w的最小值计算新的四维向量。
     * @param a 第一个四维向量。
     * @param b 第二个四维向量。
     * @param out 结果四维向量。
     */
    static min(a: Vector4, b: Vector4, out: Vector4): void {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        out.w = Math.min(a.w, b.w);
    }

    /**
     * @en Calculate a new four-dimensional vector using the maximum values of x, y, z, and w from two vectors.
     * @param a The first vector4.
     * @param b The second vector4.
     * @param out The resulting vector4.
     * @zh 分别取两个四维向量x、y、z、w的最大值计算新的四维向量。
     * @param a 第一个四维向量。
     * @param b 第二个四维向量。
     * @param out 结果四维向量。
     */
    static max(a: Vector4, b: Vector4, out: Vector4): void {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        out.w = Math.max(a.w, b.w);
    }
}

