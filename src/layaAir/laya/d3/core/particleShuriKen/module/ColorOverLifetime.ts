import { GradientColor } from "./GradientColor";
/**
 * @en The ColorOverLifetime class is used for the lifecycle color of particles.
 * @zh ColorOverLifetime 类用于粒子的生命周期颜色。
 */
export class ColorOverLifetime {
	private _color: GradientColor;

	/**
	 * @en Whether to enable.
	 * @zh 是否启用。
	 */
	enable: boolean;

	/**
	 * @en The color.
	 * @zh 颜色。
	 */
	get color(): GradientColor {
		return this._color;
	}

	/**
	 * @ignore
	 * @en creates an instance of the ColorOverLifetime class.
	 * @param color gradient color.
	 * @zh 创建ColorOverLifetime类的实例。
	 * @param color 渐变颜色。
	 */
	constructor(color: GradientColor) {
		this._color = color;
	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: ColorOverLifetime): void {
		this._color.cloneTo(destObject._color);
		destObject.enable = this.enable;
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destColor: GradientColor;
		switch (this._color.type) {
			case 0:
				destColor = GradientColor.createByConstant(this._color.constant.clone());
				break;
			case 1:
				destColor = GradientColor.createByGradient(this._color.gradient.clone());
				break;
			case 2:
				destColor = GradientColor.createByRandomTwoConstant(this._color.constantMin.clone(), this._color.constantMax.clone());
				break;
			case 3:
				destColor = GradientColor.createByRandomTwoGradient(this._color.gradientMin.clone(), this._color.gradientMax.clone());
				break;
		}

		var destColorOverLifetime: ColorOverLifetime = new ColorOverLifetime(destColor);
		destColorOverLifetime.enable = this.enable;
		return destColorOverLifetime;
	}

}


