import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../../../utils/IClone"
import { Vector3 } from "../../../../maths/Vector3";

/**
 * @en The `GradientSize` class is used to create gradient sizes.
 * @zh `GradientSize` 类用于创建渐变尺寸。
 */
export class GradientSize implements IClone {
	/**
	 * @en Create a `GradientSize` instance by gradient size.
	 * @param gradient  The gradient size.
	 * @returns The gradient size instance.
	 * @zh 通过渐变尺寸创建一个 `GradientSize` 实例。
	 * @param gradient 渐变尺寸。
	 * @returns 渐变尺寸实例。
	 */
	static createByGradient(gradient: GradientDataNumber): GradientSize {
		var gradientSize: GradientSize = new GradientSize();
		gradientSize._type = 0;
		gradientSize._separateAxes = false;
		gradientSize._gradient = gradient;
		return gradientSize;
	}

	/**
	 * @en Create a `GradientSize` instance by separate axis gradient sizes.
	 * @param gradientX The gradient size for X axis.
	 * @param gradientY The gradient size for Y axis.
	 * @param gradientZ The gradient size for Z axis.
	 * @returns The gradient size instance.
	 * @zh 通过分轴渐变尺寸创建一个 `GradientSize` 实例。
	 * @param gradientX 渐变尺寸X。
	 * @param gradientY 渐变尺寸Y。
	 * @param gradientZ 渐变尺寸Z。
	 * @returns 渐变尺寸实例。
	 */
	static createByGradientSeparate(gradientX: GradientDataNumber, gradientY: GradientDataNumber, gradientZ: GradientDataNumber): GradientSize {
		var gradientSize: GradientSize = new GradientSize();
		gradientSize._type = 0;
		gradientSize._separateAxes = true;
		gradientSize._gradientX = gradientX;
		gradientSize._gradientY = gradientY;
		gradientSize._gradientZ = gradientZ;
		return gradientSize;
	}

	/**
	 * @en Create a `GradientSize` instance by random two constant sizes.
	 * @param constantMin The minimum constant size.
	 * @param constantMax The maximum constant size.
	 * @returns The gradient size instance.
	 * @zh 通过随机双固定尺寸创建一个 `GradientSize` 实例。
	 * @param constantMin 最小固定尺寸。
	 * @param constantMax 最大固定尺寸。
	 * @returns 渐变尺寸实例。
	 */
	static createByRandomTwoConstant(constantMin: number, constantMax: number): GradientSize {
		var gradientSize: GradientSize = new GradientSize();
		gradientSize._type = 1;
		gradientSize._separateAxes = false;
		gradientSize._constantMin = constantMin;
		gradientSize._constantMax = constantMax;
		return gradientSize;
	}

	/**
	 * @en Create a `GradientSize` instance by separate axis random two constant sizes.
	 * @param constantMinSeparate The minimum constant size for separate axes.
	 * @param constantMaxSeparate The maximum constant size for separate axes.
	 * @returns The gradient size instance.
	 * @zh 通过分轴随机双固定尺寸创建一个 `GradientSize` 实例。
	 * @param constantMinSeparate 分轴最小固定尺寸。
	 * @param constantMaxSeparate 分轴最大固定尺寸。
	 * @returns 渐变尺寸实例。
	 */
	static createByRandomTwoConstantSeparate(constantMinSeparate: Vector3, constantMaxSeparate: Vector3): GradientSize {
		var gradientSize: GradientSize = new GradientSize();
		gradientSize._type = 1;
		gradientSize._separateAxes = true;
		gradientSize._constantMinSeparate = constantMinSeparate;
		gradientSize._constantMaxSeparate = constantMaxSeparate;
		return gradientSize;
	}

	/**
	 * @en Create a `GradientSize` instance by random two gradient sizes.
	 * @param gradientMin The minimum gradient size.
	 * @param gradientMax The maximum gradient size.
	 * @returns The gradient size instance.
	 * @zh 通过随机双渐变尺寸创建一个 `GradientSize` 实例。
	 * @param gradientMin 最小渐变尺寸。
	 * @param gradientMax 最大渐变尺寸。
	 * @returns 渐变尺寸实例。
	 */
	static createByRandomTwoGradient(gradientMin: GradientDataNumber, gradientMax: GradientDataNumber): GradientSize {
		var gradientSize: GradientSize = new GradientSize();
		gradientSize._type = 2;
		gradientSize._separateAxes = false;
		gradientSize._gradientMin = gradientMin;
		gradientSize._gradientMax = gradientMax;
		return gradientSize;
	}

	/**
	 * @en Create a `GradientSize` instance by separate axis random two gradient sizes.
	 * @param gradientXMin The minimum gradient size for X axis.
	 * @param gradientXMax The maximum gradient size for X axis.
	 * @param gradientYMin The minimum gradient size for Y axis.
	 * @param gradientYMax The maximum gradient size for Y axis.
	 * @param gradientZMin The minimum gradient size for Z axis.
	 * @param gradientZMax The maximum gradient size for Z axis.
	 * @returns The gradient size instance.
	 * @zh 通过分轴随机双渐变尺寸创建一个 `GradientSize` 实例。
	 * @param gradientXMin X轴最小渐变尺寸。
	 * @param gradientXMax X轴最大渐变尺寸。
	 * @param gradientYMin Y轴最小渐变尺寸。
	 * @param gradientYMax Y轴最大渐变尺寸。
	 * @param gradientZMin Z轴最小渐变尺寸。
	 * @param gradientZMax Z轴最大渐变尺寸。
	 * @returns 渐变尺寸实例。
	 */
	static createByRandomTwoGradientSeparate(gradientXMin: GradientDataNumber, gradientXMax: GradientDataNumber, gradientYMin: GradientDataNumber, gradientYMax: GradientDataNumber, gradientZMin: GradientDataNumber, gradientZMax: GradientDataNumber): GradientSize {
		var gradientSize: GradientSize = new GradientSize();
		gradientSize._type = 2;
		gradientSize._separateAxes = true;
		gradientSize._gradientXMin = gradientXMin;
		gradientSize._gradientXMax = gradientXMax;
		gradientSize._gradientYMin = gradientYMin;
		gradientSize._gradientYMax = gradientYMax;
		gradientSize._gradientZMin = gradientZMin;
		gradientSize._gradientZMax = gradientZMax;
		return gradientSize;
	}

	private _type: number = 0;
	private _separateAxes: boolean = false;

	private _gradient: GradientDataNumber = null;
	private _gradientX: GradientDataNumber = null;
	private _gradientY: GradientDataNumber = null;
	private _gradientZ: GradientDataNumber = null;


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

	/**
	 * @en The type of lifecycle size. 0: Curve mode, 1: Random double constant mode, 2: Random double curve mode.
	 * @zh 生命周期尺寸类型，0：曲线模式，1：随机双常量模式，2：随机双曲线模式。
	 */
	get type(): number {
		return this._type;
	}

	/**
	 * @en Whether to separate axes.
	 * @zh 是否分轴。
	 */
	get separateAxes(): boolean {
		return this._separateAxes;
	}

	/**
	 * @en The gradient size.
	 * @zh 渐变尺寸。
	 */
	get gradient(): GradientDataNumber {
		return this._gradient;
	}

	/**
	 * @en The gradient size for X axis.
	 * @zh 渐变尺寸X。
	 */
	get gradientX(): GradientDataNumber {
		return this._gradientX;
	}

	/**
	 * @en The gradient size for Y axis.
	 * @zh 渐变尺寸Y。
	 */
	get gradientY(): GradientDataNumber {
		return this._gradientY;
	}

	/**
	 * @en The gradient size for Z axis.
	 * @zh 渐变尺寸Z。
	 */
	get gradientZ(): GradientDataNumber {
		return this._gradientZ;
	}

	/**
	 * @en The minimum random double constant size.
	 * @zh 最小随机双固定尺寸。
	 */
	get constantMin(): number {
		return this._constantMin;
	}

	/**
	 * @en The maximum random double constant size.
	 * @zh 最大随机双固定尺寸。
	 */
	get constantMax(): number {
		return this._constantMax;
	}

	/**
	 * @en The minimum separate axis random double constant size.
	 * @zh 最小分轴随机双固定尺寸。
	 */
	get constantMinSeparate(): Vector3 {
		return this._constantMinSeparate;
	}

	/**
	 * @en The maximum separate axis random double constant size.
	 * @zh 最大分轴随机双固定尺寸。
	 */
	get constantMaxSeparate(): Vector3 {
		return this._constantMaxSeparate;
	}

	/**
	 * @en The minimum gradient size.
	 * @zh 渐变最小尺寸。
	 */
	get gradientMin(): GradientDataNumber {
		return this._gradientMin;
	}

	/**
	 * @en The maximum gradient size.
	 * @zh 渐变最大尺寸。
	 */
	get gradientMax(): GradientDataNumber {
		return this._gradientMax;
	}

	/**
	 * @en The minimum gradient size for X axis.
	 * @zh 渐变最小尺寸X。
	 */
	get gradientXMin(): GradientDataNumber {
		return this._gradientXMin;
	}

	/**
	 * @en The maximum gradient size for X axis.
	 * @zh 渐变最大尺寸X。
	 */
	get gradientXMax(): GradientDataNumber {
		return this._gradientXMax;
	}

	/**
	 * @en The minimum gradient size for Y axis.
	 * @zh 渐变最小尺寸Y。
	 */
	get gradientYMin(): GradientDataNumber {
		return this._gradientYMin;
	}

	/**
	 * @en The maximum gradient size for Y axis.
	 * @zh 渐变最大尺寸Y。
	 */
	get gradientYMax(): GradientDataNumber {
		return this._gradientYMax;
	}

	/**
	 * @en The minimum gradient size for Z axis.
	 * @zh 渐变最小尺寸Z。
	 */
	get gradientZMin(): GradientDataNumber {
		return this._gradientZMin;
	}

	/**
	 * @en The maximum gradient size for Z axis.
	 * @zh 渐变最大尺寸Z。
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
	 * @en Retrieves the maximum size within a gradient, based on the specified parameters and mode.
	 * @param meshMode Indicates whether the calculation is for mesh mode.
	 * @returns The maximum size found in the gradient.
	 * @zh 获取渐变中的最大尺寸。
	 * @param	meshMode 是否是网格模式
	 * @returns 返回渐变中找到的最大尺寸。
	 */
	getMaxSizeInGradient(meshMode: boolean = false): number {
		var i: number, n: number;
		var maxSize: number = -Number.MAX_VALUE;
		switch (this._type) {
			case 0:
				if (this._separateAxes) {
					for (i = 0, n = this._gradientX.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradientX.getValueByIndex(i));
					for (i = 0, n = this._gradientY.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradientY.getValueByIndex(i));
					if (meshMode) {
						for (i = 0, n = this._gradientZ.gradientCount; i < n; i++) {
							maxSize = Math.max(maxSize, this._gradientZ.getValueByIndex(i));
						}
					}
				} else {
					for (i = 0, n = this._gradient.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradient.getValueByIndex(i));
				}
				break;
			case 1:
				if (this._separateAxes) {
					maxSize = Math.max(this._constantMinSeparate.x, this._constantMaxSeparate.x);
					maxSize = Math.max(maxSize, this._constantMinSeparate.y);
					if (meshMode) {
						maxSize = maxSize = Math.max(maxSize, this._constantMaxSeparate.z);
					}
				} else {
					maxSize = Math.max(this._constantMin, this._constantMax);
				}
				break;
			case 2:
				if (this._separateAxes) {
					for (i = 0, n = this._gradientXMin.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradientXMin.getValueByIndex(i));
					for (i = 0, n = this._gradientXMax.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradientXMax.getValueByIndex(i));

					for (i = 0, n = this._gradientYMin.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradientYMin.getValueByIndex(i));
					for (i = 0, n = this._gradientZMax.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradientZMax.getValueByIndex(i));

					if (meshMode) {
						for (i = 0, n = this._gradientZMin.gradientCount; i < n; i++) {
							maxSize = Math.max(maxSize, this._gradientZMin.getValueByIndex(i));
						}
						for (i = 0, n = this._gradientZMax.gradientCount; i < n; i++) {
							maxSize = Math.max(maxSize, this._gradientZMax.getValueByIndex(i));
						}
					}
				} else {
					for (i = 0, n = this._gradientMin.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradientMin.getValueByIndex(i));
					for (i = 0, n = this._gradientMax.gradientCount; i < n; i++)
						maxSize = Math.max(maxSize, this._gradientMax.getValueByIndex(i));
				}
				break;
		}
		return maxSize;
	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: GradientSize): void {
		destObject._type = this._type;
		destObject._separateAxes = this._separateAxes;
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
		var destGradientSize: GradientSize = new GradientSize();
		this.cloneTo(destGradientSize);
		return destGradientSize;
	}

}


