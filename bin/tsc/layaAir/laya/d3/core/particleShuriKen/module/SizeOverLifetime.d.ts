import { GradientSize } from "./GradientSize";
import { IClone } from "../../IClone";
/**
 * <code>SizeOverLifetime</code> 类用于粒子的生命周期尺寸。
 */
export declare class SizeOverLifetime implements IClone {
    private _size;
    /**是否启用*/
    enbale: boolean;
    /**
     *获取尺寸。
     */
    readonly size: GradientSize;
    /**
     * 创建一个 <code>SizeOverLifetime</code> 实例。
     */
    constructor(size: GradientSize);
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
