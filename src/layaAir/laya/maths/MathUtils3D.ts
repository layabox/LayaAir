/**
 * @en The MathUtils3D class is used to create mathematical utilities.
 * @zh MathUtils3D 类用于创建数学工具。
 */
export class MathUtils3D {
    /**
     * @en Tolerance for single-precision floating-point (float) zero.
     * @zh 单精度浮点(float)零的容差。
     */
    static zeroTolerance: number = 1e-6;
    /**
     * @en Default maximum value for floating-point numbers.
     * @zh 浮点数默认最大值。
     */
    static MaxValue: number = 3.40282347e+38;
    /**
     * @en Default minimum value for floating-point numbers.
     * @zh 浮点数默认最小值。
     */
    static MinValue: number = -3.40282347e+38;
    /**
     * @en Coefficient for converting degrees to radians.
     * @zh 角度转弧度系数。
     */
    static Deg2Rad: number = Math.PI / 180;
    /**
     * @en Constructor of MathUtils3D.
     * @zh MathUtils3D 的构造函数。
     */
    constructor() {

    }

    /**
     * @en Determines if a value is approximately zero within the tolerance range.
     * @param v The value to be checked.
     * @returns Whether the value is approximately zero.
     * @zh 是否在容差的范围内近似于0。
     * @param v 要判断的值。
     * @returns 是否近似于0。
     */
    static isZero(v: number): boolean {
        return Math.abs(v) < MathUtils3D.zeroTolerance;
    }

    /**
     * @en Determines if two values are approximately equal within the tolerance range.
     * @param n1 The first value to compare.
     * @param n2 The second value to compare.
     * @returns Whether the two values are approximately equal.
     * @zh 两个值是否在容差的范围内近似相等Sqr Magnitude。
     * @param n1 要比较的第一个值。
     * @param n2 要比较的第二个值。
     * @returns 两个值是否近似相等。
     */
    static nearEqual(n1: number, n2: number): boolean {
        if (MathUtils3D.isZero(n1 - n2))
            return true;
        return false;
    }

    /**
     * @en Calculate the reciprocal of the square root of a non-zero number.
     * @param value The input value.
     * @returns The reciprocal of the square root of the input value.
     * @zh 计算一个非0数的平方根的倒数。
     * @param value 输入值。
     * @returns 输入值的平方根倒数。
     */
    static fastInvSqrt(value: number): number {
        if (MathUtils3D.isZero(value))
            return value;
        return 1.0 / Math.sqrt(value);
    }
}


