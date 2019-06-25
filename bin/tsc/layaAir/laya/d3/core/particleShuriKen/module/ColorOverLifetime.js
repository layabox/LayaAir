import { GradientColor } from "././GradientColor";
/**
 * <code>ColorOverLifetime</code> 类用于粒子的生命周期颜色。
 */
export class ColorOverLifetime {
    /**
     *获取颜色。
     */
    get color() {
        return this._color;
    }
    /**
     * 创建一个 <code>ColorOverLifetime</code> 实例。
     */
    constructor(color) {
        this._color = color;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destColorOverLifetime = destObject;
        this._color.cloneTo(destColorOverLifetime._color);
        destColorOverLifetime.enbale = this.enbale;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destColor;
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
        var destColorOverLifetime = new ColorOverLifetime(destColor);
        destColorOverLifetime.enbale = this.enbale;
        return destColorOverLifetime;
    }
}
