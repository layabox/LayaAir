/**
 * @en Represents geolocation information for a device.
 * @zh 表示设备的地理位置信息。
 */
export class GeolocationInfo {
	private pos: any;
	private coords: any;

	/**
	 * @en Sets the device's latitude and longitude.
	 * @param pos The position object containing latitude and longitude data.
	 * @zh 设置设备的经纬度。
	 * @param pos 包含纬度和经度数据的位置对象。
	 */
	setPosition(pos: any): void {
		this.pos = pos;
		this.coords = pos.coords;
	}

	/**
	 * @en The latitude of the device's current geographical coordinates.
	 * @zh 设备当前地理坐标的纬度。
	 */
	get latitude(): number {
		return this.coords.latitude;
	}

	/**
	 * @en The longitude of the device's current geographical coordinates.
	 * @zh 设备当前地理坐标的经度。
	 */
	get longitude(): number {
		return this.coords.longitude;
	}

	/**
	 * @en The altitude of the device's current geographical coordinates.
	 * @zh 设备当前地理坐标的高度。
	 */
	get altitude(): number {
		return this.coords.altitude;
	}

	/**
	 * @en The accuracy of the device's current geographical coordinates.
	 * @zh 设备当前地理坐标的精度。
	 */
	get accuracy(): number {
		return this.coords.accuracy;
	}

	/**
	 * @en The altitude accuracy of the device's current geographical coordinates.
	 * @zh 设备当前地理坐标的高度精度。
	 */
	get altitudeAccuracy(): number {
		return this.coords.altitudeAccuracy;
	}

	/**
	 * @en The heading direction of the device's current travel.
	 * @zh 设备当前行进方向。
	 */
	get heading(): number {
		return this.coords.heading;
	}

	/**
	 * @en The current speed of the device.
	 * @zh 设备当前的速度。
	 */
	get speed(): number {
		return this.coords.speed;
	}

	/**
	 * @en The timestamp when the device obtained its current position.
	 * @zh 设备得到当前位置的时间。
	 */
	get timestamp(): number {
		return this.pos.timestamp;
	}
}

