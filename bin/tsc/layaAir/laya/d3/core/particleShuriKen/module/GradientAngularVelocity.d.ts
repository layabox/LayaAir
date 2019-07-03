import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../IClone";
import { Vector3 } from "../../../math/Vector3";
/**
 * <code>GradientRotation</code> 类用于创建渐变角速度。
 */
export declare class GradientAngularVelocity implements IClone {
    /**
     * 通过固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	constant 固定角速度。
     * @return 渐变角速度。
     */
    static createByConstant(constant: number): GradientAngularVelocity;
    /**
     * 通过分轴固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	separateConstant 分轴固定角速度。
     * @return 渐变角速度。
     */
    static createByConstantSeparate(separateConstant: Vector3): GradientAngularVelocity;
    /**
     * 通过渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	gradient 渐变角速度。
     * @return 渐变角速度。
     */
    static createByGradient(gradient: GradientDataNumber): GradientAngularVelocity;
    /**
     * 通过分轴渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	gradientX X轴渐变角速度。
     * @param	gradientY Y轴渐变角速度。
     * @param	gradientZ Z轴渐变角速度。
     * @return  渐变角速度。
     */
    static createByGradientSeparate(gradientX: GradientDataNumber, gradientY: GradientDataNumber, gradientZ: GradientDataNumber): GradientAngularVelocity;
    /**
     * 通过随机双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	constantMin 最小固定角速度。
     * @param	constantMax 最大固定角速度。
     * @return 渐变角速度。
     */
    static createByRandomTwoConstant(constantMin: number, constantMax: number): GradientAngularVelocity;
    /**
     * 通过随机分轴双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	separateConstantMin  最小分轴固定角速度。
     * @param	separateConstantMax  最大分轴固定角速度。
     * @return  渐变角速度。
     */
    static createByRandomTwoConstantSeparate(separateConstantMin: Vector3, separateConstantMax: Vector3): GradientAngularVelocity;
    /**
     * 通过随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	gradientMin 最小渐变角速度。
     * @param	gradientMax 最大渐变角速度。
     * @return  渐变角速度。
     */
    static createByRandomTwoGradient(gradientMin: GradientDataNumber, gradientMax: GradientDataNumber): GradientAngularVelocity;
    /**
     * 通过分轴随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	gradientXMin  最小X轴渐变角速度。
     * @param	gradientXMax  最大X轴渐变角速度。
     * @param	gradientYMin  最小Y轴渐变角速度。
     * @param	gradientYMax  最大Y轴渐变角速度。
     * @param	gradientZMin  最小Z轴渐变角速度。
     * @param	gradientZMax  最大Z轴渐变角速度。
     * @return  渐变角速度。
     */
    static createByRandomTwoGradientSeparate(gradientXMin: GradientDataNumber, gradientXMax: GradientDataNumber, gradientYMin: GradientDataNumber, gradientYMax: GradientDataNumber, gradientZMin: GradientDataNumber, gradientZMax: GradientDataNumber, gradientWMin: GradientDataNumber, gradientWMax: GradientDataNumber): GradientAngularVelocity;
    private _type;
    private _separateAxes;
    private _constant;
    private _constantSeparate;
    private _gradient;
    private _gradientX;
    private _gradientY;
    private _gradientZ;
    private _gradientW;
    private _constantMin;
    private _constantMax;
    private _constantMinSeparate;
    private _constantMaxSeparate;
    private _gradientMin;
    private _gradientMax;
    private _gradientXMin;
    private _gradientXMax;
    private _gradientYMin;
    private _gradientYMax;
    private _gradientZMin;
    private _gradientZMax;
    private _gradientWMin;
    private _gradientWMax;
    /**
     *生命周期角速度类型,0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
     */
    readonly type: number;
    /**
     *是否分轴。
     */
    readonly separateAxes: boolean;
    /**
     * 固定角速度。
     */
    readonly constant: number;
    /**
     * 分轴固定角速度。
     */
    readonly constantSeparate: Vector3;
    /**
     * 渐变角速度。
     */
    readonly gradient: GradientDataNumber;
    /**
     * 渐变角角速度X。
     */
    readonly gradientX: GradientDataNumber;
    /**
     * 渐变角速度Y。
     */
    readonly gradientY: GradientDataNumber;
    /**
     *渐变角速度Z。
     */
    readonly gradientZ: GradientDataNumber;
    /**
     *渐变角速度Z。
     */
    readonly gradientW: GradientDataNumber;
    /**
     * 最小随机双固定角速度。
     */
    readonly constantMin: number;
    /**
     * 最大随机双固定角速度。
     */
    readonly constantMax: number;
    /**
     * 最小分轴随机双固定角速度。
     */
    readonly constantMinSeparate: Vector3;
    /**
     * 最大分轴随机双固定角速度。
     */
    readonly constantMaxSeparate: Vector3;
    /**
     *最小渐变角速度。
     */
    readonly gradientMin: GradientDataNumber;
    /**
     * 最大渐变角速度。
     */
    readonly gradientMax: GradientDataNumber;
    /**
     * 最小渐变角速度X。
     */
    readonly gradientXMin: GradientDataNumber;
    /**
     * 最大渐变角速度X。
     */
    readonly gradientXMax: GradientDataNumber;
    /**
     * 最小渐变角速度Y。
     */
    readonly gradientYMin: GradientDataNumber;
    /**
     *最大渐变角速度Y。
     */
    readonly gradientYMax: GradientDataNumber;
    /**
     * 最小渐变角速度Z。
     */
    readonly gradientZMin: GradientDataNumber;
    /**
     * 最大渐变角速度Z。
     */
    readonly gradientZMax: GradientDataNumber;
    /**
     * 最小渐变角速度Z。
     */
    readonly gradientWMin: GradientDataNumber;
    /**
     * 最大渐变角速度Z。
     */
    readonly gradientWMax: GradientDataNumber;
    /**
     * 创建一个 <code>GradientAngularVelocity,不允许new，请使用静态创建函数。</code> 实例。
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
