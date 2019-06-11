/**
     * <code>MathUtils</code> 类用于创建数学工具。
     */
export class MathUtils3D {
    /**
     * 创建一个 <code>MathUtils</code> 实例。
     */
    constructor() {
    }
    /**
     * 是否在容差的范围内近似于0
     * @param  判断值
     * @return  是否近似于0
     */
    static isZero(v) {
        return Math.abs(v) < MathUtils3D.zeroTolerance;
    }
    /**
     * 两个值是否在容差的范围内近似相等Sqr Magnitude
     * @param  判断值
     * @return  是否近似于0
     */
    static nearEqual(n1, n2) {
        if (MathUtils3D.isZero(n1 - n2))
            return true;
        return false;
    }
    static fastInvSqrt(value) {
        if (MathUtils3D.isZero(value))
            return value;
        return 1.0 / Math.sqrt(value);
    }
}
/**单精度浮点(float)零的容差*/
MathUtils3D.zeroTolerance = 1e-6;
/**浮点数默认最大值*/
MathUtils3D.MaxValue = 3.40282347e+38;
/**浮点数默认最小值*/
MathUtils3D.MinValue = -3.40282347e+38;
