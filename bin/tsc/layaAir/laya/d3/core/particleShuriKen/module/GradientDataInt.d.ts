import { IClone } from "../../IClone";
/**
 * <code>GradientDataInt</code> 类用于创建整形渐变。
 */
export declare class GradientDataInt implements IClone {
    private _currentLength;
    /**整形渐变数量。*/
    readonly gradientCount: number;
    /**
     * 创建一个 <code>GradientDataInt</code> 实例。
     */
    constructor();
    /**
     * 增加整形渐变。
     * @param	key 生命周期，范围为0到1。
     * @param	value 整形值。
     */
    add(key: number, value: number): void;
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
