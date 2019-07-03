import { IClone } from "../../IClone";
/**
 * <code>GradientDataNumber</code> 类用于创建浮点渐变。
 */
export declare class GradientDataNumber implements IClone {
    private _currentLength;
    /**渐变浮点数量。*/
    readonly gradientCount: number;
    /**
     * 创建一个 <code>GradientDataNumber</code> 实例。
     */
    constructor();
    /**
     * 增加浮点渐变。
     * @param	key 生命周期，范围为0到1。
     * @param	value 浮点值。
     */
    add(key: number, value: number): void;
    /**
     * 通过索引获取键。
     * @param	index 索引。
     * @return	value 键。
     */
    getKeyByIndex(index: number): number;
    /**
     * 通过索引获取值。
     * @param	index 索引。
     * @return	value 值。
     */
    getValueByIndex(index: number): number;
    /**
     * 获取平均值。
     */
    getAverageValue(): number;
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
