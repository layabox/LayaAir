/**
 * @en A class that saves rotation information. Do not modify the properties of this category.
 * @zh 保存旋转信息的类。请勿修改本类的属性。
 * @author Survivor
 */
export class RotationInfo {
    /**
     * @en Indicates whether the device can provide absolute orientation data (toward the Earth coordinate system) or an arbitrary coordinate system determined by the device.
     * For more information about coordinate systems, see (https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained).
     * Note that on iOS, this value is always false. Even so, you can still obtain the correct value from `alpha`.
     * @zh 指示设备是否可以提供绝对方位数据（指向地球坐标系），或者设备决定的任意坐标系。
     * 关于坐标系的更多信息，请参阅 (https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained)。
     * 需要注意的是，在 iOS 环境下，该值始终为 false。即使如此，你依旧可以从 `alpha` 中取得正确的值。
     */
	absolute: boolean;

    /**
     * @en The angle of rotation around the Z-axis, ranging from 0 to 360.
     * If `absolute` is true or on iOS, the `alpha` value represents the angle from north to the current direction of the device.
     * @zh Z轴旋转角度，其值范围从0至360。
     * 若 `absolute` 为 true 或在 iOS 中，`alpha` 值是从北方到当前设备方向的角度值。
     */
	alpha: number;

    /**
     * @en The angle of rotation around the X-axis, ranging from -180 to 180. Represents the front-to-back motion of the device.
     * @zh X轴旋转角度，其值范围从-180至180。代表设备从前至后的运动。
     */
	beta: number;
	
    /**
     * @en The angle of rotation around the Y-axis, ranging from -90 to 90. Represents the left-to-right motion of the device.
     * @zh Y轴旋转角度，其值范围从-90至90。代表设备从左至右的运动。
     */
	gamma: number;

    /**
     * @en The accuracy of the compass data in degrees. Available only on iOS.
     * @zh 罗盘数据的精确度（角度）。仅 iOS 可用。
     */
	compassAccuracy: number;

	constructor() {

	}
}

