import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../IClone"
import { Vector3 } from "../../../math/Vector3"


/**
 * <code>GradientRotation</code> 类用于创建渐变角速度。
 */
export class GradientAngularVelocity implements IClone {
	/**
	 * 通过固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
	 * @param	constant 固定角速度。
	 * @return 渐变角速度。
	 */
	static createByConstant(constant: number): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 0;
		gradientAngularVelocity._separateAxes = false;
		gradientAngularVelocity._constant = constant;
		return gradientAngularVelocity;
	}

	/**
	 * 通过分轴固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
	 * @param	separateConstant 分轴固定角速度。
	 * @return 渐变角速度。
	 */
	static createByConstantSeparate(separateConstant: Vector3): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 0;
		gradientAngularVelocity._separateAxes = true;
		gradientAngularVelocity._constantSeparate = separateConstant;
		return gradientAngularVelocity;
	}

	/**
	 * 通过渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
	 * @param	gradient 渐变角速度。
	 * @return 渐变角速度。
	 */
	static createByGradient(gradient: GradientDataNumber): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 1;
		gradientAngularVelocity._separateAxes = false;
		gradientAngularVelocity._gradient = gradient;
		return gradientAngularVelocity;
	}

	/**
	 * 通过分轴渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
	 * @param	gradientX X轴渐变角速度。
	 * @param	gradientY Y轴渐变角速度。
	 * @param	gradientZ Z轴渐变角速度。
	 * @return  渐变角速度。
	 */
	static createByGradientSeparate(gradientX: GradientDataNumber, gradientY: GradientDataNumber, gradientZ: GradientDataNumber): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 1;
		gradientAngularVelocity._separateAxes = true;
		gradientAngularVelocity._gradientX = gradientX;
		gradientAngularVelocity._gradientY = gradientY;
		gradientAngularVelocity._gradientZ = gradientZ;
		return gradientAngularVelocity;
	}

	/**
	 * 通过随机双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
	 * @param	constantMin 最小固定角速度。
	 * @param	constantMax 最大固定角速度。
	 * @return 渐变角速度。
	 */
	static createByRandomTwoConstant(constantMin: number, constantMax: number): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 2;
		gradientAngularVelocity._separateAxes = false;
		gradientAngularVelocity._constantMin = constantMin;
		gradientAngularVelocity._constantMax = constantMax;
		return gradientAngularVelocity;
	}

	/**
	 * 通过随机分轴双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
	 * @param	separateConstantMin  最小分轴固定角速度。
	 * @param	separateConstantMax  最大分轴固定角速度。
	 * @return  渐变角速度。
	 */
	static createByRandomTwoConstantSeparate(separateConstantMin: Vector3, separateConstantMax: Vector3): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 2;
		gradientAngularVelocity._separateAxes = true;
		gradientAngularVelocity._constantMinSeparate = separateConstantMin;
		gradientAngularVelocity._constantMaxSeparate = separateConstantMax;
		return gradientAngularVelocity;
	}

	/**
	 * 通过随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
	 * @param	gradientMin 最小渐变角速度。
	 * @param	gradientMax 最大渐变角速度。
	 * @return  渐变角速度。
	 */
	static createByRandomTwoGradient(gradientMin: GradientDataNumber, gradientMax: GradientDataNumber): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 3;
		gradientAngularVelocity._separateAxes = false;
		gradientAngularVelocity._gradientMin = gradientMin;
		gradientAngularVelocity._gradientMax = gradientMax;
		return gradientAngularVelocity;
	}

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
	static createByRandomTwoGradientSeparate(gradientXMin: GradientDataNumber, gradientXMax: GradientDataNumber, gradientYMin: GradientDataNumber, gradientYMax: GradientDataNumber, gradientZMin: GradientDataNumber, gradientZMax: GradientDataNumber, gradientWMin: GradientDataNumber, gradientWMax: GradientDataNumber): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 3;
		gradientAngularVelocity._separateAxes = true;
		gradientAngularVelocity._gradientXMin = gradientXMin;
		gradientAngularVelocity._gradientXMax = gradientXMax;
		gradientAngularVelocity._gradientYMin = gradientYMin;
		gradientAngularVelocity._gradientYMax = gradientYMax;
		gradientAngularVelocity._gradientZMin = gradientZMin;
		gradientAngularVelocity._gradientZMax = gradientZMax;
		gradientAngularVelocity._gradientWMin = gradientWMin;
		gradientAngularVelocity._gradientWMax = gradientWMax;
		return gradientAngularVelocity;
	}

	private _type: number = 0;
	private _separateAxes: boolean = false;

	private _constant: number = 0;
	private _constantSeparate: Vector3 = null;

	private _gradient: GradientDataNumber = null;
	private _gradientX: GradientDataNumber = null;
	private _gradientY: GradientDataNumber = null;
	private _gradientZ: GradientDataNumber = null;
	private _gradientW: GradientDataNumber = null;

	private _constantMin: number = 0;
	private _constantMax: number = 0;
	private _constantMinSeparate: Vector3 = null;
	private _constantMaxSeparate: Vector3 = null;

	private _gradientMin: GradientDataNumber = null;
	private _gradientMax: GradientDataNumber = null;
	private _gradientXMin: GradientDataNumber = null;
	private _gradientXMax: GradientDataNumber = null;
	private _gradientYMin: GradientDataNumber = null;
	private _gradientYMax: GradientDataNumber = null;
	private _gradientZMin: GradientDataNumber = null;
	private _gradientZMax: GradientDataNumber = null;
	private _gradientWMin: GradientDataNumber = null;
	private _gradientWMax: GradientDataNumber = null;

	/**
	 *生命周期角速度类型,0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
	 */
	get type(): number {
		return this._type;
	}

	/**
	 *是否分轴。
	 */
	get separateAxes(): boolean {
		return this._separateAxes;
	}

	/**
	 * 固定角速度。
	 */
	get constant(): number {
		return this._constant;
	}

	/**
	 * 分轴固定角速度。
	 */
	get constantSeparate(): Vector3 {
		return this._constantSeparate;
	}

	/**
	 * 渐变角速度。
	 */
	get gradient(): GradientDataNumber {
		return this._gradient;
	}

	/**
	 * 渐变角角速度X。
	 */
	get gradientX(): GradientDataNumber {
		return this._gradientX;
	}

	/**
	 * 渐变角速度Y。
	 */
	get gradientY(): GradientDataNumber {
		return this._gradientY;
	}

	/**
	 *渐变角速度Z。
	 */
	get gradientZ(): GradientDataNumber {
		return this._gradientZ;
	}

	/**
	 *渐变角速度Z。
	 */
	get gradientW(): GradientDataNumber {
		return this._gradientW;
	}

	/**
	 * 最小随机双固定角速度。
	 */
	get constantMin(): number {
		return this._constantMin;
	}

	/**
	 * 最大随机双固定角速度。
	 */
	get constantMax(): number {
		return this._constantMax;
	}

	/**
	 * 最小分轴随机双固定角速度。
	 */
	get constantMinSeparate(): Vector3 {
		return this._constantMinSeparate;
	}

	/**
	 * 最大分轴随机双固定角速度。
	 */
	get constantMaxSeparate(): Vector3 {
		return this._constantMaxSeparate;
	}

	/**
	 *最小渐变角速度。
	 */
	get gradientMin(): GradientDataNumber {
		return this._gradientMin;
	}

	/**
	 * 最大渐变角速度。
	 */
	get gradientMax(): GradientDataNumber {
		return this._gradientMax;
	}

	/**
	 * 最小渐变角速度X。
	 */
	get gradientXMin(): GradientDataNumber {
		return this._gradientXMin;
	}

	/**
	 * 最大渐变角速度X。
	 */
	get gradientXMax(): GradientDataNumber {
		return this._gradientXMax;
	}

	/**
	 * 最小渐变角速度Y。
	 */
	get gradientYMin(): GradientDataNumber {
		return this._gradientYMin;
	}

	/**
	 *最大渐变角速度Y。
	 */
	get gradientYMax(): GradientDataNumber {
		return this._gradientYMax;
	}

	/**
	 * 最小渐变角速度Z。
	 */
	get gradientZMin(): GradientDataNumber {
		return this._gradientZMin;
	}

	/**
	 * 最大渐变角速度Z。
	 */
	get gradientZMax(): GradientDataNumber {
		return this._gradientZMax;
	}

	/**
	 * 最小渐变角速度Z。
	 */
	get gradientWMin(): GradientDataNumber {
		return this._gradientWMin;
	}

	/**
	 * 最大渐变角速度Z。
	 */
	get gradientWMax(): GradientDataNumber {
		return this._gradientWMax;
	}

	/**
	 * 创建一个 <code>GradientAngularVelocity,不允许new，请使用静态创建函数。</code> 实例。
	 */
	constructor() {

	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destGradientAngularVelocity: GradientAngularVelocity = (<GradientAngularVelocity>destObject);
		destGradientAngularVelocity._type = this._type;
		destGradientAngularVelocity._separateAxes = this._separateAxes;
		destGradientAngularVelocity._constant = this._constant;
		this._constantSeparate.cloneTo(destGradientAngularVelocity._constantSeparate);
		this._gradient.cloneTo(destGradientAngularVelocity._gradient);
		this._gradientX.cloneTo(destGradientAngularVelocity._gradientX);
		this._gradientY.cloneTo(destGradientAngularVelocity._gradientY);
		this._gradientZ.cloneTo(destGradientAngularVelocity._gradientZ);
		destGradientAngularVelocity._constantMin = this._constantMin;
		destGradientAngularVelocity._constantMax = this._constantMax;
		this._constantMinSeparate.cloneTo(destGradientAngularVelocity._constantMinSeparate);
		this._constantMaxSeparate.cloneTo(destGradientAngularVelocity._constantMaxSeparate);
		this._gradientMin.cloneTo(destGradientAngularVelocity._gradientMin);
		this._gradientMax.cloneTo(destGradientAngularVelocity._gradientMax);
		this._gradientXMin.cloneTo(destGradientAngularVelocity._gradientXMin);
		this._gradientXMax.cloneTo(destGradientAngularVelocity._gradientXMax);
		this._gradientYMin.cloneTo(destGradientAngularVelocity._gradientYMin);
		this._gradientYMax.cloneTo(destGradientAngularVelocity._gradientYMax);
		this._gradientZMin.cloneTo(destGradientAngularVelocity._gradientZMin);
		this._gradientZMax.cloneTo(destGradientAngularVelocity._gradientZMax);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destGradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		this.cloneTo(destGradientAngularVelocity);
		return destGradientAngularVelocity;
	}

}


