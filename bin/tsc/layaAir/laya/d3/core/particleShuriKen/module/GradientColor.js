/**
 * <code>GradientColor</code> 类用于创建渐变颜色。
 */
export class GradientColor {
    /**
     * 创建一个 <code>GradientColor,不允许new，请使用静态创建函数。</code> 实例。
     */
    constructor() {
        this._type = 0;
        this._constant = null;
        this._constantMin = null;
        this._constantMax = null;
        this._gradient = null;
        this._gradientMin = null;
        this._gradientMax = null;
    }
    /**
     * 通过固定颜色创建一个 <code>GradientColor</code> 实例。
     * @param constant 固定颜色。
     */
    static createByConstant(constant) {
        var gradientColor = new GradientColor();
        gradientColor._type = 0;
        gradientColor._constant = constant;
        return gradientColor;
    }
    /**
     * 通过渐变颜色创建一个 <code>GradientColor</code> 实例。
     * @param gradient 渐变色。
     */
    static createByGradient(gradient) {
        var gradientColor = new GradientColor();
        gradientColor._type = 1;
        gradientColor._gradient = gradient;
        return gradientColor;
    }
    /**
     * 通过随机双固定颜色创建一个 <code>GradientColor</code> 实例。
     * @param minConstant 最小固定颜色。
     * @param maxConstant 最大固定颜色。
     */
    static createByRandomTwoConstant(minConstant, maxConstant) {
        var gradientColor = new GradientColor();
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
    static createByRandomTwoGradient(minGradient, maxGradient) {
        var gradientColor = new GradientColor();
        gradientColor._type = 3;
        gradientColor._gradientMin = minGradient;
        gradientColor._gradientMax = maxGradient;
        return gradientColor;
    }
    /**
     *生命周期颜色类型,0为固定颜色模式,1渐变模式,2为随机双固定颜色模式,3随机双渐变模式。
     */
    get type() {
        return this._type;
    }
    /**
     * 固定颜色。
     */
    get constant() {
        return this._constant;
    }
    /**
     * 最小固定颜色。
     */
    get constantMin() {
        return this._constantMin;
    }
    /**
     * 最大固定颜色。
     */
    get constantMax() {
        return this._constantMax;
    }
    /**
     * 渐变颜色。
     */
    get gradient() {
        return this._gradient;
    }
    /**
     * 最小渐变颜色。
     */
    get gradientMin() {
        return this._gradientMin;
    }
    /**
     * 最大渐变颜色。
     */
    get gradientMax() {
        return this._gradientMax;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destGradientColor = destObject;
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
    clone() {
        var destGradientColor = new GradientColor();
        this.cloneTo(destGradientColor);
        return destGradientColor;
    }
}
