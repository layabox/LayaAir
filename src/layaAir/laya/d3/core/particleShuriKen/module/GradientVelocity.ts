import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../IClone"
import { Vector3 } from "../../../math/Vector3"

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
	private _constant: Vector3 = null;

	
	private _gradientX: GradientDataNumber = null;
	private _gradientY: GradientDataNumber = null;
	private _gradientZ: GradientDataNumber = null;

	
	private _constantMin: Vector3 = null;
	private _constantMax: Vector3 = null;

	
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


