import { Vector3 } from "../../../math/Vector3";
/**
 * <code>Emission</code> 类用于粒子发射器。
 */
export class Emission {
    /**
     * 设置粒子发射速率。
     * @param emissionRate 粒子发射速率 (个/秒)。
     */
    set emissionRate(value) {
        if (value < 0)
            throw new Error("ParticleBaseShape:emissionRate value must large or equal than 0.");
        this._emissionRate = value;
    }
    /**
     * 获取粒子发射速率。
     * @return 粒子发射速率 (个/秒)。
     */
    get emissionRate() {
        return this._emissionRate;
    }
    /**
     * 获取是否已销毁。
     * @return 是否已销毁。
     */
    get destroyed() {
        return this._destroyed;
    }
    /**
     * 创建一个 <code>Emission</code> 实例。
     */
    constructor() {
        this._destroyed = false;
        this.emissionRate = 10;
        this._bursts = [];
    }
    /**
     * @private
     */
    destroy() {
        this._bursts = null;
        this._destroyed = true;
    }
    /**
     * 获取粒子爆裂个数。
     * @return 粒子爆裂个数。
     */
    getBurstsCount() {
        return this._bursts.length;
    }
    /**
     * 通过索引获取粒子爆裂。
     * @param index 爆裂索引。
     * @return 粒子爆裂。
     */
    getBurstByIndex(index) {
        return this._bursts[index];
    }
    /**
     * 增加粒子爆裂。
     * @param burst 爆裂。
     */
    addBurst(burst) {
        var burstsCount = this._bursts.length;
        if (burstsCount > 0)
            for (var i = 0; i < burstsCount; i++) {
                if (this._bursts[i].time > burst.time)
                    this._bursts.splice(i, 0, burst);
            }
        this._bursts.push(burst);
    }
    /**
     * 移除粒子爆裂。
     * @param burst 爆裂。
     */
    removeBurst(burst) {
        var index = this._bursts.indexOf(burst);
        if (index !== -1) {
            this._bursts.splice(index, 1);
        }
    }
    /**
     * 通过索引移除粒子爆裂。
     * @param index 爆裂索引。
     */
    removeBurstByIndex(index) {
        this._bursts.splice(index, 1);
    }
    /**
     * 清空粒子爆裂。
     */
    clearBurst() {
        this._bursts.length = 0;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destEmission = destObject;
        var destBursts = destEmission._bursts;
        destBursts.length = this._bursts.length;
        for (var i = 0, n = this._bursts.length; i < n; i++) {
            var destBurst = destBursts[i];
            if (destBurst)
                this._bursts[i].cloneTo(destBurst);
            else
                destBursts[i] = this._bursts[i].clone();
        }
        destEmission._emissionRate = this._emissionRate;
        destEmission.enbale = this.enbale;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destEmission = new Vector3();
        this.cloneTo(destEmission);
        return destEmission;
    }
}
