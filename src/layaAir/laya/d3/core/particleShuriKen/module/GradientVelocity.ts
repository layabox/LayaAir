import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../../../utils/IClone"
import { Vector3 } from "../../../../maths/Vector3";

/**
 * <code>GradientVelocity</code> 类用于创建渐变速度。
 */
export class GradientVelocity implements IClone {
	/**
	 * 通过固定速度创建一个 <code>GradientVelocity</code> 实例。
	 * @param	constant 固定速度。
	 * @return 渐变速度。
	 */
	static createByConstant(constant: Vector3): GradientVelocity {
		var gradientVelocity: GradientVelocity = new GradientVelocity();
		gradientVelocity._type = 0;
		gradientVelocity._constant = constant;
		gradientVelocity._gradientConstantXMin = GradientDataNumber.createConstantData(constant.x);
		gradientVelocity._gradientConstantYMin = GradientDataNumber.createConstantData(constant.y);
		gradientVelocity._gradientConstantZMin = GradientDataNumber.createConstantData(constant.z);
		return gradientVelocity;
	}

	/**
	 * 通过渐变速度创建一个 <code>GradientVelocity</code> 实例。
	 * @param	gradientX 渐变速度X。
	 * @param	gradientY 渐变速度Y。
	 * @param	gradientZ 渐变速度Z。
	 * @return  渐变速度。
	 */
	static createByGradient(gradientX: GradientDataNumber, gradientY: GradientDataNumber, gradientZ: GradientDataNumber): GradientVelocity {
		var gradientVelocity: GradientVelocity = new GradientVelocity();
		gradientVelocity._type = 1;
		gradientVelocity._gradientX = gradientX;
		gradientVelocity._gradientY = gradientY;
		gradientVelocity._gradientZ = gradientZ;
		return gradientVelocity;
	}

	/**
	 * 通过随机双固定速度创建一个 <code>GradientVelocity</code> 实例。
	 * @param	constantMin 最小固定角速度。
	 * @param	constantMax 最大固定角速度。
	 * @return 渐变速度。
	 */
	static createByRandomTwoConstant(constantMin: Vector3, constantMax: Vector3): GradientVelocity {
		var gradientVelocity: GradientVelocity = new GradientVelocity();
		gradientVelocity._type = 2;
		gradientVelocity._constantMin = constantMin;
		gradientVelocity._constantMax = constantMax;


		gradientVelocity._gradientConstantXMin = GradientDataNumber.createConstantData(constantMin.x);
		gradientVelocity._gradientConstantXMax = GradientDataNumber.createConstantData(constantMax.x);
		gradientVelocity._gradientConstantYMin = GradientDataNumber.createConstantData(constantMin.y);
		gradientVelocity._gradientConstantYMax = GradientDataNumber.createConstantData(constantMax.y);
		gradientVelocity._gradientConstantZMin = GradientDataNumber.createConstantData(constantMin.z);
		gradientVelocity._gradientConstantZMax = GradientDataNumber.createConstantData(constantMax.z);
		return gradientVelocity;
	}

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
	static createByRandomTwoGradient(gradientXMin: GradientDataNumber, gradientXMax: GradientDataNumber, gradientYMin: GradientDataNumber, gradientYMax: GradientDataNumber, gradientZMin: GradientDataNumber, gradientZMax: GradientDataNumber): GradientVelocity {
		var gradientVelocity: GradientVelocity = new GradientVelocity();
		gradientVelocity._type = 3;
		gradientVelocity._gradientXMin = gradientXMin;
		gradientVelocity._gradientXMax = gradientXMax;
		gradientVelocity._gradientYMin = gradientYMin;
		gradientVelocity._gradientYMax = gradientYMax;
		gradientVelocity._gradientZMin = gradientZMin;
		gradientVelocity._gradientZMax = gradientZMax;
		return gradientVelocity;
	}

	private _type: number = 0;

	private __constant: Vector3 = null;
	public get _constant(): Vector3 {
		return this.__constant;
	}
	public set _constant(value: Vector3) {
		this.__constant = value;
		this._gradientConstantXMin = GradientDataNumber.createConstantData(value.x);
		this._gradientConstantYMin = GradientDataNumber.createConstantData(value.y);
		this._gradientConstantZMin = GradientDataNumber.createConstantData(value.z);
	}


	private __constantMin: Vector3 = null;
	public get _constantMin(): Vector3 {
		return this.__constantMin;
	}

	public set _constantMin(value: Vector3) {
		this.__constantMin = value;
		this._gradientConstantXMin = GradientDataNumber.createConstantData(value.x);
		this._gradientConstantYMin = GradientDataNumber.createConstantData(value.y);
		this._gradientConstantZMin = GradientDataNumber.createConstantData(value.z);
	}

	private __constantMax: Vector3 = null;
	public get _constantMax(): Vector3 {
		return this.__constantMax;
	}
	public set _constantMax(value: Vector3) {
		this.__constantMax = value;
		this._gradientConstantXMax = GradientDataNumber.createConstantData(value.x);
		this._gradientConstantYMax = GradientDataNumber.createConstantData(value.y);
		this._gradientConstantZMax = GradientDataNumber.createConstantData(value.z);
	}

	private _gradientConstantXMin: GradientDataNumber = null;
	private _gradientConstantXMax: GradientDataNumber = null;
	private _gradientConstantYMin: GradientDataNumber = null;
	private _gradientConstantYMax: GradientDataNumber = null;
	private _gradientConstantZMin: GradientDataNumber = null;
	private _gradientConstantZMax: GradientDataNumber = null;



	private _gradientX: GradientDataNumber = null;
	private _gradientY: GradientDataNumber = null;
	private _gradientZ: GradientDataNumber = null;


	private _gradientXMin: GradientDataNumber = null;
	private _gradientXMax: GradientDataNumber = null;
	private _gradientYMin: GradientDataNumber = null;
	private _gradientYMax: GradientDataNumber = null;
	private _gradientZMin: GradientDataNumber = null;
	private _gradientZMax: GradientDataNumber = null;

	/**
	 *生命周期速度类型，0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
	 */
	get type(): number {
		return this._type;
	}

	/**固定速度。*/
	get constant(): Vector3 {
		return this._constant;
	}

	/**
	 * 渐变速度X。
	 */
	get gradientX(): GradientDataNumber {
		return this._gradientX;
	}

	/**
	 * 渐变速度Y。
	 */
	get gradientY(): GradientDataNumber {
		return this._gradientY;
	}

	/**
	 *渐变速度Z。
	 */
	get gradientZ(): GradientDataNumber {
		return this._gradientZ;
	}

	/**最小固定速度。*/
	get constantMin(): Vector3 {
		return this._constantMin;
	}

	/**最大固定速度。*/
	get constantMax(): Vector3 {
		return this._constantMax;
	}

	/**
 *@internal
 */
	get gradientConstantXMin(): GradientDataNumber {
		return this._gradientConstantXMin;
	}

	/**
	 * @internal
	 */
	get gradientConstantXMax(): GradientDataNumber {
		return this._gradientConstantXMax;
	}

	/**
	 * @internal
	 */
	get gradientConstantYMin(): GradientDataNumber {
		return this._gradientConstantYMin;
	}

	/**
	 * @internal
	 */
	get gradientConstantYMax(): GradientDataNumber {
		return this._gradientConstantYMax;
	}

	/**
	 * @internal
	 */
	get gradientConstantZMin(): GradientDataNumber {
		return this._gradientConstantZMin;
	}

	/**
	 * @internal
	 */
	get gradientConstantZMax(): GradientDataNumber {
		return this._gradientConstantZMax;
	}

	/**
	 * 渐变最小速度X。
	 */
	get gradientXMin(): GradientDataNumber {
		return this._gradientXMin;
	}

	/**
	 * 渐变最大速度X。
	 */
	get gradientXMax(): GradientDataNumber {
		return this._gradientXMax;
	}

	/**
	 * 渐变最小速度Y。
	 */
	get gradientYMin(): GradientDataNumber {
		return this._gradientYMin;
	}

	/**
	 *渐变最大速度Y。
	 */
	get gradientYMax(): GradientDataNumber {
		return this._gradientYMax;
	}

	/**
	 * 渐变最小速度Z。
	 */
	get gradientZMin(): GradientDataNumber {
		return this._gradientZMin;
	}

	/**
	 * 渐变最大速度Z。
	 */
	get gradientZMax(): GradientDataNumber {
		return this._gradientZMax;
	}

	/**
	 * 创建一个 <code>GradientVelocity,不允许new，请使用静态创建函数。</code> 实例。
	 */
	constructor() {

	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destGradientVelocity: GradientVelocity = (<GradientVelocity>destObject);
		destGradientVelocity._type = this._type;
		this._constant.cloneTo(destGradientVelocity._constant);
		this._gradientX.cloneTo(destGradientVelocity._gradientX);
		this._gradientY.cloneTo(destGradientVelocity._gradientY);
		this._gradientZ.cloneTo(destGradientVelocity._gradientZ);
		this._constantMin.cloneTo(destGradientVelocity._constantMin);
		this._constantMax.cloneTo(destGradientVelocity._constantMax);
		this._gradientXMin.cloneTo(destGradientVelocity._gradientXMin);
		this._gradientXMax.cloneTo(destGradientVelocity._gradientXMax);
		this._gradientYMin.cloneTo(destGradientVelocity._gradientYMin);
		this._gradientYMax.cloneTo(destGradientVelocity._gradientYMax);
		this._gradientZMin.cloneTo(destGradientVelocity._gradientZMin);
		this._gradientZMax.cloneTo(destGradientVelocity._gradientZMax);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destGradientVelocity: GradientVelocity = new GradientVelocity();
		this.cloneTo(destGradientVelocity);
		return destGradientVelocity;
	}

}


