import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../../../utils/IClone"
import { Vector3 } from "../../../../maths/Vector3";


/**
 * @en The GradientAngularVelocity class is used to create gradient angular velocities.
 * @zh GradientAngularVelocity 类用于创建渐变角速度。
 */
export class GradientAngularVelocity implements IClone {
	/**
	 * @en Create a `GradientAngularVelocity` instance with a constant angular velocity.
	 * @param constant The constant angular velocity.
	 * @return The gradient angular velocity.
	 * @zh 通过固定角速度创建一个 `GradientAngularVelocity` 实例。
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
	 * @en Create a `GradientAngularVelocity` instance with separate constant angular velocities for each axis.
	 * @param separateConstant The separate constant angular velocities for each axis.
	 * @return The gradient angular velocity instance.
	 * @zh 通过分轴固定角速度创建一个 `GradientAngularVelocity` 实例。
	 * @param separateConstant  分轴固定角速度。
	 * @return 渐变角速度实例。
	 */
	static createByConstantSeparate(separateConstant: Vector3): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 0;
		gradientAngularVelocity._separateAxes = true;
		gradientAngularVelocity._constantSeparate = separateConstant;
		return gradientAngularVelocity;
	}

	/**
	 * @en Create a `GradientAngularVelocity` instance with a gradient angular velocity.
	 * @param gradient The gradient angular velocity.
	 * @return The gradient angular velocity instance.
	 * @zh 通过渐变角速度创建一个 `GradientAngularVelocity` 实例。
	 * @param gradient 渐变角速度。
	 * @return 渐变角速度实例。
	 */
	static createByGradient(gradient: GradientDataNumber): GradientAngularVelocity {
		var gradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		gradientAngularVelocity._type = 1;
		gradientAngularVelocity._separateAxes = false;
		gradientAngularVelocity._gradient = gradient;
		return gradientAngularVelocity;
	}

	/**
	 * @en Create a `GradientAngularVelocity` instance with separate gradient angular velocities for each axis.
	 * @param gradientX The gradient angular velocity for the X-axis.
	 * @param gradientY The gradient angular velocity for the Y-axis.
	 * @param gradientZ The gradient angular velocity for the Z-axis.
	 * @returns The gradient angular velocity instance.
	 * @zh 通过分轴渐变角速度创建一个 `GradientAngularVelocity` 实例。
	 * @param gradientX X轴渐变角速度。
	 * @param gradientY Y轴渐变角速度。
	 * @param gradientZ Z轴渐变角速度。
	 * @returns 渐变角速度实例。
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
	 * @en Create a `GradientAngularVelocity` instance with random constant angular velocities between two values.
	 * @param constantMin The minimum constant angular velocity.
	 * @param constantMax The maximum constant angular velocity.
	 * @returns The gradient angular velocity instance.
	 * @zh 通过随机双固定角速度创建一个 `GradientAngularVelocity` 实例。
	 * @param constantMin 最小固定角速度。
	 * @param constantMax 最大固定角速度。
	 * @returns 渐变角速度实例。
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
	 * @en Create a `GradientAngularVelocity` instance with random separate constant angular velocities between two values for each axis.
	 * @param separateConstantMin The minimum separate constant angular velocities for each axis.
	 * @param separateConstantMax The maximum separate constant angular velocities for each axis.
	 * @returns The gradient angular velocity instance.
	 * @zh 通过随机分轴双固定角速度创建一个 `GradientAngularVelocity` 实例。
	 * @param separateConstantMin 最小分轴固定角速度。
	 * @param separateConstantMax 最大分轴固定角速度。
	 * @returns 渐变角速度实例。
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
	 * @en Create a `GradientAngularVelocity` instance with random gradient angular velocities between two gradients.
	 * @param gradientMin The minimum gradient angular velocity.
	 * @param gradientMax The maximum gradient angular velocity.
	 * @returns The gradient angular velocity instance.
	 * @zh 通过随机双渐变角速度创建一个 `GradientAngularVelocity` 实例。
	 * @param gradientMin 最小渐变角速度。
	 * @param gradientMax 最大渐变角速度。
	 * @returns 渐变角速度实例。
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
	 * @en Create a `GradientAngularVelocity` instance with random separate gradient angular velocities between two gradients for each axis.
	 * @param gradientXMin The minimum gradient angular velocity for the X-axis.
	 * @param gradientXMax The maximum gradient angular velocity for the X-axis.
	 * @param gradientYMin The minimum gradient angular velocity for the Y-axis.
	 * @param gradientYMax The maximum gradient angular velocity for the Y-axis.
	 * @param gradientZMin The minimum gradient angular velocity for the Z-axis.
	 * @param gradientZMax The maximum gradient angular velocity for the Z-axis.
	 * @param gradientWMin Reserved data.
	 * @param gradientWMax Reserved data.
	 * @returns The gradient angular velocity instance.
	 * @zh 通过分轴随机双渐变角速度创建一个 `GradientAngularVelocity` 实例。
	 * @param gradientXMin 最小X轴渐变角速度。
	 * @param gradientXMax 最大X轴渐变角速度。
	 * @param gradientYMin 最小Y轴渐变角速度。
	 * @param gradientYMax 最大Y轴渐变角速度。
	 * @param gradientZMin 最小Z轴渐变角速度。
	 * @param gradientZMax 最大Z轴渐变角速度。
	 * @param gradientWMin 预留数据。
	 * @param gradientWMax 预留数据。
	 * @returns 渐变角速度实例。
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




	private __constantSeparate: Vector3 = null;
	/**
	 * @en The separate constant angular velocities for each axis.
	 * @zh 分轴固定角速度。
	 */
	public get _constantSeparate(): Vector3 {
		return this.__constantSeparate;
	}
	public set _constantSeparate(value: Vector3) {
		this.__constantSeparate = value.clone();
		this._constantXGradientDdata = GradientDataNumber.createConstantData(value.x);
		this._constantYGradientDdata = GradientDataNumber.createConstantData(value.y);
		this._constantZGradientDdata = GradientDataNumber.createConstantData(value.z);

	}


	private _gradient: GradientDataNumber = null;
	private _gradientX: GradientDataNumber = null;
	private _gradientY: GradientDataNumber = null;
	private _gradientZ: GradientDataNumber = null;
	private _gradientW: GradientDataNumber = null;


	/**@internal */
	_constantGradientDdata: GradientDataNumber = null;
	/**@internal */
	_constantMinGradientDdata: GradientDataNumber = null;
	/**@internal */
	_constantMaxGradientDdata: GradientDataNumber = null;

	private __constant: number = 0;
	private __constantMin: number = 0;
	private __constantMax: number = 0;
	/**
	 * @internal
	 */
	public get _constant(): number {
		return this.__constant;
	}
	/**
	 * @internal
	 */
	public set _constant(value: number) {
		this.__constant = value;
		this._constantGradientDdata = GradientDataNumber.createConstantData(value);
	}

	/**
	 * @internal
	 */
	get _constantMin() {
		return this.__constantMin;
	}
	/**
	 * @internal
	 */
	set _constantMin(value: number) {
		this.__constantMin = value;
		this._constantMinGradientDdata = GradientDataNumber.createConstantData(value);
	}


	/**
	 * @internal
	 */
	get _constantMax() {
		return this.__constantMax;
	}
	/**
	 * @internal
	 */
	set _constantMax(value: number) {
		this.__constantMax = value;
		this._constantMaxGradientDdata = GradientDataNumber.createConstantData(value);
	}

	private __constantMinSeparate: Vector3 = null;
	private __constantMaxSeparate: Vector3 = null;
	//@internal
	_constantXGradientDdata: GradientDataNumber = null;
	//@internal
	_constantYGradientDdata: GradientDataNumber = null;
	//@internal
	_constantZGradientDdata: GradientDataNumber = null;

	//@internal
	_constantXMinGradientDdata: GradientDataNumber = null;
	//@internal
	_constantYMinGradientDdata: GradientDataNumber = null;
	//@internal
	_constantZMinGradientDdata: GradientDataNumber = null;
	//@internal
	_constantXMaxGradientDdata: GradientDataNumber = null;
	//@internal
	_constantYMaxGradientDdata: GradientDataNumber = null;
	//@internal
	_constantZMaxGradientDdata: GradientDataNumber = null;
	/**
	 * @en The minimum constant separate vector.
	 * @zh 最小常量分离向量。
	 */
	public get _constantMinSeparate(): Vector3 {
		return this.__constantMinSeparate;
	}
	public set _constantMinSeparate(value: Vector3) {
		this.__constantMinSeparate = value.clone();
		this._constantXMinGradientDdata = GradientDataNumber.createConstantData(value.x);
		this._constantYMinGradientDdata = GradientDataNumber.createConstantData(value.y);
		this._constantZMinGradientDdata = GradientDataNumber.createConstantData(value.z);
	}

	/**
	 * @en The maximum constant separate vector.
	 * @zh 最大常量分离向量。
	 */
	public get _constantMaxSeparate(): Vector3 {
		return this.__constantMaxSeparate;
	}
	public set _constantMaxSeparate(value: Vector3) {
		this.__constantMaxSeparate = value;
		this._constantXMaxGradientDdata = GradientDataNumber.createConstantData(value.x);
		this._constantYMaxGradientDdata = GradientDataNumber.createConstantData(value.y);
		this._constantZMaxGradientDdata = GradientDataNumber.createConstantData(value.z);
	}

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
	 * @en The type of lifetime angular velocity. 0: Constant mode, 1: Curve mode, 2: Random between two constants mode, 3: Random between two curves mode.
	 * @zh 生命周期角速度类型。0：常量模式，1：曲线模式，2：随机双常量模式，3：随机双曲线模式。
	 */
	get type(): number {
		return this._type;
	}

	/**
	 * @en Whether the axes are separated.
	 * @zh 是否分轴。
	 */
	get separateAxes(): boolean {
		return this._separateAxes;
	}

	/**
	 * @en The constant angular velocity.
	 * @zh 固定角速度。
	 */
	get constant(): number {
		return this._constant;
	}

	/**
	 * @en The constant angular velocity for separate axes.
	 * @zh 分轴固定角速度。
	 */
	get constantSeparate(): Vector3 {
		return this._constantSeparate;
	}

	/**
	 * @en The gradient angular velocity.
	 * @zh 渐变角速度。
	 */
	get gradient(): GradientDataNumber {
		return this._gradient;
	}

	/**
	 * @en The gradient angular velocity for X axis.
	 * @zh X轴渐变角速度。
	 */
	get gradientX(): GradientDataNumber {
		return this._gradientX;
	}

	/**
	 * @en The gradient angular velocity for Y axis.
	 * @zh Y轴渐变角速度。
	 */
	get gradientY(): GradientDataNumber {
		return this._gradientY;
	}

	/**
	 * @en The gradient angular velocity for Z axis.
	 * @zh Z轴渐变角速度。
	 */
	get gradientZ(): GradientDataNumber {
		return this._gradientZ;
	}

	/**
	 * @en The gradient angular velocity for W component.
	 * @zh W分量渐变角速度。
	 */
	get gradientW(): GradientDataNumber {
		return this._gradientW;
	}

	/**
	 * @en The minimum constant angular velocity for random between two constants mode.
	 * @zh 随机双固定角速度的最小值。
	 */
	get constantMin(): number {
		return this._constantMin;
	}

	/**
	 * @en The maximum constant angular velocity for random between two constants mode.
	 * @zh 随机双固定角速度的最大值。
	 */
	get constantMax(): number {
		return this._constantMax;
	}

	/**
	 * @en The minimum constant angular velocity for separate axes in random between two constants mode.
	 * @zh 分轴随机双固定角速度的最小值。
	 */
	get constantMinSeparate(): Vector3 {
		return this._constantMinSeparate;
	}

	/**
	 * @en The maximum constant angular velocity for separate axes in random between two constants mode.
	 * @zh 分轴随机双固定角速度的最大值。
	 */
	get constantMaxSeparate(): Vector3 {
		return this._constantMaxSeparate;
	}

	/**
	 * @en The minimum gradient angular velocity.
	 * @zh 最小渐变角速度。
	 */
	get gradientMin(): GradientDataNumber {
		return this._gradientMin;
	}

	/**
	 * @en The maximum gradient angular velocity.
	 * @zh 最大渐变角速度。
	 */
	get gradientMax(): GradientDataNumber {
		return this._gradientMax;
	}

	/**
	 * @en The minimum gradient angular velocity for X axis.
	 * @zh X轴最小渐变角速度。
	 */
	get gradientXMin(): GradientDataNumber {
		return this._gradientXMin;
	}

	/**
	 * @en The maximum gradient angular velocity for X axis.
	 * @zh X轴最大渐变角速度。
	 */
	get gradientXMax(): GradientDataNumber {
		return this._gradientXMax;
	}

	/**
	 * @en The minimum gradient angular velocity for Y axis.
	 * @zh Y轴最小渐变角速度。
	 */
	get gradientYMin(): GradientDataNumber {
		return this._gradientYMin;
	}

	/**
	 * @en The maximum gradient angular velocity for Y axis.
	 * @zh Y轴最大渐变角速度。
	 */
	get gradientYMax(): GradientDataNumber {
		return this._gradientYMax;
	}

	/**
	 * @en The minimum gradient angular velocity for Z axis.
	 * @zh Z轴最小渐变角速度。
	 */
	get gradientZMin(): GradientDataNumber {
		return this._gradientZMin;
	}

	/**
	 * @en The maximum gradient angular velocity for Z axis.
	 * @zh Z轴最大渐变角速度。
	 */
	get gradientZMax(): GradientDataNumber {
		return this._gradientZMax;
	}

	/**
	 * @en The minimum gradient angular velocity for W axis.
	 * @zh W轴最小渐变角速度。
	 */
	get gradientWMin(): GradientDataNumber {
		return this._gradientWMin;
	}

	/**
	 * @en The maximum gradient angular velocity for W axis.
	 * @zh W轴最大渐变角速度。
	 */
	get gradientWMax(): GradientDataNumber {
		return this._gradientWMax;
	}

	/**
	 * @ignore
	 * @en Creating an instance via `new` is not allowed; please use the static creation function.
	 * @zh 不允许new，请使用静态创建函数。
	 */
	constructor() {

	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: GradientAngularVelocity): void {
		destObject._type = this._type;
		destObject._separateAxes = this._separateAxes;
		destObject._constant = this._constant;
		this._constantSeparate.cloneTo(destObject._constantSeparate);
		this._gradient.cloneTo(destObject._gradient);
		this._gradientX.cloneTo(destObject._gradientX);
		this._gradientY.cloneTo(destObject._gradientY);
		this._gradientZ.cloneTo(destObject._gradientZ);
		destObject._constantMin = this._constantMin;
		destObject._constantMax = this._constantMax;
		this._constantMinSeparate.cloneTo(destObject._constantMinSeparate);
		this._constantMaxSeparate.cloneTo(destObject._constantMaxSeparate);
		this._gradientMin.cloneTo(destObject._gradientMin);
		this._gradientMax.cloneTo(destObject._gradientMax);
		this._gradientXMin.cloneTo(destObject._gradientXMin);
		this._gradientXMax.cloneTo(destObject._gradientXMax);
		this._gradientYMin.cloneTo(destObject._gradientYMin);
		this._gradientYMax.cloneTo(destObject._gradientYMax);
		this._gradientZMin.cloneTo(destObject._gradientZMin);
		this._gradientZMax.cloneTo(destObject._gradientZMax);
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destGradientAngularVelocity: GradientAngularVelocity = new GradientAngularVelocity();
		this.cloneTo(destGradientAngularVelocity);
		return destGradientAngularVelocity;
	}

}


