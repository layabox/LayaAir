import { GeolocationInfo } from "../../laya/device/geolocation/GeolocationInfo";
import { ILaya } from "../../ILaya";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { DeviceAdapter } from "../../laya/platform/DeviceAdapter";
import { RotationInfo } from "../../laya/device/motion/RotationInfo";
import { AccelerationInfo } from "../../laya/device/motion/AccelerationInfo";

export class MgDeviceAdapter extends DeviceAdapter {
    private _watchDic: Map<number, { successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number; message: string }) => void }>;
    private _watchId: number = 1;
    private _watchOptions: PositionOptions;

    private _accInfo: AccelerationInfo;
    private _rotInfo: RotationInfo;

    constructor() {
        super();

        this._watchDic = new Map();
        this._accInfo = { x: 0, y: 0, z: 0 };
        this._rotInfo = { alpha: 0, beta: 0, gamma: 0, absolute: false, compassAccuracy: 0 };
    }

    get supportedLocation(): boolean {
        return !!(PAL.g.getFuzzyLocation || PAL.g.getLocation);
    }

    getCurrentPosition(successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number, message: string }) => void, options?: PositionOptions): void {
        if (PAL.g.getFuzzyLocation)
            PAL.g.getFuzzyLocation({
                type: 'gcj02',
                success: (res) => {
                    successCallback({
                        latitude: res.latitude,
                        longitude: res.longitude,
                        timestamp: Date.now()
                    });
                },
                fail: (err) => {
                    errorCallback?.({ code: 1, message: err.errMsg });
                }
            });
        else {
            PAL.g.getLocation({
                type: 'gcj02',
                success: (res) => {
                    successCallback({
                        latitude: res.latitude,
                        longitude: res.longitude,
                        speed: res.speed,
                        altitude: res.altitude,
                        accuracy: res.accuracy,
                        timestamp: Date.now()
                    });
                },
                fail: (err) => {
                    errorCallback?.({ code: 1, message: err.errMsg });
                }
            });
        }
    }

    watchPosition(successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number; message: string; }) => void, options?: PositionOptions): number {
        if (this._watchDic.size === 0) {
            ILaya.systemTimer.loop(1000, this, this.onUpdate);
            this._watchOptions = options;
        }
        this._watchId++;
        this._watchDic.set(this._watchId, { successCallback, errorCallback });
        return this._watchId;
    }

    clearWatchPosition(id: number): void {
        this._watchDic.delete(id);
        if (this._watchDic.size === 0) {
            ILaya.systemTimer.clear(this, this.onUpdate);
            this._watchOptions = null;
        }
    }

    private onUpdate() {
        let callbacks = Array.from(this._watchDic.values());
        this.getCurrentPosition(
            info => callbacks.forEach(callback => callback.successCallback(info)),
            err => callbacks.forEach(callback => callback.errorCallback?.(err)),
            this._watchOptions
        );
    }

    protected startListeningDeviceMotion() {
        PAL.g.startAccelerometer({ interval: "game" });
        PAL.g.onAccelerometerChange(res => {
            Object.assign(this._accInfo, res);
            this.event("devicemotion", [this._accInfo, this._accInfo, {}, 0]);
        });
    }

    protected startListeningDeviceOrientation(): void {
        PAL.g.startGyroscope({ interval: "game" });
        PAL.g.onGyroscopeChange(res => {
            this._rotInfo.alpha = res.z;
            this._rotInfo.beta = res.x;
            this._rotInfo.gamma = res.y;
            this.event("deviceorientation", [true, this._rotInfo]);
        });
    }
}

PAL.register("device", MgDeviceAdapter);