import { DeviceAdapter } from "../platform/DeviceAdapter";
import { PAL } from "../platform/PlatformAdapters";
import { Browser } from "../utils/Browser";
import { GeolocationInfo } from "./geolocation/GeolocationInfo";
import { AccelerationInfo } from "./motion/AccelerationInfo";
import { RotationInfo } from "./motion/RotationInfo";

/**
 * @ignore
 */
export class WebDeviceAdapter extends DeviceAdapter {
    protected _loc: Geolocation;
    protected _getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;

    protected _locInfo: GeolocationInfo;
    protected _accInfo: AccelerationInfo;
    protected _accInfo2: AccelerationInfo;
    protected _rotInfo: RotationInfo;
    protected _rotInfo2: RotationInfo;

    constructor() {
        super();

        this._locInfo = { timestamp: 0, accuracy: 0, altitude: 0, altitudeAccuracy: 0, heading: 0, latitude: 0, longitude: 0, speed: 0 };
        this._accInfo = { x: 0, y: 0, z: 0 };
        this._accInfo2 = Object.assign({}, this._accInfo);
        this._rotInfo = { alpha: 0, beta: 0, gamma: 0, absolute: false, compassAccuracy: 0 };
        this._rotInfo2 = Object.assign({}, this._rotInfo);

        let navigator = Browser.window.navigator;
        if (navigator) {
            this._loc = navigator.geolocation;
            this._getUserMedia = navigator.mediaDevices?.getUserMedia || (navigator as any).getUserMedia;
        }
    }

    get supportedLocation(): boolean {
        return !!this._loc;
    }

    get supportedGetUserMedia(): boolean {
        return !!this._getUserMedia;
    }

    getCurrentPosition(successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number, message: string }) => void, options?: PositionOptions): void {
        if (this._loc)
            this._loc.getCurrentPosition(
                (pos: GeolocationPosition) => {
                    Object.assign(this._locInfo, pos.coords);
                    this._locInfo.timestamp = pos.timestamp;
                    successCallback(this._locInfo);
                },
                (error: GeolocationPositionError) => errorCallback?.(error),
                options
            );
        else if (errorCallback)
            errorCallback(unsupportedError);
    }

    watchPosition(successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number, message: string }) => void, options?: PositionOptions): number {
        if (this._loc)
            return this._loc.watchPosition(
                (pos: GeolocationPosition) => {
                    Object.assign(this._locInfo, pos.coords);
                    this._locInfo.timestamp = pos.timestamp;
                    successCallback(this._locInfo);
                },
                (error: GeolocationPositionError) => errorCallback?.(error),
                options
            );
        else if (errorCallback) {
            errorCallback(unsupportedError);
            return -1;
        }
        else
            return -1;
    }

    clearWatchPosition(id: number): void {
        if (this._loc)
            this._loc.clearWatch(id);
    }

    getUserMedia(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback?: (err: Error) => void): void {
        if (this._getUserMedia) {
            this._getUserMedia(constraints).then(stream => successCallback(stream))
                .catch((error: Error) => errorCallback?.(error));
        }
        else
            errorCallback?.(new Error("getUserMedia is not supported."));
    }

    protected startListeningDeviceMotion() {
        Browser.window.addEventListener("devicemotion", e => this.onDeviceMotion(e));
    }

    protected startListeningDeviceOrientation() {
        Browser.window.addEventListener("deviceorientation", e => this.onDeviceOrientation(e));
    }

    protected onDeviceMotion(e: DeviceMotionEvent) {
        this._accInfo.x = e.acceleration.x;
        this._accInfo.y = e.acceleration.y;
        this._accInfo.z = e.acceleration.z;

        this._accInfo2.x = e.accelerationIncludingGravity.x;
        this._accInfo2.y = e.accelerationIncludingGravity.y;
        this._accInfo2.z = e.accelerationIncludingGravity.z;

        this._rotInfo.alpha = e.rotationRate.gamma * -1;
        this._rotInfo.beta = e.rotationRate.alpha * -1;
        this._rotInfo.gamma = e.rotationRate.beta;

        let interval = e.interval;

        if (Browser.onAndroid) {
            if (Browser.userAgent.indexOf("Chrome") > -1) {
                this._rotInfo.alpha *= 180 / Math.PI;
                this._rotInfo.beta *= 180 / Math.PI;
                this._rotInfo.gamma *= 180 / Math.PI;
            }

            this._accInfo.x *= -1;
            this._accInfo2.x *= -1;
        }
        else if (Browser.onIOS) {
            this._accInfo.y *= -1;
            this._accInfo.z *= -1;

            this._accInfo2.y *= -1;
            this._accInfo2.z *= -1;

            interval *= 1000;
        }

        this.event("devicemotion", [this._accInfo, this._accInfo2, this._rotInfo, e.interval]);
    }

    protected onDeviceOrientation(e: DeviceOrientationEvent) {
        this._rotInfo2.alpha = e.alpha;
        this._rotInfo2.beta = e.beta;
        this._rotInfo2.gamma = e.gamma;

        // 在Safari中
        if ((e as any).webkitCompassHeading) {
            this._rotInfo2.alpha = (e as any).webkitCompassHeading * -1;
            this._rotInfo2.compassAccuracy = (e as any).webkitCompassAccuracy;
        }

        this.event("deviceorientation", [e.absolute, this._rotInfo2]);
    }
}

const unsupportedError: any = { code: 9, message: "Geolocation is not supported." };

PAL.register("device", WebDeviceAdapter);