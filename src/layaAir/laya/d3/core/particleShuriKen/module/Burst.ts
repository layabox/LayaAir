import { IClone } from "../../IClone"

/**
 * <code>Burst</code> 类用于粒子的爆裂描述。
 */
export class Burst implements IClone {
	/** 爆裂时间,单位为秒。*/
	private _time: number;
	/** 爆裂的最小数量。*/
	private _minCount: number;
	/** 爆裂的最大数量。*/
	private _maxCount: number;

	/**
	 * 获取爆裂时间,单位为秒。
	 * @return 爆裂时间,单位为秒。
	 */
	get time(): number {
		return this._time;
	}

	/**
	 * 获取爆裂的最小数量。
	 * @return 爆裂的最小数量。
	 */
	get minCount(): number {
		return this._minCount;
	}

	/**
	 * 获取爆裂的最大数量。
	 * @return 爆裂的最大数量。
	 */
	get maxCount(): number {
		return this._maxCount;
	}

	/**
	 * 创建一个 <code>Burst</code> 实例。
	 * @param time 爆裂时间,单位为秒。
	 * @param minCount 爆裂的最小数量。
	 * @param time 爆裂的最大数量。
	 */
	constructor(time: number, minCount: number, maxCount: number) {
		this._time = time;
		this._minCount = minCount;
		this._maxCount = maxCount;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destBurst: Burst = (<Burst>destObject);
		destBurst._time = this._time;
		destBurst._minCount = this._minCount;
		destBurst._maxCount = this._maxCount;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destBurst: Burst = new Burst(this._time, this._minCount, this._maxCount);
		this.cloneTo(destBurst);
		return destBurst;
	}
}

