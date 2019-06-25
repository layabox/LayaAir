/**
 * 用于UV转换的工具类
 * @private
 */
export declare class UVTools {
    constructor();
    /**
     * 将相对于大图图集的小UV转换成相对某个大图的UV
     * @param	bigUV 某个大图的UV
     * @param	smallUV 大图图集中的UV
     * @return 相对于某个大图的UV
     */
    static getRelativeUV(bigUV: ArrayLike<number>, smallUV: any[], rst?: any[]): any[];
    /**
     * 将相对于某个大图的UV转换成相对于大图图集的UV
     * @param	bigUV 某个大图的UV
     * @param	smallUV 相对于某个大图的UV
     * @return 相对于大图图集的UV
     */
    static getAbsoluteUV(bigUV: ArrayLike<number>, smallUV: any[], rst?: any[]): any[];
}
