import { IClone } from "../../../../utils/IClone"

/**
 * @en The Burst class is used to describe the burst of particles.
 * @zh Burst 类用于粒子的爆发描述。
 */
export class Burst implements IClone {
	/** 爆发时间,单位为秒。*/
	private _time: number;
	/** 爆发的最小数量。*/
	private _minCount: number;
	/** 爆发的最大数量。*/
	private _maxCount: number;

	/**
	 * @en The burst time in seconds.
	 * @zh 爆发时间，单位为秒。
	 */
	get time(): number {
		return this._time;
	}

	/**
	 * @en The minimum count of particles in a burst.
	 * @zh 爆发的最小粒子数量。
	 */
	get minCount(): number {
		return this._minCount;
	}

	/**
	 * @en The maximum count of particles in a burst.
	 * @zh 爆发的最大粒子数量。
	 */
	get maxCount(): number {
		return this._maxCount;
	}

	/**
	 * @en Creates an instance of the Burst class.
	 * @param time Burst time in seconds. Default is 0.
	 * @param minCount Minimum count of particles in a burst. Default is 0.
	 * @param maxCount Maximum count of particles in a burst. Default is 0.
	 * @zh 创建Burst类的实例。
	 * @param time 爆发时间,单位为秒。
	 * @param minCount 爆发的最小数量。
	 * @param time 爆发的最大数量。
	 */
	constructor(time: number = 0, minCount: number = 0, maxCount: number = 0) {
		this._time = time;
		this._minCount = minCount;
		this._maxCount = maxCount;
	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: Burst): void {
		destObject._time = this._time;
		destObject._minCount = this._minCount;
		destObject._maxCount = this._maxCount;
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destBurst: Burst = new Burst(this._time, this._minCount, this._maxCount);
		this.cloneTo(destBurst);
		return destBurst;
	}
}