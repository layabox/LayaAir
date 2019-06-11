/**
     * <code>HalfFloatUtils</code> 类用于创建HalfFloat工具。
     */
export declare class HalfFloatUtils {
    /**@private */
    private static _buffer;
    /**@private */
    private static _floatView;
    /**@private */
    private static _uint32View;
    /**@private */
    private static _baseTable;
    /**@private */
    private static _shiftTable;
    /**@private */
    private static _mantissaTable;
    /**@private */
    private static _exponentTable;
    /**@private */
    private static _offsetTable;
    /**
     * @private
     */
    static __init__(): void;
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
