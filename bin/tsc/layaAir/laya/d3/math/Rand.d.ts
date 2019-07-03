/**
     * <code>Rand</code> 类用于通过32位无符号整型随机种子创建随机数。
     */
export declare class Rand {
    /**
     * 通过无符号32位整形，获取32位浮点随机数。
     * @param 无符号32位整形随机数。
     * @return 32位浮点随机数。
     */
    static getFloatFromInt(v: number): number;
    /**
     * 通过无符号32位整形，获取无符号8位字节随机数。
     * @param 无符号32位整形随机数。
     * @return 无符号8位字节随机数。
     */
    static getByteFromInt(v: number): number;
    /**获取随机种子。*/
    seeds: Uint32Array;
    /**
     * 获取随机种子。
     * @return 随机种子。
     */
    /**
    * 设置随机种子。
    * @param	seed 随机种子。
    */
    seed: number;
    /**
     * 创建一个 <code>Rand</code> 实例。
     * @param	seed  32位无符号整型随机种子。
     */
    constructor(seed: number);
    /**
     * 获取无符号32位整形随机数。
     * @return 无符号32位整形随机数。
     */
    getUint(): number;
    /**
     * 获取0到1之间的浮点随机数。
     * @return 0到1之间的浮点随机数。
     */
    getFloat(): number;
    /**
     * 获取-1到1之间的浮点随机数。
     * @return -1到1之间的浮点随机数。
     */
    getSignedFloat(): number;
}
