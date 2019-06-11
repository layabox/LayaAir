import { GradientAngularVelocity } from "././GradientAngularVelocity";
import { IClone } from "../../IClone";
/**
 * <code>RotationOverLifetime</code> 类用于粒子的生命周期旋转。
 */
export declare class RotationOverLifetime implements IClone {
    /**@private */
    private _angularVelocity;
    /**是否启用*/
    enbale: boolean;
    /**
     *获取角速度。
     */
    readonly angularVelocity: GradientAngularVelocity;
    /**
     * 创建一个 <code>RotationOverLifetime,不允许new，请使用静态创建函数。</code> 实例。
     */
    constructor(angularVelocity: GradientAngularVelocity);
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
