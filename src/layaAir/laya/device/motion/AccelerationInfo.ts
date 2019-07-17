/**
	 * 加速度x/y/z的单位均为m/s²。
	 * 在硬件（陀螺仪）不支持的情况下，alpha、beta和gamma值为null。
	 * 
	 * @author Survivor
	 */
export class AccelerationInfo {
	/**
	 * x轴上的加速度值。
	 */
	x: number;
	/**
	 * y轴上的加速度值。
	 */
	y: number;
	/**
	 * z轴上的加速度值。
	 */
	z: number;

	constructor() {

	}
}

