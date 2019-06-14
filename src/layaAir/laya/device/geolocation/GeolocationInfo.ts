export class GeolocationInfo {
	private pos: any;
	private coords: any;

	setPosition(pos: any): void {
		this.pos = pos;
		this.coords = pos.coords;
	}

	get latitude(): number {
		return this.coords.latitude;
	}

	get longitude(): number {
		return this.coords.longitude;
	}

	get altitude(): number {
		return this.coords.altitude;
	}

	get accuracy(): number {
		return this.coords.accuracy;
	}

	get altitudeAccuracy(): number {
		return this.coords.altitudeAccuracy;
	}

	get heading(): number {
		return this.coords.heading;
	}

	get speed(): number {
		return this.coords.speed;
	}

	get timestamp(): number {
		return this.pos.timestamp;
	}
}

