import { GeolocationInfo } from "../../laya/device/geolocation/GeolocationInfo";
import { ClassUtils } from "../../laya/utils/ClassUtils";
import { ILaya } from "../../ILaya";
import type { DeviceAdapter } from '../../laya/device/DeviceAdapter';
import { PAL } from "../../laya/platform/PlatformAdapters";

let BaseClass: typeof DeviceAdapter = ClassUtils.getClass("PAL.Device");
if (!BaseClass)
    BaseClass = <any>Object;

var mg: WechatMinigame.Wx;

export class MgDeviceAdapter extends BaseClass {
    private _watchDic: Map<number, { successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number; message: string }) => void }>;
    private _watchId: number = 1;
    private _watchOptions: PositionOptions;

    constructor() {
        super();
        this._watchDic = new Map();
        mg = PAL.global;
    }

    get supportedLocation(): boolean {
        return true;
    }

    get supportedGetUserMedia(): boolean {
        return false;
    }

    getCurrentPosition(successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number, message: string }) => void, options?: PositionOptions): void {
        if (mg.getFuzzyLocation)
            mg.getFuzzyLocation({
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
            mg.getLocation({
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
        mg.startAccelerometer({ interval: "game" });
        mg.onAccelerometerChange(res => {
            Object.assign(this._accInfo, res);
            Object.assign(this._accInfo2, res);
            this.event("devicemotion", [this._accInfo, this._accInfo2, {}, 0]);
        });
    }

    protected startListeningDeviceOrientation(): void {
        mg.startGyroscope({ interval: "game" });
        mg.onGyroscopeChange(res => {
            this._rotInfo2.alpha = res.z;
            this._rotInfo2.beta = res.x;
            this._rotInfo2.gamma = res.y;
            this.event("deviceorientation", [true, this._rotInfo2]);
        });
    }
}

if (BaseClass)
    ClassUtils.regClass("PAL.Device", MgDeviceAdapter);