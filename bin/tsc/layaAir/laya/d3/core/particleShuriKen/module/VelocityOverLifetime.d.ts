import { GradientVelocity } from "./GradientVelocity";
import { IClone } from "../../IClone";
/**
 * <code>VelocityOverLifetime</code> 类用于粒子的生命周期速度。
 */
export declare class VelocityOverLifetime implements IClone {
    /**是否启用*/
    enbale: boolean;
    /**速度空间,0为local,1为world。*/
    space: number;
    /**
     *获取尺寸。
     */
    readonly velocity: GradientVelocity;
    /**
     * 创建一个 <code>VelocityOverLifetime</code> 实例。
     */
    constructor(velocity: GradientVelocity);
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
