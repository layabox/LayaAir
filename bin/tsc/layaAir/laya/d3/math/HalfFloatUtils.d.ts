/**
     * <code>HalfFloatUtils</code> 类用于创建HalfFloat工具。
     */
export declare class HalfFloatUtils {
    /**
     * round a number to a half float number bits.
     * @param {number} num
     */
    static roundToFloat16Bits(num: number): number;
    /**
     * convert a half float number bits to a number.
     * @param {number} float16bits - half float number bits
     */
    static convertToNumber(float16bits: number): number;
}
