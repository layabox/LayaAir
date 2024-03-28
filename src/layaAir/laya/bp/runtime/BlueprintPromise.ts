import { IExcuteListInfo } from "../core/interface/IExcuteListInfo";
import { BlueprintPinRuntime } from "./BlueprintPinRuntime";

export class BlueprintPromise implements IExcuteListInfo {
    nid: number;

    enableDebugPause: boolean;

    pin: BlueprintPinRuntime;

    prePin: BlueprintPinRuntime;

    static create(): BlueprintPromise {
        return new BlueprintPromise();
    }

    private _completed: boolean;

    private _callback: (mis: BlueprintPromise) => void;
    /**
    * 等待行为完成回调
    * @param callback 完成回调接口
    */
    wait(callback: (mis: BlueprintPromise) => void): void {
        this._callback = callback;
        if (this._completed) {
            callback(this);
        }
    }

    hasCallBack(): boolean {
        return this._callback != null;
    }

    complete() {
        this._completed = true;
        this._callback && this._callback(this);
    }

    recover() {
        this.clear();
    }

    clear() {
        this._callback = null;
        this._completed = false;
        this.pin = null;
        this.nid = null;
        this.prePin = null;
    }

}