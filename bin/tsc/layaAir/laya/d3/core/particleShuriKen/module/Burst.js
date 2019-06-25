/**
 * <code>Burst</code> 类用于粒子的爆裂描述。
 */
export class Burst {
    /**
     * 获取爆裂时间,单位为秒。
     * @return 爆裂时间,单位为秒。
     */
    get time() {
        return this._time;
    }
    /**
     * 获取爆裂的最小数量。
     * @return 爆裂的最小数量。
     */
    get minCount() {
        return this._minCount;
    }
    /**
     * 获取爆裂的最大数量。
     * @return 爆裂的最大数量。
     */
    get maxCount() {
        return this._maxCount;
    }
    /**
     * 创建一个 <code>Burst</code> 实例。
     * @param time 爆裂时间,单位为秒。
     * @param minCount 爆裂的最小数量。
     * @param time 爆裂的最大数量。
     */
    constructor(time, minCount, maxCount) {
        this._time = time;
        this._minCount = minCount;
        this._maxCount = maxCount;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destBurst = destObject;
        destBurst._time = this._time;
        destBurst._minCount = this._minCount;
        destBurst._maxCount = this._maxCount;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destBurst = new Burst(this._time, this._minCount, this._maxCount);
        this.cloneTo(destBurst);
        return destBurst;
    }
}
