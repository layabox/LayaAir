import { Gradient } from "../../Gradient";
import { IClone } from "../../IClone";
import { Vector4 } from "../../../math/Vector4";
/**
 * <code>GradientColor</code> 类用于创建渐变颜色。
 */
export declare class GradientColor implements IClone {
    /**
     * 通过固定颜色创建一个 <code>GradientColor</code> 实例。
     * @param constant 固定颜色。
     */
    static createByConstant(constant: Vector4): GradientColor;
    /**
     * 通过渐变颜色创建一个 <code>GradientColor</code> 实例。
     * @param gradient 渐变色。
     */
    static createByGradient(gradient: Gradient): GradientColor;
    /**
     * 通过随机双固定颜色创建一个 <code>GradientColor</code> 实例。
     * @param minConstant 最小固定颜色。
     * @param maxConstant 最大固定颜色。
     */
    static createByRandomTwoConstant(minConstant: Vector4, maxConstant: Vector4): GradientColor;
    /**
     * 通过随机双渐变颜色创建一个 <code>GradientColor</code> 实例。
     * @param minGradient 最小渐变颜色。
     * @param maxGradient 最大渐变颜色。
     */
    static createByRandomTwoGradient(minGradient: Gradient, maxGradient: Gradient): GradientColor;
    private _type;
    private _constant;
    private _constantMin;
    private _constantMax;
    private _gradient;
    private _gradientMin;
    private _gradientMax;
    /**
     *生命周期颜色类型,0为固定颜色模式,1渐变模式,2为随机双固定颜色模式,3随机双渐变模式。
     */
    readonly type: number;
    /**
     * 固定颜色。
     */
    readonly constant: Vector4;
    /**
     * 最小固定颜色。
     */
    readonly constantMin: Vector4;
    /**
     * 最大固定颜色。
     */
    readonly constantMax: Vector4;
    /**
     * 渐变颜色。
     */
    readonly gradient: Gradient;
    /**
     * 最小渐变颜色。
     */
    readonly gradientMin: Gradient;
    /**
     * 最大渐变颜色。
     */
    readonly gradientMax: Gradient;
    /**
     * 创建一个 <code>GradientColor,不允许new，请使用静态创建函数。</code> 实例。
     */
    constructor();
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
