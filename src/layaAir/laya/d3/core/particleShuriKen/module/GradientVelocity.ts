import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../../../utils/IClone"
import { Vector3 } from "../../../../maths/Vector3";

/**
 * @en The `GradientVelocity` class is used to create gradient velocities.
 * @zh `GradientVelocity` 类用于创建渐变速度。
 */
export class GradientVelocity implements IClone {
	/**
	 * @en Create a `GradientVelocity` instance with constant velocity.
	 * @param constant The constant velocity.
	 * @returns The gradient velocity instance.
	 * @zh 通过固定速度创建一个 `GradientVelocity` 实例。
	 * @param constant 固定速度。
	 * @returns 渐变速度实例。
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
	 * @en Create a `GradientVelocity` instance with gradient velocities.
	 * @param gradientX Gradient velocity for X axis.
	 * @param gradientY Gradient velocity for Y axis.
	 * @param gradientZ Gradient velocity for Z axis.
	 * @returns The gradient velocity instance.
	 * @zh 通过渐变速度创建一个 `GradientVelocity` 实例。
	 * @param gradientX 渐变速度X。
	 * @param gradientY 渐变速度Y。
	 * @param gradientZ 渐变速度Z。
	 * @returns 渐变速度实例。
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
	 * @en Create a `GradientVelocity` instance with random two constant velocities.
	 * @param constantMin The minimum constant velocity.
	 * @param constantMax The maximum constant velocity.
	 * @returns The gradient velocity instance.
	 * @zh 通过随机双固定速度创建一个 `GradientVelocity` 实例。
	 * @param constantMin 最小固定速度。
	 * @param constantMax 最大固定速度。
	 * @returns 渐变速度实例。
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
	 * @en Create a `GradientVelocity` instance with random two gradient velocities.
	 * @param gradientXMin Minimum gradient velocity for X axis.
	 * @param gradientXMax Maximum gradient velocity for X axis.
	 * @param gradientYMin Minimum gradient velocity for Y axis.
	 * @param gradientYMax Maximum gradient velocity for Y axis.
	 * @param gradientZMin Minimum gradient velocity for Z axis.
	 * @param gradientZMax Maximum gradient velocity for Z axis.
	 * @returns The gradient velocity instance.
	 * @zh 通过随机双渐变速度创建一个 `GradientVelocity` 实例。
	 * @param gradientXMin X轴最小渐变速度。
	 * @param gradientXMax X轴最大渐变速度。
	 * @param gradientYMin Y轴最小渐变速度。
	 * @param gradientYMax Y轴最大渐变速度。
	 * @param gradientZMin Z轴最小渐变速度。
	 * @param gradientZMax Z轴最大渐变速度。
	 * @returns 渐变速度实例。
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
	/**
	 * @en The constant velocity.
	 * @zh 固定速度。
	 */
	public get _constant(): Vector3 {
		return this.__constant;
	}
	public set _constant(value: Vector3) {
		this.__constant = value;
		this._gradientConstantX = GradientDataNumber.createConstantData(value.x);
		this._gradientConstantY = GradientDataNumber.createConstantData(value.y);
		this._gradientConstantZ = GradientDataNumber.createConstantData(value.z);
	}


	private __constantMin: Vector3 = null;
	/**
	 * @en The minimum constant velocity.
	 * @zh 最小固定速度。
	 */
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
	/**
	 * @en The maximum constant velocity.
	 * @zh 最大固定速度。
	 */
	public get _constantMax(): Vector3 {
		return this.__constantMax;
	}
	public set _constantMax(value: Vector3) {
		this.__constantMax = value;
		this._gradientConstantXMax = GradientDataNumber.createConstantData(value.x);
		this._gradientConstantYMax = GradientDataNumber.createConstantData(value.y);
		this._gradientConstantZMax = GradientDataNumber.createConstantData(value.z);
	}

	private _gradientConstantX: GradientDataNumber = null;
	private _gradientConstantY: GradientDataNumber = null;
	private _gradientConstantZ: GradientDataNumber = null;

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
	 * @en The lifecycle velocity type. 0: constant mode, 1: curve mode, 2: random double constant mode, 3: random double curve mode.
	 * @zh 生命周期速度类型。0：常量模式，1：曲线模式，2：随机双常量模式，3：随机双曲线模式。
	 */
	get type(): number {
		return this._type;
	}

	/**
	 * @en The constant velocity.
	 * @zh 固定速度。
	 */
	get constant(): Vector3 {
		return this._constant;
	}

	/**
	 * @en The gradient velocity for X axis.
	 * @zh X轴渐变速度。
	 */
	get gradientX(): GradientDataNumber {
		return this._gradientX;
	}

	/**
	 * @en The gradient velocity for Y axis.
	 * @zh Y轴渐变速度。
	 */
	get gradientY(): GradientDataNumber {
		return this._gradientY;
	}

	/**
	 * @en The gradient velocity for Z axis.
	 * @zh Z轴渐变速度。
	 */
	get gradientZ(): GradientDataNumber {
		return this._gradientZ;
	}

	/**
	 * @en The minimum constant velocity.
	 * @zh 最小固定速度。
	 */
	get constantMin(): Vector3 {
		return this._constantMin;
	}

	/**
	 * @en The maximum constant velocity.
	 * @zh 最大固定速度。
	 */
	get constantMax(): Vector3 {
		return this._constantMax;
	}


	/**
	 *@internal
	 */
	get gradientConstantX(): GradientDataNumber {
		return this._gradientConstantX;
	}

	/**
	 * @internal
	 */
	get gradientConstantY(): GradientDataNumber {
		return this._gradientConstantY;
	}

	/**
	 * @internal
	 */
	get gradientConstantZ(): GradientDataNumber {
		return this._gradientConstantZ;
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
	 * @en The minimum gradient velocity for X axis.
	 * @zh X轴最小渐变速度。
	 */
	get gradientXMin(): GradientDataNumber {
		return this._gradientXMin;
	}

	/**
	 * @en The maximum gradient velocity for X axis.
	 * @zh X轴最大渐变速度。
	 */
	get gradientXMax(): GradientDataNumber {
		return this._gradientXMax;
	}

	/**
	 * @en The minimum gradient velocity for Y axis.
	 * @zh Y轴最小渐变速度。
	 */
	get gradientYMin(): GradientDataNumber {
		return this._gradientYMin;
	}

	/**
	 * @en The maximum gradient velocity for Y axis.
	 * @zh Y轴最大渐变速度。
	 */
	get gradientYMax(): GradientDataNumber {
		return this._gradientYMax;
	}

	/**
	 * @en The minimum gradient velocity for Z axis.
	 * @zh Z轴最小渐变速度。
	 */
	get gradientZMin(): GradientDataNumber {
		return this._gradientZMin;
	}

	/**
	 * @en The maximum gradient velocity for Z axis.
	 * @zh Z轴最大渐变速度。
	 */
	get gradientZMax(): GradientDataNumber {
		return this._gradientZMax;
	}

	/**
	 * @ignore
	 * @en Constructor, not allowed to use "new", please use the static creation function.
	 * @zh 构造方法。不允许new，请使用静态创建函数。
	 */
	constructor() {

	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
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
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destGradientVelocity: GradientVelocity = new GradientVelocity();
		this.cloneTo(destGradientVelocity);
		return destGradientVelocity;
	}

}


