import { Vector4 } from "./Vector4";
import { Matrix4x4 } from "./Matrix4x4";
import { MathUtils3D } from "./MathUtils3D";
import { IClone } from "../utils/IClone";
import { Quaternion } from "./Quaternion";

/**
 * @en The `Vector3` class is used to create three-dimensional vectors.
 * @zh `Vector3` 类用于创建三维向量。
 */
export class Vector3 implements IClone {
    /**@internal*/
    static _tempVector4 = new Vector4();
    /**@internal*/
    static _tempVector3 = new Vector3();

    /**
     * @en Zero vector (0, 0, 0).
     * @zh 零向量 (0, 0, 0)。
     */
    static readonly ZERO: Readonly<Vector3> = new Vector3(0.0, 0.0, 0.0);
    /**
     * @en One vector (1, 1, 1).
     * @zh 单位向量 (1, 1, 1)。
     */
    static readonly ONE: Readonly<Vector3> = new Vector3(1.0, 1.0, 1.0);
    /**
     * @en Negative X axis (-1, 0, 0).
     * @zh 负X轴 (-1, 0, 0)。
     */
    static readonly NegativeUnitX: Readonly<Vector3> = new Vector3(-1, 0, 0);
    /**
     * @en Positive X axis (1, 0, 0).
     * @zh 正X轴 (1, 0, 0)。
     */
    static readonly UnitX: Readonly<Vector3> = new Vector3(1, 0, 0);
    /**
     * @en Positive Y axis (0, 1, 0).
     * @zh 正Y轴 (0, 1, 0)。
     */
    static readonly UnitY: Readonly<Vector3> = new Vector3(0, 1, 0);
    /**
     * @en Positive Z axis (0, 0, 1).
     * @zh 正Z轴 (0, 0, 1)。
     */
    static readonly UnitZ: Readonly<Vector3> = new Vector3(0, 0, 1);
    /**
     * @en Forward vector in right-handed coordinate system (0, 0, -1).
     * @zh 右手坐标系中的前向量 (0, 0, -1)。
     */
    static readonly ForwardRH: Readonly<Vector3> = new Vector3(0, 0, -1);
    /**
     * @en Forward vector in left-handed coordinate system (0, 0, 1).
     * @zh 左手坐标系中的前向量 (0, 0, 1)。
     */
    static readonly ForwardLH: Readonly<Vector3> = new Vector3(0, 0, 1);
    /**
     * @en Up vector (0, 1, 0).
     * @zh 上向量 (0, 1, 0)。
     */
    static readonly Up: Readonly<Vector3> = new Vector3(0, 1, 0);

    /**
     * @en Calculates the squared distance between two three-dimensional vectors.
     * @param value1 The first vector.
     * @param value2 The second vector.
     * @returns The squared distance.
     * @zh 计算两个三维向量之间距离的平方。
     * @param value1 第一个向量。
     * @param value2 第二个向量。
     * @returns 距离的平方。
     */
    static distanceSquared(value1: Vector3, value2: Vector3): number {
        var x: number = value1.x - value2.x;
        var y: number = value1.y - value2.y;
        var z: number = value1.z - value2.z;
        return (x * x) + (y * y) + (z * z);
    }

    /**
     * @en Calculates the distance between two three-dimensional vectors.
     * @param value1 The first vector.
     * @param value2 The second vector.
     * @returns The distance.
     * @zh 计算两个三维向量之间的距离。
     * @param value1 第一个向量。
     * @param value2 第二个向量。
     * @returns 距离。
     */
    static distance(value1: Vector3, value2: Vector3): number {
        var x: number = value1.x - value2.x;
        var y: number = value1.y - value2.y;
        var z: number = value1.z - value2.z;
        return Math.sqrt((x * x) + (y * y) + (z * z));
    }

    /**
     * @en Calculates a new three-dimensional vector by taking the minimum of x, y, and z from two vectors.
     * @param a The first Vector3.
     * @param b The second Vector3.
     * @param out The resulting Vector3.
     * @zh 通过取两个三维向量的 x、y、z 的最小值计算新的三维向量。
     * @param a 第一个三维向量。
     * @param b 第二个三维向量。
     * @param out 结果三维向量。
     */
    static min(a: Vector3, b: Vector3, out: Vector3): void {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
    }

    /**
     * @en Calculates a new three-dimensional vector by taking the maximum of x, y, and z from two vectors.
     * @param a The first Vector3.
     * @param b The second Vector3.
     * @param out The resulting Vector3.
     * @zh 通过取两个三维向量的 x、y、z 的最大值计算新的三维向量。
     * @param a 第一个三维向量。
     * @param b 第二个三维向量。
     * @param out 结果三维向量。
     */
    static max(a: Vector3, b: Vector3, out: Vector3): void {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
    }

    /**
     * @en Rotates a three-dimensional vector by a quaternion.
     * @param source The source vector3 to be rotated.
     * @param rotation The rotation quaternion.
     * @param out The output vector3.
     * @zh 根据四元数旋转三维向量。
     * @param source 要旋转的源三维向量。
     * @param rotation 旋转四元数。
     * @param out 输出三维向量。
     */
    static transformQuat(source: Vector3, rotation: Quaternion, out: Vector3): void {
        var x: number = source.x, y: number = source.y, z: number = source.z, qx: number = rotation.x, qy: number = rotation.y, qz: number = rotation.z, qw: number = rotation.w,

            ix: number = qw * x + qy * z - qz * y, iy: number = qw * y + qz * x - qx * z, iz: number = qw * z + qx * y - qy * x, iw: number = -qx * x - qy * y - qz * z;

        out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    }

    /**
     * @en Calculates the scalar length of a vector.
     * @param a The source vector.
     * @returns The scalar length.
     * @zh 计算向量的标量长度。
     * @param a 源向量。
     * @returns 标量长度。
     */
    static scalarLength(a: Vector3): number {
        var x: number = a.x, y: number = a.y, z: number = a.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * @en Calculates the squared scalar length of a vector.
     * @param a The source three-dimensional vector.
     * @returns The squared scalar length.
     * @zh 计算标量长度的平方。
     * @param a 源三维向量。
     * @returns 标量长度的平方。
     */
    static scalarLengthSquared(a: Vector3): number {
        var x: number = a.x, y: number = a.y, z: number = a.z;
        return x * x + y * y + z * z;
    }

    /**
     * @en Normalizes a three-dimensional vector.
     * @param s The source vector to be normalized.
     * @param out The output normalized vector.
     * @zh 归一化三维向量。
     * @param s 要归一化的源向量。
     * @param out 输出的归一化向量。
     */
    static normalize(s: Vector3, out: Vector3): void {
        var x: number = s.x, y: number = s.y, z: number = s.z;
        var len: number = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
            out.z = z * len;
        }
    }



    /**
     * @en Calculates the product of two three-dimensional vectors.
     * @param a The left vector3.
     * @param b The right vector3.
     * @param out The output vector3.
     * @zh 计算两个三维向量的乘积。
     * @param a 左侧三维向量。
     * @param b 右侧三维向量。
     * @param out 输出三维向量。
     */
    static multiply(a: Vector3, b: Vector3, out: Vector3): void {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
    }

    /**
     * @en Scales a three-dimensional vector.
     * @param a The source vector3 to be scaled.
     * @param b The scaling factor.
     * @param out The output scaled vector3.
     * @zh 缩放三维向量。
     * @param a 要缩放的源三维向量。
     * @param b 缩放因子。
     * @param out 输出的缩放后的三维向量。
     */
    static scale(a: Vector3, b: number, out: Vector3): void {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
    }

    /**
     * @en Performs a linear interpolation between two three-dimensional vectors.
     * @param a The starting vector.
     * @param b The ending vector.
     * @param t The interpolation coefficient in the range [0, 1].
     * @param out The output interpolated vector.
     * @zh 在两个三维向量之间进行线性插值。
     * @param a 起始向量。
     * @param b 结束向量。
     * @param t 插值系数，范围为 [0, 1]。
     * @param out 输出的插值向量。
     */
    static lerp(a: Vector3, b: Vector3, t: number, out: Vector3): void {
        var ax: number = a.x, ay: number = a.y, az: number = a.z;
        out.x = ax + t * (b.x - ax);
        out.y = ay + t * (b.y - ay);
        out.z = az + t * (b.z - az);
    }

    /**
     * @en Transforms a three-dimensional vector to another three-dimensional vector using a matrix.
     * @param vector The source vector3.
     * @param transform The transformation matrix.
     * @param result The output transformed vector3.
     * @zh 使用矩阵将一个三维向量转换为另一个三维向量。
     * @param vector 源三维向量。
     * @param transform 变换矩阵。
     * @param result 输出的转换后的三维向量。
     */
    static transformV3ToV3(vector: Vector3, transform: Matrix4x4, result: Vector3): void {
        var intermediate: Vector4 = Vector3._tempVector4;
        Vector3.transformV3ToV4(vector, transform, intermediate);
        result.x = intermediate.x;
        result.y = intermediate.y;
        result.z = intermediate.z;
    }

    /**
     * @en Transforms a three-dimensional vector to a four-dimensional vector using a matrix.
     * @param vector The source vector3.
     * @param transform The transformation matrix.
     * @param result The output vector4.
     * @zh 使用矩阵将三维向量转换为四维向量。
     * @param vector 源三维向量。
     * @param transform 变换矩阵。
     * @param result 输出的四维向量。
     */
    static transformV3ToV4(vector: Vector3, transform: Matrix4x4, result: Vector4): void {
        var vectorX: number = vector.x;
        var vectorY: number = vector.y;
        var vectorZ: number = vector.z;

        var transformElem: Float32Array = transform.elements;
        result.x = (vectorX * transformElem[0]) + (vectorY * transformElem[4]) + (vectorZ * transformElem[8]) + transformElem[12];
        result.y = (vectorX * transformElem[1]) + (vectorY * transformElem[5]) + (vectorZ * transformElem[9]) + transformElem[13];
        result.z = (vectorX * transformElem[2]) + (vectorY * transformElem[6]) + (vectorZ * transformElem[10]) + transformElem[14];
        result.w = (vectorX * transformElem[3]) + (vectorY * transformElem[7]) + (vectorZ * transformElem[11]) + transformElem[15];
    }

    /**
     * @en Transforms a normal three-dimensional vector to another three-dimensional vector using a normal transformation matrix.
     * @param normal The source normal vector3.
     * @param transform The normal transformation matrix.
     * @param result The output transformed normal vector3.
     * @zh 使用法线变换矩阵将法线三维向量转换为另一个三维向量。
     * @param normal 源法线三维向量。
     * @param transform 法线变换矩阵。
     * @param result 输出转换后的法线三维向量。
     */
    static TransformNormal(normal: Vector3, transform: Matrix4x4, result: Vector3): void {
        var normalX: number = normal.x;
        var normalY: number = normal.y;
        var normalZ: number = normal.z;

        var transformElem: Float32Array = transform.elements;
        result.x = (normalX * transformElem[0]) + (normalY * transformElem[4]) + (normalZ * transformElem[8]);
        result.y = (normalX * transformElem[1]) + (normalY * transformElem[5]) + (normalZ * transformElem[9]);
        result.z = (normalX * transformElem[2]) + (normalY * transformElem[6]) + (normalZ * transformElem[10]);
    }

    /**
     * @en Transforms a three-dimensional vector to another normalized three-dimensional vector using a matrix.
     * @param coordinate The source three-dimensional vector.
     * @param transform The transformation matrix.
     * @param result The output normalized three-dimensional vector.
     * @zh 使用矩阵将三维向量转换为另一个归一化的三维向量。
     * @param coordinate 源三维向量。
     * @param transform 变换矩阵。
     * @param result 输出的归一化三维向量。
     */
    static transformCoordinate(coordinate: Vector3, transform: Matrix4x4, result: Vector3): void {
        var coordinateX: number = coordinate.x;
        var coordinateY: number = coordinate.y;
        var coordinateZ: number = coordinate.z;

        var transformElem: Float32Array = transform.elements;
        var w: number = coordinateX * transformElem[3] + coordinateY * transformElem[7] + coordinateZ * transformElem[11] + transformElem[15];
        result.x = (coordinateX * transformElem[0] + coordinateY * transformElem[4] + coordinateZ * transformElem[8] + transformElem[12]) / w;
        result.y = (coordinateX * transformElem[1] + coordinateY * transformElem[5] + coordinateZ * transformElem[9] + transformElem[13]) / w;
        result.z = (coordinateX * transformElem[2] + coordinateY * transformElem[6] + coordinateZ * transformElem[10] + transformElem[14]) / w;
    }

    /**
     * @en Clamps a vector within a specified range.
     * @param value The vector to be clamped.
     * @param min The minimum values for each component.
     * @param max The maximum values for each component.
     * @param out The output clamped vector.
     * @zh 将向量限制在指定范围内。
     * @param value 要限制的向量。
     * @param min 每个分量的最小值。
     * @param max 每个分量的最大值。
     * @param out 输出的限制后的向量。
     */
    static Clamp(value: Vector3, min: Vector3, max: Vector3, out: Vector3): void {
        var x: number = value.x;
        var y: number = value.y;
        var z: number = value.z;

        var mineX: number = min.x;
        var mineY: number = min.y;
        var mineZ: number = min.z;

        var maxeX: number = max.x;
        var maxeY: number = max.y;
        var maxeZ: number = max.z;

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
     * @en Calculates the sum of two three-dimensional vectors.
     * @param a The left vector3.
     * @param b The right vector3.
     * @param out The output vector3.
     * @zh 计算两个三维向量的和。
     * @param a 左侧三维向量。
     * @param b 右侧三维向量。
     * @param out 输出向量。
     */
    static add(a: Vector3, b: Vector3, out: Vector3): void {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
    }

    /**
     * @en Calculates the difference between two three-dimensional vectors.
     * @param a The left vector3.
     * @param b The right vector3.
     * @param o The output vector3.
     * @zh 计算两个三维向量的差。
     * @param a 左侧三维向量。
     * @param b 右侧三维向量。
     * @param o 输出向量。
     */
    static subtract(a: Vector3, b: Vector3, o: Vector3): void {
        o.x = a.x - b.x;
        o.y = a.y - b.y;
        o.z = a.z - b.z;
    }

    /**
     * @en Calculates the cross product of two three-dimensional vectors.
     * @param a The left vector3.
     * @param b The right vector3.
     * @param o The output vector3.
     * @zh 计算两个三维向量的叉乘。
     * @param a 左侧三维向量。
     * @param b 右侧三维向量。
     * @param o 输出三维向量。
     */
    static cross(a: Vector3, b: Vector3, o: Vector3): void {
        var ax: number = a.x, ay: number = a.y, az: number = a.z, bx: number = b.x, by: number = b.y, bz: number = b.z;
        o.x = ay * bz - az * by;
        o.y = az * bx - ax * bz;
        o.z = ax * by - ay * bx;
    }

    /**
     * @en Calculates the dot product of two three-dimensional vectors.
     * @param a The left vector3.
     * @param b The right vector3.
     * @returns The dot product.
     * @zh 计算两个三维向量的点积。
     * @param a 左侧向量。
     * @param b 右侧向量。
     * @returns 点积。
     */
    static dot(a: Vector3, b: Vector3): number {
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
    }

    /**
     * @en Determines whether two three-dimensional vectors are equal.
     * @param a The first vector3.
     * @param b The second vector3.
     * @returns Whether the vectors are equal.
     * @zh 判断两个三维向量是否相等。
     * @param a 第一个三维向量。
     * @param b 第二个三维向量。
     * @returns 是否相等。
     */
    static equals(a: Vector3, b: Vector3): boolean {
        return MathUtils3D.nearEqual(a.x, b.x) && MathUtils3D.nearEqual(a.y, b.y) && MathUtils3D.nearEqual(a.z, b.z);
    }

    /**
     * @en X-axis coordinate
     * @zh X轴坐标
     */
    x: number;

    /**
     * @en Y-axis coordinate
     * @zh Y轴坐标
     */
    y: number;

    /**
     * @en Z-axis coordinate
     * @zh Z轴坐标
     */
    z: number;

    /**
     * @en Constructor method, 3D vector initialization.
     * @param x X-axis coordinate.
     * @param y Y-axis coordinate.
     * @param z Z-axis coordinate.
     * @zh 构造方法，初始化三维向量。
     * @param x X轴坐标。
     * @param y Y轴坐标。
     * @param z Z轴坐标。
     */
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * @en Determines whether the three-dimensional vector is equal to another vector.
     * @param value The vector to compare with.
     * @returns Returns true if the vectors are equal, false otherwise.
     * @zh 判断三维向量是否与另一个向量相等。
     * @param value 对比值
     * @returns 如果向量相等则返回 true，否则返回 false。
     */
    equal(value: Vector3) {
        return Vector3.equals(this, value);
    }

    /**
     * @en Sets the x, y, and z values of the vector.
     * @param x The x value.
     * @param y The y value.
     * @param z The z value.
     * @zh 设置向量的 x、y 和 z 值。
     * @param x X值。
     * @param y Y值。
     * @param z Z值。
     */
    setValue(x: number, y: number, z: number): Vector3 {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * @en Sets the x, y, and z values of the vector.
     * @param x The x value.
     * @param y The y value.
     * @param z The z value.
     * @zh 设置向量的 x、y 和 z 值。
     * @param x X值。
     * @param y Y值。
     * @param z Z值。
     */
    set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
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
    }

    /**
     * @en Converts the vector to an array.
     * @zh 将向量转换为数组。
     */
    toArray(): Array<number> {
        return [this.x, this.y, this.z];
    }

    /**
     * @en Writes the vector values to an array.
     * @param arr The target array.
     * @param offset The offset in the array. Default is 0.
     * @zh 将向量值写入数组。
     * @param arr 目标数组。
     * @param offset 数组偏移。默认值为 0。
     */
    writeTo(arr: Float32Array, offset: number = 0): void {
        arr[offset + 0] = this.x;
        arr[offset + 1] = this.y;
        arr[offset + 2] = this.z;
    }

    /**
     * @en Calculates the length of the vector.
     * @zh 计算向量的长度。
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * @en Calculates the squared length of the vector.
     * @zh 计算向量长度的平方。
     */
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * @en Subtracts a vector from this vector.
     * @param b The vector to subtract.
     * @param out The output vector.
     * @returns The resulting vector.
     * @zh 向量相减
     * @param b 被减向量。
     * @param out 输出向量。
     * @returns 相减后的结果向量。
     */
    vsub(b: Vector3, out: Vector3) {
        out.x = this.x - b.x;
        out.y = this.y - b.y;
        out.z = this.z - b.z;
        return out;
    }

    /**
     * @en Adds a vector to this vector.
     * @param b The vector to add.
     * @param out The output vector.
     * @returns The resulting vector.
     * @zh 向量相加。
     * @param b 加向量。
     * @param out 输出向量。
     * @returns returns 相加后的结果向量。
     */
    vadd(b: Vector3, out: Vector3) {
        out.x = this.x + b.x;
        out.y = this.y + b.y;
        out.z = this.z + b.z;
        return out;
    }

    /**
     * @en Scales this vector by a scalar value.
     * @param s The scalar value.
     * @param out The output vector.
     * @returns The scaled vector.
     * @zh 缩放向量。
     * @param s 缩放值。
     * @param out 输出向量。
     * @returns 缩放后的向量。
     */
    scale(s: number, out: Vector3) {
        out.x = this.x * s;
        out.y = this.y * s;
        out.z = this.z * s;
        return out;
    }

    /**
     * @en Normalizes this vector.
     * @returns The normalized vector.
     * @zh 归一化向量。
     * @returns 归一化后的向量。
     */
    normalize() {
        let x = this.x, y = this.y, z = this.z;
        var len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this.x = x * len;
            this.y = y * len;
            this.z = z * len;
        }
        return this;
    }

    /**
     * @en Calculates the dot product of this vector with another vector.
     * @param b The vector to dot product with.
     * @returns The dot product.
     * @zh 计算向量点乘。
     * @param b 点乘向量。
     * @returns 点乘结果。
     */
    dot(b: Vector3): number {
        return (this.x * b.x) + (this.y * b.y) + (this.z * b.z);
    }

    /**
     * @en Calculates the cross product of this vector with another vector.
     * @param b The vector to cross product with.
     * @param o The output vector.
     * @returns The resulting cross product vector.
     * @zh 计算向量叉乘。
     * @param b 叉乘向量。
     * @param o 输出向量。
     * @returns 叉乘结果向量。
     */
    cross(b: Vector3, o: Vector3): Vector3 {
        var ax = this.x, ay = this.y, az = this.z, bx = b.x, by = b.y, bz = b.z;
        o.x = ay * bz - az * by;
        o.y = az * bx - ax * bz;
        o.z = ax * by - ay * bx;
        return o;
    }

    /**
     * @en Clones this vector to another object.
     * @param destObject The destination object to clone to.
     * @zh 将当前向量克隆到目标对象。
     * @param destObject 克隆的目标对象。
     */
    cloneTo(destObject: Vector3): void {
        destObject.x = this.x;
        destObject.y = this.y;
        destObject.z = this.z;
    }

    /**
     * @en Creates a clone of this vector.
     * @returns A new Vector3 object with the same values as this vector.
     * @zh 创建当前向量的克隆。
     * @returns 返回一个新的 Vector3 对象，其值与当前向量相同。
     */
    clone(): any {
        var destVector3: Vector3 = new Vector3();
        this.cloneTo(destVector3);
        return destVector3;
    }

    /**
     * @en Sets this vector to its default value (0, 0, 0).
     * @zh 将当前向量设置为默认值 (0, 0, 0)。
     */
    toDefault(): void {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}

