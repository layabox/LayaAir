export class GeolocationInfo {
	private pos: any;
	private coords: any;

	/**
	 * 设置设备经纬度
	 * @param pos 
	 */
	setPosition(pos: any): void {
		this.pos = pos;
		this.coords = pos.coords;
	}

	/**
	 * 获取设备当前地理坐标的纬度
	 */
	get latitude(): number {
		return this.coords.latitude;
	}

	/**
	 * 获取设备当前地理坐标的经度
	 */
	get longitude(): number {
		return this.coords.longitude;
	}

	/**
	 * 获取设备当前地理坐标的高度
	 */
	get altitude(): number {
		return this.coords.altitude;
	}

	/**
	 * 获取设备当前地理坐标的精度
	 */
	get accuracy(): number {
		return this.coords.accuracy;
	}

	/**
	 * 获取设备当前地理坐标的高度精度
	 */
	get altitudeAccuracy(): number {
		return this.coords.altitudeAccuracy;
	}

	/**
	 * 获取设备当前行进方向
	 */
	get heading(): number {
		return this.coords.heading;
	}

	/**
	 * 获取设备当前的速度
	 */
	get speed(): number {
		return this.coords.speed;
	}

	/**
	 * 获取设备得到当前位置的时间
	 */
	get timestamp(): number {
		return this.pos.timestamp;
	}
}

