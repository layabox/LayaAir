import { GradientDataNumber } from "./GradientDataNumber";
import { IClone } from "../../IClone"
import { Vector3 } from "../../../math/Vector3"

/**
 * <code>GradientSize</code> 类用于创建渐变尺寸。
 */
export class GradientSize implements IClone {
	/**
	 * 通过渐变尺寸创建一个 <code>GradientSize</code> 实例。
	 * @param	gradient 渐变尺寸。
	 * @return  渐变尺寸。
	 */
	static createByGradient(gradient: GradientDataNumber): GradientSize {
		var gradientSize: GradientSize = new GradientSize();
		gradientSize._type = 0;
		gradientSize._separateAxes = false;
		gradientSize._gradient = gradient;
		return gradientSize;
	}

	/**
	 * 通过分轴渐变尺寸创建一个 <code>GradientSize</code> 实例。
	 * @param	gradientX 渐变尺寸X。
	 * @param	gradientY 渐变尺寸Y。
	 * @param	gradientZ 渐变尺寸Z。
	 * @return  渐变尺寸。
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
	 * 通过随机双固定尺寸创建一个 <code>GradientSize</code> 实例。
	 * @param	constantMin 最小固定尺寸。
	 * @param	constantMax 最大固定尺寸。
	 * @return 渐变尺寸。
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
	 * 通过分轴随机双固定尺寸创建一个 <code>GradientSize</code> 实例。
	 * @param	constantMinSeparate 分轴最小固定尺寸.
	 * @param	constantMaxSeparate 分轴最大固定尺寸。
	 * @return   渐变尺寸。
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
	 * 通过随机双渐变尺寸创建一个 <code>GradientSize</code> 实例。
	 * @param	gradientMin 最小渐变尺寸。
	 * @param	gradientMax 最大渐变尺寸。
	 * @return 渐变尺寸。
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
	 * 通过分轴随机双渐变尺寸创建一个 <code>GradientSize</code> 实例。
	 * @param	gradientXMin X轴最小渐变尺寸。
	 * @param	gradientXMax X轴最大渐变尺寸。
	 * @param	gradientYMin Y轴最小渐变尺寸。
	 * @param	gradientYMax Y轴最大渐变尺寸。
	 * @param	gradientZMin Z轴最小渐变尺寸。
	 * @param	gradientZMax Z轴最大渐变尺寸。
	 * @return  渐变尺寸。
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
	 *生命周期尺寸类型，0曲线模式，1随机双常量模式，2随机双曲线模式。
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
	 * 渐变尺寸。
	 */
	get gradient(): GradientDataNumber {
		return this._gradient;
	}

	/**
	 * 渐变尺寸X。
	 */
	get gradientX(): GradientDataNumber {
		return this._gradientX;
	}

	/**
	 * 渐变尺寸Y。
	 */
	get gradientY(): GradientDataNumber {
		return this._gradientY;
	}

	/**
	 *渐变尺寸Z。
	 */
	get gradientZ(): GradientDataNumber {
		return this._gradientZ;
	}

	/**
	 *最小随机双固定尺寸。
	 */
	get constantMin(): number {
		return this._constantMin;
	}

	/**
	 * 最大随机双固定尺寸。
	 */
	get constantMax(): number {
		return this._constantMax;
	}

	/**
	 * 最小分轴随机双固定尺寸。
	 */
	get constantMinSeparate(): Vector3 {
		return this._constantMinSeparate;
	}

	/**
	 *  最小分轴随机双固定尺寸。
	 */
	get constantMaxSeparate(): Vector3 {
		return this._constantMaxSeparate;
	}

	/**
	 *渐变最小尺寸。
	 */
	get gradientMin(): GradientDataNumber {
		return this._gradientMin;
	}

	/**
	 * 渐变最大尺寸。
	 */
	get gradientMax(): GradientDataNumber {
		return this._gradientMax;
	}

	/**
	 * 渐变最小尺寸X。
	 */
	get gradientXMin(): GradientDataNumber {
		return this._gradientXMin;
	}

	/**
	 * 渐变最大尺寸X。
	 */
	get gradientXMax(): GradientDataNumber {
		return this._gradientXMax;
	}

	/**
	 * 渐变最小尺寸Y。
	 */
	get gradientYMin(): GradientDataNumber {
		return this._gradientYMin;
	}

	/**
	 *渐变最大尺寸Y。
	 */
	get gradientYMax(): GradientDataNumber {
		return this._gradientYMax;
	}

	/**
	 * 渐变最小尺寸Z。
	 */
	get gradientZMin(): GradientDataNumber {
		return this._gradientZMin;
	}

	/**
	 * 渐变最大尺寸Z。
	 */
	get gradientZMax(): GradientDataNumber {
		return this._gradientZMax;
	}

	/**
	 * 创建一个 <code>GradientSize,不允许new，请使用静态创建函数。</code> 实例。
	 */
	constructor() {
	}

	/**
	 * 获取最大尺寸。
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
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destGradientSize: GradientSize = (<GradientSize>destObject);
		destGradientSize._type = this._type;
		destGradientSize._separateAxes = this._separateAxes;
		this._gradient.cloneTo(destGradientSize._gradient);
		this._gradientX.cloneTo(destGradientSize._gradientX);
		this._gradientY.cloneTo(destGradientSize._gradientY);
		this._gradientZ.cloneTo(destGradientSize._gradientZ);
		destGradientSize._constantMin = this._constantMin;
		destGradientSize._constantMax = this._constantMax;
		this._constantMinSeparate.cloneTo(destGradientSize._constantMinSeparate);
		this._constantMaxSeparate.cloneTo(destGradientSize._constantMaxSeparate);
		this._gradientMin.cloneTo(destGradientSize._gradientMin);
		this._gradientMax.cloneTo(destGradientSize._gradientMax);
		this._gradientXMin.cloneTo(destGradientSize._gradientXMin);
		this._gradientXMax.cloneTo(destGradientSize._gradientXMax);
		this._gradientYMin.cloneTo(destGradientSize._gradientYMin);
		this._gradientYMax.cloneTo(destGradientSize._gradientYMax);
		this._gradientZMin.cloneTo(destGradientSize._gradientZMin);
		this._gradientZMax.cloneTo(destGradientSize._gradientZMax);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destGradientSize: GradientSize = new GradientSize();
		this.cloneTo(destGradientSize);
		return destGradientSize;
	}

}


