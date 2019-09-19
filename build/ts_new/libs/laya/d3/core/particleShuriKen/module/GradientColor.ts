import { Gradient } from "../../Gradient"
import { IClone } from "../../IClone"
import { Vector4 } from "../../../math/Vector4"

/**
 * <code>GradientColor</code> 类用于创建渐变颜色。
 */
export class GradientColor implements IClone {
	/**
	 * 通过固定颜色创建一个 <code>GradientColor</code> 实例。
	 * @param constant 固定颜色。
	 */
	static createByConstant(constant: Vector4): GradientColor {
		var gradientColor: GradientColor = new GradientColor();
		gradientColor._type = 0;
		gradientColor._constant = constant;
		return gradientColor;
	}

	/**
	 * 通过渐变颜色创建一个 <code>GradientColor</code> 实例。
	 * @param gradient 渐变色。
	 */
	static createByGradient(gradient: Gradient): GradientColor {
		var gradientColor: GradientColor = new GradientColor();
		gradientColor._type = 1;
		gradientColor._gradient = gradient;
		return gradientColor;
	}

	/**
	 * 通过随机双固定颜色创建一个 <code>GradientColor</code> 实例。
	 * @param minConstant 最小固定颜色。
	 * @param maxConstant 最大固定颜色。
	 */
	static createByRandomTwoConstant(minConstant: Vector4, maxConstant: Vector4): GradientColor {
		var gradientColor: GradientColor = new GradientColor();
		gradientColor._type = 2;
		gradientColor._constantMin = minConstant;
		gradientColor._constantMax = maxConstant;
		return gradientColor;
	}

	/**
	 * 通过随机双渐变颜色创建一个 <code>GradientColor</code> 实例。
	 * @param minGradient 最小渐变颜色。
	 * @param maxGradient 最大渐变颜色。
	 */
	static createByRandomTwoGradient(minGradient: Gradient, maxGradient: Gradient): GradientColor {
		var gradientColor: GradientColor = new GradientColor();
		gradientColor._type = 3;
		gradientColor._gradientMin = minGradient;
		gradientColor._gradientMax = maxGradient;
		return gradientColor;
	}

	private _type: number = 0;

	private _constant: Vector4 = null;
	private _constantMin: Vector4 = null;
	private _constantMax: Vector4 = null;
	private _gradient: Gradient = null;
	private _gradientMin: Gradient = null;
	private _gradientMax: Gradient = null;

	/**
	 *生命周期颜色类型,0为固定颜色模式,1渐变模式,2为随机双固定颜色模式,3随机双渐变模式。
	 */
	get type(): number {
		return this._type;
	}

	/**
	 * 固定颜色。
	 */
	get constant(): Vector4 {
		return this._constant;
	}

	/**
	 * 最小固定颜色。
	 */
	get constantMin(): Vector4 {
		return this._constantMin;
	}

	/**
	 * 最大固定颜色。
	 */
	get constantMax(): Vector4 {
		return this._constantMax;
	}

	/**
	 * 渐变颜色。
	 */
	get gradient(): Gradient {
		return this._gradient;
	}

	/**
	 * 最小渐变颜色。
	 */
	get gradientMin(): Gradient {
		return this._gradientMin;
	}

	/**
	 * 最大渐变颜色。
	 */
	get gradientMax(): Gradient {
		return this._gradientMax;
	}

	/**
	 * 创建一个 <code>GradientColor,不允许new，请使用静态创建函数。</code> 实例。
	 */
	constructor() {
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destGradientColor: GradientColor = (<GradientColor>destObject);
		destGradientColor._type = this._type;
		this._constant.cloneTo(destGradientColor._constant);
		this._constantMin.cloneTo(destGradientColor._constantMin);
		this._constantMax.cloneTo(destGradientColor._constantMax);
		this._gradient.cloneTo(destGradientColor._gradient);
		this._gradientMin.cloneTo(destGradientColor._gradientMin);
		this._gradientMax.cloneTo(destGradientColor._gradientMax);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destGradientColor: GradientColor = new GradientColor();
		this.cloneTo(destGradientColor);
		return destGradientColor;
	}

}


