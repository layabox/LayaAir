import { GradientColor } from "./GradientColor";
/**
 * <code>ColorOverLifetime</code> 类用于粒子的生命周期颜色。
 */
export class ColorOverLifetime {
	private _color: GradientColor;

	/**是否启用。*/
	enable: boolean;

	/**
	 *获取颜色。
	 */
	get color(): GradientColor {
		return this._color;
	}

	/**
	 * 创建一个 <code>ColorOverLifetime</code> 实例。
	 */
	constructor(color: GradientColor) {
		this._color = color;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destColorOverLifetime: ColorOverLifetime = (<ColorOverLifetime>destObject);
		this._color.cloneTo(destColorOverLifetime._color);
		destColorOverLifetime.enable = this.enable;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
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


