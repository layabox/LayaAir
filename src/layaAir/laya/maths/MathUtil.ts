/**
 * @private
 * @en The MathUtil class is a utility class for data processing.
 * @zh MathUtil 是一个数据处理工具类。
 */
export class MathUtil {

    /**
     * @en Subtracts two 3D vectors.
     * @param l The left vector.
     * @param r The right vector.
     * @param o The output vector to store the result.
     * @zh 计算两个三维向量的差。
     * @param l 左向量。
     * @param r 右向量。
     * @param o 用于存储结果的输出向量。
     */
    static subtractVector3(l: Float32Array, r: Float32Array, o: Float32Array): void {
        o[0] = l[0] - r[0];
        o[1] = l[1] - r[1];
        o[2] = l[2] - r[2];
    }

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
     * @en Scales a 3D vector by a scalar value.
     * @param f The input vector.
     * @param b The scalar value.
     * @param e The output vector to store the result.
     * @zh 将三维向量乘以一个标量值。
     * @param f 输入向量。
     * @param b 标量值。
     * @param e 用于存储结果的输出向量。
     */
    static scaleVector3(f: Float32Array, b: number, e: Float32Array): void {
        e[0] = f[0] * b;
        e[1] = f[1] * b;
        e[2] = f[2] * b;
    }

    /**
     * @en Performs linear interpolation between two 3D vectors.
     * @param l The start vector.
     * @param r The end vector.
     * @param t The interpolation amount (0-1).
     * @param o The output vector to store the result.
     * @zh 在两个三维向量之间进行线性插值。
     * @param l 起始向量。
     * @param r 终止向量。
     * @param t 插值比率（0-1）。
     * @param o 用于存储结果的输出向量。
     */
    static lerpVector3(l: Float32Array, r: Float32Array, t: number, o: Float32Array): void {
        var ax: number = l[0], ay: number = l[1], az: number = l[2];
        o[0] = ax + t * (r[0] - ax);
        o[1] = ay + t * (r[1] - ay);
        o[2] = az + t * (r[2] - az);
    }

    /**
     * @en Performs linear interpolation between two 4D vectors.
     * @param l The start vector.
     * @param r The end vector.
     * @param t The interpolation amount (0-1).
     * @param o The output vector to store the result.
     * @zh 在两个四维向量之间进行线性插值。
     * @param l 起始向量。
     * @param r 终止向量。
     * @param t 插值比率（0-1）。
     * @param o 用于存储结果的输出向量。
     */
    static lerpVector4(l: Float32Array, r: Float32Array, t: number, o: Float32Array): void {
        var ax: number = l[0], ay: number = l[1], az: number = l[2], aw: number = l[3];
        o[0] = ax + t * (r[0] - ax);
        o[1] = ay + t * (r[1] - ay);
        o[2] = az + t * (r[2] - az);
        o[3] = aw + t * (r[3] - aw);
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
     * @param	a 待比较数字。
     * @param	b 待比较数字。
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


