import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../IClone";
import { Vector3 } from "../../../math/Vector3";
/**
 * <code>GradientVelocity</code> 类用于创建渐变速度。
 */
export declare class GradientVelocity implements IClone {
    /**
     * 通过固定速度创建一个 <code>GradientVelocity</code> 实例。
     * @param	constant 固定速度。
     * @return 渐变速度。
     */
    static createByConstant(constant: Vector3): GradientVelocity;
    /**
     * 通过渐变速度创建一个 <code>GradientVelocity</code> 实例。
     * @param	gradientX 渐变速度X。
     * @param	gradientY 渐变速度Y。
     * @param	gradientZ 渐变速度Z。
     * @return  渐变速度。
     */
    static createByGradient(gradientX: GradientDataNumber, gradientY: GradientDataNumber, gradientZ: GradientDataNumber): GradientVelocity;
    /**
     * 通过随机双固定速度创建一个 <code>GradientVelocity</code> 实例。
     * @param	constantMin 最小固定角速度。
     * @param	constantMax 最大固定角速度。
     * @return 渐变速度。
     */
    static createByRandomTwoConstant(constantMin: Vector3, constantMax: Vector3): GradientVelocity;
    /**
     * 通过随机双渐变速度创建一个 <code>GradientVelocity</code> 实例。
     * @param	gradientXMin X轴最小渐变速度。
     * @param	gradientXMax X轴最大渐变速度。
     * @param	gradientYMin Y轴最小渐变速度。
     * @param	gradientYMax Y轴最大渐变速度。
     * @param	gradientZMin Z轴最小渐变速度。
     * @param	gradientZMax Z轴最大渐变速度。
     * @return  渐变速度。
     */
    static createByRandomTwoGradient(gradientXMin: GradientDataNumber, gradientXMax: GradientDataNumber, gradientYMin: GradientDataNumber, gradientYMax: GradientDataNumber, gradientZMin: GradientDataNumber, gradientZMax: GradientDataNumber): GradientVelocity;
    private _type;
    private _constant;
    private _gradientX;
    private _gradientY;
    private _gradientZ;
    private _constantMin;
    private _constantMax;
    private _gradientXMin;
    private _gradientXMax;
    private _gradientYMin;
    private _gradientYMax;
    private _gradientZMin;
    private _gradientZMax;
    /**
     *生命周期速度类型，0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
     */
    readonly type: number;
    /**固定速度。*/
    readonly constant: Vector3;
    /**
     * 渐变速度X。
     */
    readonly gradientX: GradientDataNumber;
    /**
     * 渐变速度Y。
     */
    readonly gradientY: GradientDataNumber;
    /**
     *渐变速度Z。
     */
    readonly gradientZ: GradientDataNumber;
    /**最小固定速度。*/
    readonly constantMin: Vector3;
    /**最大固定速度。*/
    readonly constantMax: Vector3;
    /**
     * 渐变最小速度X。
     */
    readonly gradientXMin: GradientDataNumber;
    /**
     * 渐变最大速度X。
     */
    readonly gradientXMax: GradientDataNumber;
    /**
     * 渐变最小速度Y。
     */
    readonly gradientYMin: GradientDataNumber;
    /**
     *渐变最大速度Y。
     */
    readonly gradientYMax: GradientDataNumber;
    /**
     * 渐变最小速度Z。
     */
    readonly gradientZMin: GradientDataNumber;
    /**
     * 渐变最大速度Z。
     */
    readonly gradientZMax: GradientDataNumber;
    /**
     * 创建一个 <code>GradientVelocity,不允许new，请使用静态创建函数。</code> 实例。
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
