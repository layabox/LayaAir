import { GradientVelocity } from "././GradientVelocity";
/**
 * <code>VelocityOverLifetime</code> 类用于粒子的生命周期速度。
 */
export class VelocityOverLifetime {
    /**
     * 创建一个 <code>VelocityOverLifetime</code> 实例。
     */
    constructor(velocity) {
        /**是否启用*/
        this.enbale = false;
        /**速度空间,0为local,1为world。*/
        this.space = 0;
        this._velocity = velocity;
    }
    /**
     *获取尺寸。
     */
    get velocity() {
        return this._velocity;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destVelocityOverLifetime = destObject;
        this._velocity.cloneTo(destVelocityOverLifetime._velocity);
        destVelocityOverLifetime.enbale = this.enbale;
        destVelocityOverLifetime.space = this.space;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destVelocity;
        switch (this._velocity.type) {
            case 0:
                destVelocity = GradientVelocity.createByConstant(this._velocity.constant.clone());
                break;
            case 1:
                destVelocity = GradientVelocity.createByGradient(this._velocity.gradientX.clone(), this._velocity.gradientY.clone(), this._velocity.gradientZ.clone());
                break;
            case 2:
                destVelocity = GradientVelocity.createByRandomTwoConstant(this._velocity.constantMin.clone(), this._velocity.constantMax.clone());
                break;
            case 3:
                destVelocity = GradientVelocity.createByRandomTwoGradient(this._velocity.gradientXMin.clone(), this._velocity.gradientYMin.clone(), this._velocity.gradientZMin.clone(), this._velocity.gradientXMax.clone(), this._velocity.gradientYMax.clone(), this._velocity.gradientZMax.clone());
                break;
        }
        var destVelocityOverLifetime = new VelocityOverLifetime(destVelocity);
        destVelocityOverLifetime.enbale = this.enbale;
        destVelocityOverLifetime.space = this.space;
        return destVelocityOverLifetime;
    }
}
