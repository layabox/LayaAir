import { type GeolocationInfo } from "../device/geolocation/GeolocationInfo";
import { EventDispatcher } from "../events/EventDispatcher";
import { PAL } from "./PlatformAdapters";

/**
 * @ignore
 */
export class DeviceAdapter extends EventDispatcher {

    get supportedLocation(): boolean {
        return false;
    }

    get supportedGetUserMedia(): boolean {
        return false;
    }

    getCurrentPosition(successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number, message: string }) => void, options?: PositionOptions): void {

    }

    watchPosition(successCallback: (info: GeolocationInfo) => void, errorCallback?: (err: { code: number, message: string }) => void, options?: PositionOptions): number {
        return -1;
    }

    clearWatchPosition(id: number): void {
    }

    getUserMedia(constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback?: (err: Error) => void): void {

    }

    protected onStartListeningToType(type: string) {
        if (type === "devicemotion")
            this.startListeningDeviceMotion();
        else if (type === "deviceorientation")
            this.startListeningDeviceOrientation();
        return this;
    }

    protected startListeningDeviceMotion() {
    }

    protected startListeningDeviceOrientation() {
    }
}

PAL.register("device", DeviceAdapter);