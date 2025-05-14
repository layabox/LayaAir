/**
 * @en Represents geolocation information for a device.
 * @zh 表示设备的地理位置信息。
 */
export interface GeolocationInfo {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/GeolocationPosition/timestamp) */
    timestamp: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/GeolocationCoordinates/time) */
    accuracy?: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/GeolocationCoordinates/altitude) */
    altitude?: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/GeolocationCoordinates/altitudeAccuracy) */
    altitudeAccuracy?: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/GeolocationCoordinates/heading) */
    heading?: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/GeolocationCoordinates/latitude) */
    latitude: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/GeolocationCoordinates/longitude) */
    longitude: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/GeolocationCoordinates/speed) */
    speed?: number;
}

