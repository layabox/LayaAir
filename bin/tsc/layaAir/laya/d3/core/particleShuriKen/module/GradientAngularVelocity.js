/**
 * <code>GradientRotation</code> 类用于创建渐变角速度。
 */
export class GradientAngularVelocity {
    /**
     * 创建一个 <code>GradientAngularVelocity,不允许new，请使用静态创建函数。</code> 实例。
     */
    constructor() {
        this._type = 0;
        this._separateAxes = false;
        this._constant = 0;
        this._constantSeparate = null;
        this._gradient = null;
        this._gradientX = null;
        this._gradientY = null;
        this._gradientZ = null;
        this._gradientW = null;
        this._constantMin = 0;
        this._constantMax = 0;
        this._constantMinSeparate = null;
        this._constantMaxSeparate = null;
        this._gradientMin = null;
        this._gradientMax = null;
        this._gradientXMin = null;
        this._gradientXMax = null;
        this._gradientYMin = null;
        this._gradientYMax = null;
        this._gradientZMin = null;
        this._gradientZMax = null;
        this._gradientWMin = null;
        this._gradientWMax = null;
    }
    /**
     * 通过固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	constant 固定角速度。
     * @return 渐变角速度。
     */
    static createByConstant(constant) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 0;
        gradientAngularVelocity._separateAxes = false;
        gradientAngularVelocity._constant = constant;
        return gradientAngularVelocity;
    }
    /**
     * 通过分轴固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	separateConstant 分轴固定角速度。
     * @return 渐变角速度。
     */
    static createByConstantSeparate(separateConstant) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 0;
        gradientAngularVelocity._separateAxes = true;
        gradientAngularVelocity._constantSeparate = separateConstant;
        return gradientAngularVelocity;
    }
    /**
     * 通过渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	gradient 渐变角速度。
     * @return 渐变角速度。
     */
    static createByGradient(gradient) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 1;
        gradientAngularVelocity._separateAxes = false;
        gradientAngularVelocity._gradient = gradient;
        return gradientAngularVelocity;
    }
    /**
     * 通过分轴渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	gradientX X轴渐变角速度。
     * @param	gradientY Y轴渐变角速度。
     * @param	gradientZ Z轴渐变角速度。
     * @return  渐变角速度。
     */
    static createByGradientSeparate(gradientX, gradientY, gradientZ) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 1;
        gradientAngularVelocity._separateAxes = true;
        gradientAngularVelocity._gradientX = gradientX;
        gradientAngularVelocity._gradientY = gradientY;
        gradientAngularVelocity._gradientZ = gradientZ;
        return gradientAngularVelocity;
    }
    /**
     * 通过随机双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	constantMin 最小固定角速度。
     * @param	constantMax 最大固定角速度。
     * @return 渐变角速度。
     */
    static createByRandomTwoConstant(constantMin, constantMax) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 2;
        gradientAngularVelocity._separateAxes = false;
        gradientAngularVelocity._constantMin = constantMin;
        gradientAngularVelocity._constantMax = constantMax;
        return gradientAngularVelocity;
    }
    /**
     * 通过随机分轴双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	separateConstantMin  最小分轴固定角速度。
     * @param	separateConstantMax  最大分轴固定角速度。
     * @return  渐变角速度。
     */
    static createByRandomTwoConstantSeparate(separateConstantMin, separateConstantMax) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 2;
        gradientAngularVelocity._separateAxes = true;
        gradientAngularVelocity._constantMinSeparate = separateConstantMin;
        gradientAngularVelocity._constantMaxSeparate = separateConstantMax;
        return gradientAngularVelocity;
    }
    /**
     * 通过随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	gradientMin 最小渐变角速度。
     * @param	gradientMax 最大渐变角速度。
     * @return  渐变角速度。
     */
    static createByRandomTwoGradient(gradientMin, gradientMax) {
        var gradientAngularVelocity = new GradientAngularVelocity();
        gradientAngularVelocity._type = 3;
        gradientAngularVelocity._separateAxes = false;
        gradientAngularVelocity._gradientMin = gradientMin;
        gradientAngularVelocity._gradientMax = gradientMax;
        return gradientAngularVelocity;
    }
    /**
     * 通过分轴随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
     * @param	gradientXMin  最小X轴渐变角速度。
     * @param	gradientXMax  最大X轴渐变角速度。
     * @param	gradientYMin  最小Y轴渐变角速度。
     * @param	gradientYMax  最大Y轴渐变角速度。
     * @param	gradientZMin  最小Z轴渐变角速度。
     * @param	gradientZMax  最大Z轴渐变角速度。
     * @return  渐变角速度。
     */
    static createByRandomTwoGradientSeparate(gradientXMin, gradientXMax, gradientYMin, gradientYMax, gradientZMin, gradientZMax, gradientWMin, gradientWMax) {
        var gradientAngularVelocity = new GradientAngularVelocity();
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
    /**
     *生命周期角速度类型,0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
     */
    get type() {
        return this._type;
    }
    /**
     *是否分轴。
     */
    get separateAxes() {
        return this._separateAxes;
    }
    /**
     * 固定角速度。
     */
    get constant() {
        return this._constant;
    }
    /**
     * 分轴固定角速度。
     */
    get constantSeparate() {
        return this._constantSeparate;
    }
    /**
     * 渐变角速度。
     */
    get gradient() {
        return this._gradient;
    }
    /**
     * 渐变角角速度X。
     */
    get gradientX() {
        return this._gradientX;
    }
    /**
     * 渐变角速度Y。
     */
    get gradientY() {
        return this._gradientY;
    }
    /**
     *渐变角速度Z。
     */
    get gradientZ() {
        return this._gradientZ;
    }
    /**
     *渐变角速度Z。
     */
    get gradientW() {
        return this._gradientW;
    }
    /**
     * 最小随机双固定角速度。
     */
    get constantMin() {
        return this._constantMin;
    }
    /**
     * 最大随机双固定角速度。
     */
    get constantMax() {
        return this._constantMax;
    }
    /**
     * 最小分轴随机双固定角速度。
     */
    get constantMinSeparate() {
        return this._constantMinSeparate;
    }
    /**
     * 最大分轴随机双固定角速度。
     */
    get constantMaxSeparate() {
        return this._constantMaxSeparate;
    }
    /**
     *最小渐变角速度。
     */
    get gradientMin() {
        return this._gradientMin;
    }
    /**
     * 最大渐变角速度。
     */
    get gradientMax() {
        return this._gradientMax;
    }
    /**
     * 最小渐变角速度X。
     */
    get gradientXMin() {
        return this._gradientXMin;
    }
    /**
     * 最大渐变角速度X。
     */
    get gradientXMax() {
        return this._gradientXMax;
    }
    /**
     * 最小渐变角速度Y。
     */
    get gradientYMin() {
        return this._gradientYMin;
    }
    /**
     *最大渐变角速度Y。
     */
    get gradientYMax() {
        return this._gradientYMax;
    }
    /**
     * 最小渐变角速度Z。
     */
    get gradientZMin() {
        return this._gradientZMin;
    }
    /**
     * 最大渐变角速度Z。
     */
    get gradientZMax() {
        return this._gradientZMax;
    }
    /**
     * 最小渐变角速度Z。
     */
    get gradientWMin() {
        return this._gradientWMin;
    }
    /**
     * 最大渐变角速度Z。
     */
    get gradientWMax() {
        return this._gradientWMax;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destGradientAngularVelocity = destObject;
        destGradientAngularVelocity._type = this._type;
        destGradientAngularVelocity._separateAxes = this._separateAxes;
        destGradientAngularVelocity._constant = this._constant;
        this._constantSeparate.cloneTo(destGradientAngularVelocity._constantSeparate);
        this._gradient.cloneTo(destGradientAngularVelocity._gradient);
        this._gradientX.cloneTo(destGradientAngularVelocity._gradientX);
        this._gradientY.cloneTo(destGradientAngularVelocity._gradientY);
        this._gradientZ.cloneTo(destGradientAngularVelocity._gradientZ);
        destGradientAngularVelocity._constantMin = this._constantMin;
        destGradientAngularVelocity._constantMax = this._constantMax;
        this._constantMinSeparate.cloneTo(destGradientAngularVelocity._constantMinSeparate);
        this._constantMaxSeparate.cloneTo(destGradientAngularVelocity._constantMaxSeparate);
        this._gradientMin.cloneTo(destGradientAngularVelocity._gradientMin);
        this._gradientMax.cloneTo(destGradientAngularVelocity._gradientMax);
        this._gradientXMin.cloneTo(destGradientAngularVelocity._gradientXMin);
        this._gradientXMax.cloneTo(destGradientAngularVelocity._gradientXMax);
        this._gradientYMin.cloneTo(destGradientAngularVelocity._gradientYMin);
        this._gradientYMax.cloneTo(destGradientAngularVelocity._gradientYMax);
        this._gradientZMin.cloneTo(destGradientAngularVelocity._gradientZMin);
        this._gradientZMax.cloneTo(destGradientAngularVelocity._gradientZMax);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destGradientAngularVelocity = new GradientAngularVelocity();
        this.cloneTo(destGradientAngularVelocity);
        return destGradientAngularVelocity;
    }
}
