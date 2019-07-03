import { IClone } from "../../IClone";
/**
 * <code>Burst</code> 类用于粒子的爆裂描述。
 */
export declare class Burst implements IClone {
    /** 爆裂时间,单位为秒。*/
    private _time;
    /** 爆裂的最小数量。*/
    private _minCount;
    /** 爆裂的最大数量。*/
    private _maxCount;
    /**
     * 获取爆裂时间,单位为秒。
     * @return 爆裂时间,单位为秒。
     */
    readonly time: number;
    /**
     * 获取爆裂的最小数量。
     * @return 爆裂的最小数量。
     */
    readonly minCount: number;
    /**
     * 获取爆裂的最大数量。
     * @return 爆裂的最大数量。
     */
    readonly maxCount: number;
    /**
     * 创建一个 <code>Burst</code> 实例。
     * @param time 爆裂时间,单位为秒。
     * @param minCount 爆裂的最小数量。
     * @param time 爆裂的最大数量。
     */
    constructor(time: number, minCount: number, maxCount: number);
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
