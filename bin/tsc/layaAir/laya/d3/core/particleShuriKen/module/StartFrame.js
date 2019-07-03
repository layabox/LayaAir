/**
 * <code>StartFrame</code> 类用于创建开始帧。
 */
export class StartFrame {
    /**
     * 创建一个 <code>StartFrame,不允许new，请使用静态创建函数。</code> 实例。
     */
    constructor() {
        this._type = 0;
        this._constant = 0;
        this._constantMin = 0;
        this._constantMax = 0;
    }
    /**
     * 通过随机常量旋转创建一个 <code>StartFrame</code> 实例。
     * @param	constant  固定帧。
     * @return 开始帧。
     */
    static createByConstant(constant) {
        var rotationOverLifetime = new StartFrame();
        rotationOverLifetime._type = 0;
        rotationOverLifetime._constant = constant;
        return rotationOverLifetime;
    }
    /**
     *  通过随机双常量旋转创建一个 <code>StartFrame</code> 实例。
     * @param	constantMin 最小固定帧。
     * @param	constantMax 最大固定帧。
     * @return 开始帧。
     */
    static createByRandomTwoConstant(constantMin, constantMax) {
        var rotationOverLifetime = new StartFrame();
        rotationOverLifetime._type = 1;
        rotationOverLifetime._constantMin = constantMin;
        rotationOverLifetime._constantMax = constantMax;
        return rotationOverLifetime;
    }
    /**
     *开始帧类型,0常量模式，1随机双常量模式。
     */
    get type() {
        return this._type;
    }
    /**
     * 固定帧。
     */
    get constant() {
        return this._constant;
    }
    /**
     * 最小固定帧。
     */
    get constantMin() {
        return this._constantMin;
    }
    /**
     * 最大固定帧。
     */
    get constantMax() {
        return this._constantMax;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destStartFrame = destObject;
        destStartFrame._type = this._type;
        destStartFrame._constant = this._constant;
        destStartFrame._constantMin = this._constantMin;
        destStartFrame._constantMax = this._constantMax;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destStartFrame = new StartFrame();
        this.cloneTo(destStartFrame);
        return destStartFrame;
    }
}
