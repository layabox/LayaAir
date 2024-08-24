/**
 * @en Acceleration info, The unit of acceleration x/y/z is m/s ².
 * If the hardware (gyroscope) does not support it, the values for alpha, beta, and gamma will be null.
 * @zh 加速计信息，重力加速度x/y/z的单位均为m/s²。
 * 如果硬件（陀螺仪）不支持，则 alpha、beta 和 gamma 的值将为 null。
 */
export class AccelerationInfo {
    /**
     * @en The acceleration value along the x-axis.
     * @zh x 轴上的加速度值。
     */
	x: number;
    /**
     * @en The acceleration value along the y-axis.
     * @zh y 轴上的加速度值。
     */
	y: number;
    /**
     * @en The acceleration value along the z-axis.
     * @zh z 轴上的加速度值。
     */
	z: number;

	constructor() {

	}
}

