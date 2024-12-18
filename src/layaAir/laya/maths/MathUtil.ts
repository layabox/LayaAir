/**
 * @private
 * @en The MathUtil class is a utility class for data processing.
 * @zh MathUtil 是一个数据处理工具类。
 */
export class MathUtil {

    /**
     * @en Performs linear interpolation between two values.
     * @param left The start value.
     * @param right The end value.
     * @param amount The interpolation amount (0-1).
     * @returns The interpolated value.
     * @zh 在两个值之间进行线性插值。
     * @param left 起始值。
     * @param right 终止值。
     * @param amount 插值比率（0-1）。
     * @returns 插值结果。
     */
    static lerp(left: number, right: number, amount: number): number {
        return left * (1 - amount) + right * amount;
    }

    /**
     * @en Repeats a value `t` within the range of `0` to `length`.
     * 
     * This function calculates the remainder of `t` divided by `length`,
     * effectively wrapping `t` around within the interval `[0, length)`.
     * 
     * @param t - The value to be repeated.
     * @param length - The length of the interval within which to repeat the value.
     * @returns The repeated value within the interval `[0, length)`.
     * @zh 重复一个值 `t`，使其范围限定在 `0` 到 `length` 之间。
     * @param t - 要重复的值。
     * @param length - 要重复的范围长度。
     * @returns 重复的值，其范围在 `[0, length)` 之间。
     */
    static repeat(t: number, length: number): number {
        return t - Math.floor(t / length) * length;
    }

    /**
     * @en Calculates the distance between two points (x1, y1) and (x2, y2) in a 2D space.
     * @param x1 - The x-coordinate of the first point.
     * @param y1 - The y-coordinate of the first point.
     * @param x2 - The x-coordinate of the second point.
     * @param y2 - The y-coordinate of the second point.
     * @returns The distance between the two points.
     * @zh 计算二维空间中两点 (x1, y1) 和 (x2, y2) 之间的距离。
     * @param x1 第一个点的 X 坐标。
     * @param y1 第一个点的 Y 坐标。
     * @param x2 第二个点的 X 坐标。
     * @param y2 第二个点的 Y 坐标。
     * @returns 两点之间的距离。
     */
    static distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    /**
     * @en Clamps a value between a minimum float and maximum float value.
     * @param value The value to clamp.
     * @param min The minimum value. If `value` is less than `min`, `min` is returned. 
     * @param max The maximum value. If `value` is greater than `max`, `max` is returned. 
     * @returns The clamped value.
     * @zh 将值限制在指定范围内。
     * @param value 要限制的值。
     * @param min 最小值，如果 `value` 小于 `min`，返回 `min`。
     * @param max 最大值，如果 `value` 大于 `max`，返回 `max`。
     * @returns 限制后的值。 
     */
    static clamp(value: number, min: number, max: number): number {
        if (value < min)
            value = min;
        else if (value > max)
            value = max;
        return value;
    }

    /**
     * @en Clamps a value between 0 and 1.
     * @param value The value to clamp.
     * @returns The clamped value.
     * @zh 将值限制在 0 和 1 之间。
     * @param value 要限制的值。
     * @returns 限制后的值。
     */
    static clamp01(value: number): number {
        if (isNaN(value))
            value = 0;
        else if (value > 1)
            value = 1;
        else if (value < 0)
            value = 0;
        return value;
    }

    /**
     * @en Performs spherical linear interpolation (slerp) between two quaternions.
     * @param a The start quaternion array.
     * @param Offset1 The offset in the start quaternion array.
     * @param b The end quaternion array.
     * @param Offset2 The offset in the end quaternion array.
     * @param t The interpolation amount (0-1).
     * @param out The output quaternion array to store the result.
     * @param Offset3 The offset in the output quaternion array.
     * @returns The output quaternion array.
     * @zh 在两个四元数之间进行球面线性插值（slerp）。
     * @param a 起始四元数数组。
     * @param Offset1 起始四元数数组的偏移量。
     * @param b 终止四元数数组。
     * @param Offset2 终止四元数数组的偏移量。 
     * @param t 插值比率（0-1）。
     * @param out 用于存储结果的输出四元数数组。
     * @param Offset3 输出四元数数组的偏移量。
     * @returns 输出四元数数组。
     */
    static slerpQuaternionArray(a: Float32Array, Offset1: number, b: Float32Array, Offset2: number, t: number, out: Float32Array, Offset3: number): Float32Array {

        var ax: number = a[Offset1 + 0], ay: number = a[Offset1 + 1], az: number = a[Offset1 + 2], aw: number = a[Offset1 + 3], bx: number = b[Offset2 + 0], by: number = b[Offset2 + 1], bz: number = b[Offset2 + 2], bw: number = b[Offset2 + 3];

        var omega: number, cosom: number, sinom: number, scale0: number, scale1: number;

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
        } else {
            // "from" and "to" quaternions are very close  
            //  ... so we can do a linear interpolation 
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values 
        out[Offset3 + 0] = scale0 * ax + scale1 * bx;
        out[Offset3 + 1] = scale0 * ay + scale1 * by;
        out[Offset3 + 2] = scale0 * az + scale1 * bz;
        out[Offset3 + 3] = scale0 * aw + scale1 * bw;

        return out;

    }

    /**
     * @en Gets the angle value of the line segment formed by two specified points.
     * @param x0 The X coordinate of the first point.
     * @param y0 The Y coordinate of the first point.
     * @param x1 The X coordinate of the second point.
     * @param y1 The Y coordinate of the second point.
     * @returns The angle value in degrees.
     * @zh 获取由两个指定点组成的线段的角度值。
     * @param x0 第一个点的 X 坐标。
     * @param y0 第一个点的 Y 坐标。
     * @param x1 第二个点的 X 坐标。
     * @param y1 第二个点的 Y 坐标。
     * @returns 角度值，单位为度。
     */
    static getRotation(x0: number, y0: number, x1: number, y1: number): number {
        return Math.atan2(y1 - y0, x1 - x0) / Math.PI * 180;
    }

    /**
     * @en A comparison function to determine the sorting order of array elements.
     * @param a The first number to compare.
     * @param b The second number to compare.
     * @returns 0 if a equals b, 1 if b > a, -1 if b < a.
     * @zh 一个用来确定数组元素排序顺序的比较函数。
     * @param a 待比较数字。
     * @param b 待比较数字。
     * @returns 如果a等于b 则值为0；如果b>a则值为1；如果b<则值为-1。
     */
    static sortBigFirst(a: number, b: number): number {
        if (a == b) return 0;
        return b > a ? 1 : -1;
    }

    /**
     * @en A comparison function to determine the sorting order of array elements.
     * @param a The first number to compare.
     * @param b The second number to compare.
     * @returns 0 if a equals b, -1 if b > a, 1 if b < a.
     * @zh 一个用来确定数组元素排序顺序的比较函数。
     * @param a 待比较数字。
     * @param b 待比较数字。
     * @returns 如果a等于b 则值为0；如果b>a则值为-1；如果b<则值为1。
     */
    static sortSmallFirst(a: number, b: number): number {
        if (a == b) return 0;
        return b > a ? -1 : 1;
    }

    /**
     * @en Compares the specified elements by converting them to numbers.
     * @param a The first element to compare.
     * @param b The second element to compare.
     * @returns The difference between b and a as numbers (b-a).
     * @zh 将指定的元素转为数字进行比较。
     * @param a 待比较元素。
     * @param b 待比较元素。
     * @returns b、a转化成数字的差值 (b-a)。
     */
    static sortNumBigFirst(a: any, b: any): number {
        return parseFloat(b) - parseFloat(a);
    }

    /**
     * @en Compares the specified elements by converting them to numbers.
     * @param a The first element to compare.
     * @param b The second element to compare.
     * @returns The difference between a and b as numbers (a-b).
     * @zh 将指定的元素转为数字进行比较。
     * @param a 待比较元素。
     * @param b 待比较元素。
     * @returns a、b转化成数字的差值 (a-b)。
     */
    static sortNumSmallFirst(a: any, b: any): number {
        return parseFloat(a) - parseFloat(b);
    }

    /**
     * @en Returns a comparison function for sorting objects based on a specified property.
     * @param key The name of the object property to sort by.
     * @param bigFirst If true, sort from big to small; otherwise, sort from small to big.
     * @param forceNum If true, convert the sorting elements to numbers for comparison.
     * @returns The sorting function.
     * @zh 返回根据对象指定的属性进行排序的比较函数。
     * @param key 排序要依据的元素属性名。
     * @param bigFirst 如果值为true，则按照由大到小的顺序进行排序，否则按照由小到大的顺序进行排序。
     * @param forceNum 如果值为true，则将排序的元素转为数字进行比较。
     * @return 排序函数。
     */
    static sortByKey(key: string, bigFirst: boolean = false, forceNum: boolean = true): (a: any, b: any) => number {
        var _sortFun: Function;
        if (bigFirst) {
            _sortFun = forceNum ? MathUtil.sortNumBigFirst : MathUtil.sortBigFirst;
        } else {
            _sortFun = forceNum ? MathUtil.sortNumSmallFirst : MathUtil.sortSmallFirst;
        }
        return function (a: any, b: any): number {
            return _sortFun(a[key], b[key]);
        }
    }
}


