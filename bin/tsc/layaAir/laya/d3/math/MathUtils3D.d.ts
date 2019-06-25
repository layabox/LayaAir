/**
     * <code>MathUtils</code> 类用于创建数学工具。
     */
export declare class MathUtils3D {
    /**单精度浮点(float)零的容差*/
    static zeroTolerance: number;
    /**浮点数默认最大值*/
    static MaxValue: number;
    /**浮点数默认最小值*/
    static MinValue: number;
    /**
     * 创建一个 <code>MathUtils</code> 实例。
     */
    constructor();
    /**
     * 是否在容差的范围内近似于0
     * @param  判断值
     * @return  是否近似于0
     */
    static isZero(v: number): boolean;
    /**
     * 两个值是否在容差的范围内近似相等Sqr Magnitude
     * @param  判断值
     * @return  是否近似于0
     */
    static nearEqual(n1: number, n2: number): boolean;
    static fastInvSqrt(value: number): number;
}
