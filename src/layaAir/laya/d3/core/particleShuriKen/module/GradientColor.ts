import { Gradient } from "../../Gradient"
import { IClone } from "../../../../utils/IClone"
import { Vector4 } from "../../../../maths/Vector4";

/**
 * @en The GradientColor class is used to create gradient colors.
 * @zh GradientColor 类用于创建渐变颜色。
 */
export class GradientColor implements IClone {
	/**
	 * @en Create a GradientColor instance with a constant color.
	 * @param constant The constant color.
	 * @returns A new GradientColor instance.
	 * @zh 通过固定颜色创建一个 GradientColor 实例。
	 * @param constant 固定颜色。
	 * @returns 一个新的 GradientColor 实例。
	 */
	static createByConstant(constant: Vector4): GradientColor {
		var gradientColor: GradientColor = new GradientColor();
		gradientColor._type = 0;
		gradientColor._constant = constant;
		return gradientColor;
	}

	/**
	 * @en Create a GradientColor instance with a gradient color.
	 * @param gradient The gradient color.
	 * @returns A new GradientColor instance.
	 * @zh 通过渐变颜色创建一个 GradientColor 实例。
	 * @param gradient 渐变色。
	 * @returns 一个新的 GradientColor 实例。
	 */
	static createByGradient(gradient: Gradient): GradientColor {
		var gradientColor: GradientColor = new GradientColor();
		gradientColor._type = 1;
		gradientColor._gradient = gradient;
		return gradientColor;
	}

	/**
	 * @en Create a GradientColor instance with two random constant colors.
	 * @param minConstant The minimum constant color.
	 * @param maxConstant The maximum constant color.
	 * @returns A new GradientColor instance.
	 * @zh 通过随机双固定颜色创建一个 GradientColor 实例。
	 * @param minConstant 最小固定颜色。
	 * @param maxConstant 最大固定颜色。
	 * @returns 一个新的 GradientColor 实例。
	 */
	static createByRandomTwoConstant(minConstant: Vector4, maxConstant: Vector4): GradientColor {
		var gradientColor: GradientColor = new GradientColor();
		gradientColor._type = 2;
		gradientColor._constantMin = minConstant;
		gradientColor._constantMax = maxConstant;
		return gradientColor;
	}

	/**
	 * @en Create a GradientColor instance with two random gradient colors.
	 * @param minGradient The minimum gradient color.
	 * @param maxGradient The maximum gradient color.
	 * @returns A new GradientColor instance.
	 * @zh 通过随机双渐变颜色创建一个 GradientColor 实例。
	 * @param minGradient 最小渐变颜色。
	 * @param maxGradient 最大渐变颜色。
	 * @returns 一个新的 GradientColor 实例。
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
	 * @en The type of lifetime color. 0 for constant color mode, 1 for gradient mode, 2 for random two constant colors mode, 3 for random two gradients mode.
	 * @zh 生命周期颜色类型。0为固定颜色模式，1为渐变模式，2为随机双固定颜色模式，3为随机双渐变模式。
	 */
	get type(): number {
		return this._type;
	}

	/**
	 * @en The constant color.
	 * @zh 固定颜色。
	 */
	get constant(): Vector4 {
		return this._constant;
	}

	/**
	 * @en The minimum constant color.
	 * @zh 最小固定颜色。
	 */
	get constantMin(): Vector4 {
		return this._constantMin;
	}

	/**
	 * @en The maximum constant color.
	 * @zh 最大固定颜色。
	 */
	get constantMax(): Vector4 {
		return this._constantMax;
	}

	/**
	 * @en The gradient color.
	 * @zh 渐变颜色。
	 */
	get gradient(): Gradient {
		return this._gradient;
	}

	/**
	 * @en The minimum gradient color.
	 * @zh 最小渐变颜色。
	 */
	get gradientMin(): Gradient {
		return this._gradientMin;
	}

	/**
	 * @en The maximum gradient color.
	 * @zh 最大渐变颜色。
	 */
	get gradientMax(): Gradient {
		return this._gradientMax;
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
	cloneTo(destObject: GradientColor): void {
		destObject._type = this._type;
		this._constant.cloneTo(destObject._constant);
		this._constantMin.cloneTo(destObject._constantMin);
		this._constantMax.cloneTo(destObject._constantMax);
		this._gradient.cloneTo(destObject._gradient);
		this._gradientMin.cloneTo(destObject._gradientMin);
		this._gradientMax.cloneTo(destObject._gradientMax);
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destGradientColor: GradientColor = new GradientColor();
		this.cloneTo(destGradientColor);
		return destGradientColor;
	}

}