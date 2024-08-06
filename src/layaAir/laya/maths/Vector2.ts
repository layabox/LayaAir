import { IClone } from "../utils/IClone";
import { MathUtils3D } from "./MathUtils3D";

export interface IV2 {
    x: number;
    y: number;
}
/**
 * @en The `Vector2` class is used to create two-dimensional vectors.
 * @zh `Vector2` 类用于创建二维向量。
 */
export class Vector2 implements IClone {
    /**
     * @en Zero vector, read-only.
     * @zh 零向量，只读。
     */
    static readonly ZERO: Readonly<Vector2> = new Vector2(0.0, 0.0);
    /**
     * @en One vector, read-only.
     * @zh 单位向量，只读。
     */
    static readonly ONE: Readonly<Vector2> = new Vector2(1.0, 1.0);
    /**
     * @en Temporary Vector2 for calculations.
     * @zh 用于计算的临时 Vector2。
     */
    static TempVector2 = new Vector2();
    /**
     * @en X-axis coordinate.
     * @zh X 轴坐标。
     */
    x: number;
    /**
     * @en Y-axis coordinate.
     * @zh Y 轴坐标。
     */
    y: number;

    /**
     * @en Constructor method.
     * @param x X-axis coordinate.
     * @param y Y-axis coordinate.
     * @zh 构造方法
     * @param x X 轴坐标。
     * @param y Y 轴坐标。
     */
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * @en Sets the x and y values of the vector.
     * @param x The x value to set.
     * @param y The y value to set.
     * @zh 设置向量的 x 和 y 值。
     * @param x 要设置的 X 值。
     * @param y 要设置的 Y 值。
     */
    setValue(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    /**
     * @en Scales a two-dimensional vector.
     * @param a Source two-dimensional vector.
     * @param b Scale value.
     * @param out Output two-dimensional vector.
     * @zh 缩放二维向量。
     * @param a 源二维向量。
     * @param b 缩放值。
     * @param out 输出二维向量。
     */
    static scale(a: Vector2, b: number, out: Vector2): void {
        out.x = a.x * b;
        out.y = a.y * b;
    }

    /**
     * @en Determines whether two two-dimensional vectors are equal.
     * @param a First two-dimensional vector.
     * @param b Second two-dimensional vector.
     * @returns Whether the vectors are equal.
     * @zh 判断两个二维向量是否相等。
     * @param a 第一个二维向量。
     * @param b 第二个二维向量。
     * @returns 是否相等。
     */
    static equals(a: Vector2, b: Vector2): boolean {
        return MathUtils3D.nearEqual(a.x, b.x) && MathUtils3D.nearEqual(a.y, b.y);
    }

    /**
     * @en Copies values from an array.
     * @param array The source array.
     * @param offset The offset in the array. Default is 0.
     * @zh 从数组中拷贝值。
     * @param array 源数组。
     * @param offset 数组偏移。默认值为 0。
     */
    fromArray(array: ArrayLike<number>, offset: number = 0): void {
        this.x = array[offset + 0];
        this.y = array[offset + 1];
    }

    /**
     * @en Converts the vector to an array.
     * @returns An array representation of the vector.
     * @zh 将向量转换为数组。
     * @returns 表示向量的数组。
     */
    toArray(): Array<number> {
        return [this.x, this.y];
    }

    /**
     * @en Writes the vector to a Float32Array.
     * @param array The target Float32Array.
     * @param offset The offset in the array. Default is 0.
     * @zh 将向量写入 Float32Array 数组。
     * @param array 目标 Float32Array 数组。
     * @param offset 数组偏移。默认值为 0。
     */
    writeTo(array: Float32Array, offset: number = 0): void {
        array[offset + 0] = this.x;
        array[offset + 1] = this.y;
    }

    /**
     * @en Clones the vector to another object.
     * @param destObject The destination object to clone to.
     * @zh 将向量克隆到另一个对象。
     * @param destObject 克隆的目标对象。
     */
    cloneTo(destObject: any): void {
        var destVector2: Vector2 = (<Vector2>destObject);
        destVector2.x = this.x;
        destVector2.y = this.y;
    }

    /**
     * @en Calculates the dot product of two 2D vectors.
     * @param a The left vector.
     * @param b The right vector.
     * @returns The dot product.
     * @zh 计算两个二维向量的点积。
     * @param a 左向量。
     * @param b 右向量。
     * @returns 点积。
     */
    static dot(a: Vector2, b: Vector2): number {
        return (a.x * b.x) + (a.y * b.y);
    }

    /**
     * @en Normalizes a 2D vector.
     * @param s The source 2D vector.
     * @param out The output normalized 2D vector.
     * @zh 归一化二维向量。
     * @param s 源二维向量。
     * @param out 输出的归一化二维向量。
     */
    static normalize(s: Vector2, out: Vector2): void {
        var x: number = s.x, y: number = s.y;
        var len: number = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
        }
    }

    /**
     * @en Calculates the scalar length of a 2D vector.
     * @param a The source 2D vector.
     * @returns The scalar length.
     * @zh 计算二维向量的标量长度。
     * @param a 源二维向量。
     * @returns 标量长度。
     */
    static scalarLength(a: Vector2): number {
        var x: number = a.x, y: number = a.y;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * @en Creates a clone of this Vector2.
     * @returns Cloned copy of Vector2.
     * @zh 创建此Vector2的克隆。
     * @returns 克隆副本。
     */
    clone(): any {
        var destVector2: Vector2 = new Vector2();
        this.cloneTo(destVector2);
        return destVector2;
    }

}

