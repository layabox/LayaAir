import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../IClone";
import { Vector3 } from "../../../math/Vector3";
/**
 * <code>GradientSize</code> 类用于创建渐变尺寸。
 */
export declare class GradientSize implements IClone {
    /**
     * 通过渐变尺寸创建一个 <code>GradientSize</code> 实例。
     * @param	gradient 渐变尺寸。
     * @return  渐变尺寸。
     */
    static createByGradient(gradient: GradientDataNumber): GradientSize;
    /**
     * 通过分轴渐变尺寸创建一个 <code>GradientSize</code> 实例。
     * @param	gradientX 渐变尺寸X。
     * @param	gradientY 渐变尺寸Y。
     * @param	gradientZ 渐变尺寸Z。
     * @return  渐变尺寸。
     */
    static createByGradientSeparate(gradientX: GradientDataNumber, gradientY: GradientDataNumber, gradientZ: GradientDataNumber): GradientSize;
    /**
     * 通过随机双固定尺寸创建一个 <code>GradientSize</code> 实例。
     * @param	constantMin 最小固定尺寸。
     * @param	constantMax 最大固定尺寸。
     * @return 渐变尺寸。
     */
    static createByRandomTwoConstant(constantMin: number, constantMax: number): GradientSize;
    /**
     * 通过分轴随机双固定尺寸创建一个 <code>GradientSize</code> 实例。
     * @param	constantMinSeparate 分轴最小固定尺寸.
     * @param	constantMaxSeparate 分轴最大固定尺寸。
     * @return   渐变尺寸。
     */
    static createByRandomTwoConstantSeparate(constantMinSeparate: Vector3, constantMaxSeparate: Vector3): GradientSize;
    /**
     * 通过随机双渐变尺寸创建一个 <code>GradientSize</code> 实例。
     * @param	gradientMin 最小渐变尺寸。
     * @param	gradientMax 最大渐变尺寸。
     * @return 渐变尺寸。
     */
    static createByRandomTwoGradient(gradientMin: GradientDataNumber, gradientMax: GradientDataNumber): GradientSize;
    /**
     * 通过分轴随机双渐变尺寸创建一个 <code>GradientSize</code> 实例。
     * @param	gradientXMin X轴最小渐变尺寸。
     * @param	gradientXMax X轴最大渐变尺寸。
     * @param	gradientYMin Y轴最小渐变尺寸。
     * @param	gradientYMax Y轴最大渐变尺寸。
     * @param	gradientZMin Z轴最小渐变尺寸。
     * @param	gradientZMax Z轴最大渐变尺寸。
     * @return  渐变尺寸。
     */
    static createByRandomTwoGradientSeparate(gradientXMin: GradientDataNumber, gradientXMax: GradientDataNumber, gradientYMin: GradientDataNumber, gradientYMax: GradientDataNumber, gradientZMin: GradientDataNumber, gradientZMax: GradientDataNumber): GradientSize;
    private _type;
    private _separateAxes;
    private _gradient;
    private _gradientX;
    private _gradientY;
    private _gradientZ;
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
    /**
     *生命周期尺寸类型，0曲线模式，1随机双常量模式，2随机双曲线模式。
     */
    readonly type: number;
    /**
     *是否分轴。
     */
    readonly separateAxes: boolean;
    /**
     * 渐变尺寸。
     */
    readonly gradient: GradientDataNumber;
    /**
     * 渐变尺寸X。
     */
    readonly gradientX: GradientDataNumber;
    /**
     * 渐变尺寸Y。
     */
    readonly gradientY: GradientDataNumber;
    /**
     *渐变尺寸Z。
     */
    readonly gradientZ: GradientDataNumber;
    /**
     *最小随机双固定尺寸。
     */
    readonly constantMin: number;
    /**
     * 最大随机双固定尺寸。
     */
    readonly constantMax: number;
    /**
     * 最小分轴随机双固定尺寸。
     */
    readonly constantMinSeparate: Vector3;
    /**
     *  最小分轴随机双固定尺寸。
     */
    readonly constantMaxSeparate: Vector3;
    /**
     *渐变最小尺寸。
     */
    readonly gradientMin: GradientDataNumber;
    /**
     * 渐变最大尺寸。
     */
    readonly gradientMax: GradientDataNumber;
    /**
     * 渐变最小尺寸X。
     */
    readonly gradientXMin: GradientDataNumber;
    /**
     * 渐变最大尺寸X。
     */
    readonly gradientXMax: GradientDataNumber;
    /**
     * 渐变最小尺寸Y。
     */
    readonly gradientYMin: GradientDataNumber;
    /**
     *渐变最大尺寸Y。
     */
    readonly gradientYMax: GradientDataNumber;
    /**
     * 渐变最小尺寸Z。
     */
    readonly gradientZMin: GradientDataNumber;
    /**
     * 渐变最大尺寸Z。
     */
    readonly gradientZMax: GradientDataNumber;
    /**
     * 创建一个 <code>GradientSize,不允许new，请使用静态创建函数。</code> 实例。
     */
    constructor();
    /**
     * 获取最大尺寸。
     */
    getMaxSizeInGradient(): number;
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
