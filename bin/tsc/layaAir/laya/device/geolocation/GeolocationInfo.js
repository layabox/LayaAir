export class GeolocationInfo {
    setPosition(pos) {
        this.pos = pos;
        this.coords = pos.coords;
    }
    get latitude() {
        return this.coords.latitude;
    }
    get longitude() {
        return this.coords.longitude;
    }
    get altitude() {
        return this.coords.altitude;
    }
    get accuracy() {
        return this.coords.accuracy;
    }
    get altitudeAccuracy() {
        return this.coords.altitudeAccuracy;
    }
    get heading() {
        return this.coords.heading;
    }
    get speed() {
        return this.coords.speed;
    }
    get timestamp() {
        return this.pos.timestamp;
    }
}
