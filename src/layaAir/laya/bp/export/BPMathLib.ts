export class BPMathLib {
    /**
     * 两数相加
     * @param a 第一个数
     * @param b 第二个数
     * @returns 两数相加的结果
     */
    static add(a: number, b: number): number {
        return a + b;
    }

    /**
     * 两数相减
     * @param a 被减数
     * @param b 减数
     * @returns 两数相减的结果
     */
    static subtract(a: number, b: number): number {
        return a - b;
    }

    /**
     * 两数相乘
     * @param a 第一个数
     * @param b 第二个数
     * @returns 两数相乘的结果
     */
    static multiply(a: number, b: number): number {
        return a * b;
    }

    /**
     * 两数相除
     * @param a 被除数
     * @param b 除数
     * @returns 两数相除的结果
     * @throws 如果除数为0，则抛出错误
     */
    static divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error('不允许除以0。');
        }
        return a / b;
    }

    /**
     * 计算数字的幂次方
     * @param base 底数
     * @param exponent 指数
     * @returns 幂次方的结果
     */
    static power(base: number, exponent: number): number {
        return Math.pow(base, exponent);
    }

    /**
     * 计算平方根
     * @param value 数字
     * @returns 平方根的结果
     * @throws 如果数字为负数，则抛出错误
     */
    static sqrt(value: number): number {
        if (value < 0) {
            throw new Error('无法计算负数的平方根。');
        }
        return Math.sqrt(value);
    }

    /**
     * 计算一个数的绝对值
     * @param value 数字
     * @returns 数字的绝对值
     */
    static abs(value: number): number {
        return Math.abs(value);
    }

    /**
     * 计算正弦值
     * @param angle 角度
     * @returns 正弦值
     */
    static sin(angle: number): number {
        return Math.sin(angle);
    }

    /**
     * 计算余弦值
     * @param angle 角度
     * @returns 余弦值
     */
    static cos(angle: number): number {
        return Math.cos(angle);
    }

    /**
     * 计算正切值
     * @param angle 角度
     * @returns 正切值
     */
    static tan(angle: number): number {
        return Math.tan(angle);
    }

    /**
     * 计算反正弦值
     * @param value 数值
     * @returns 反正弦值
     */
    static asin(value: number): number {
        return Math.asin(value);
    }

    /**
     * 计算反余弦值
     * @param value 数值
     * @returns 反余弦值
     */
    static acos(value: number): number {
        return Math.acos(value);
    }

    /**
     * 计算反正切值
     * @param value 数值
     * @returns 反正切值
     */
    static atan(value: number): number {
        return Math.atan(value);
    }

    /**
     * 计算 y/x（弧度表示）的反正切值
     * @param y y 轴坐标
     * @param x x 轴坐标
     * @returns 弧度
     */
    static atan2(y: number, x: number): number {
        return Math.atan2(y, x);
    }

    /**
     * 计算两点之间的距离
     * @param x1 第一个点的x坐标
     * @param y1 第一个点的y坐标
     * @param x2 第二个点的x坐标
     * @param y2 第二个点的y坐标
     * @returns 两点之间的距离
     */
    static distance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 四舍五入到指定的小数位数
     * @param value 要四舍五入的数字
     * @param decimals 小数位数，默认为0
     * @returns 四舍五入后的结果
     */
    static round(value: number, decimals: number = 0): number {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    /**
     * 向下取整
     * @param value 数字
     * @returns 向下取整后的结果
     */
    static floor(value: number): number {
        return Math.floor(value);
    }

    /**
     * 向上取整
     * @param value 数字
     * @returns 向上取整后的结果
     */
    static ceil(value: number): number {
        return Math.ceil(value);
    }

    /**
     * 计算余数
     * @param dividend 被除数
     * @param divisor 除数
     * @returns 余数
     */
    static mod(dividend: number, divisor: number): number {
        return dividend % divisor;
    }

    /**
     * 计算两数的最小值
     * @param a 第一个数
     * @param b 第二个数
     * @returns 两数的最小值
     */
    static min(a: number, b: number): number {
        return Math.min(a, b);
    }

    /**
     * 计算两数的最大值
     * @param a 第一个数
     * @param b 第二个数
     * @returns 两数的最大值
     */
    static max(a: number, b: number): number {
        return Math.max(a, b);
    }

    /**
     * 生成随机数，介于 0（包含） 到 1（不包括）之间
     * @returns 随机数
     */
    static random(): number {
        return Math.random();
    }

    /**
     * 判断a是否大于b
     * @param a 第一个数字
     * @param b 第二个数字
     * @returns 如果a大于b，则返回true；否则返回false
     */
    static greater(a: number, b: number): boolean {
        return a > b;
    }

    /**
     * 判断a是否小于b
     * @param a 第一个数字
     * @param b 第二个数字
     * @returns 如果a小于b，则返回true；否则返回false
     */
    static less(a: number, b: number): boolean {
        return a < b;
    }

    /**
     * 
     * @param a 
     * @param b 
     * @returns 是否相同
     */
    static equal(a: any, b: any): any {
        return a == b;
    }


    /**
     * 判断a是否大于等于b
     * @param a 第一个数字
     * @param b 第二个数字
     * @returns 如果a大于等于b，则返回true；否则返回false
     */
    static greaterEqual(a: number, b: number): boolean {
        return a >= b;
    }

    /**
     * 判断a是否小于等于b
     * @param a 第一个数字
     * @param b 第二个数字
     * @returns 如果a小于等于b，则返回true；否则返回false
     */
    static lessEqual(a: number, b: number): boolean {
        return a <= b;
    }
}