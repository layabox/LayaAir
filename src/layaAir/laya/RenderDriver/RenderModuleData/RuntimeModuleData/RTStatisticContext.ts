import { DefaultStaticsContext, StatElement } from "../../../layagl/StatisticsContext";
import { NativeMemory } from "./NativeMemory";

export class RTStatisContext extends DefaultStaticsContext {
    private _nativeObj: any;
    protected _stateArrayMemory: NativeMemory;
    protected _timeArrayMemory: NativeMemory;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchRTStatisContext();
        this._nativeObj.setStatShareBuffer(this._stateArrayMemory._buffer);
        this._nativeObj.setTimeShareBuffer(this._timeArrayMemory._buffer);
    }

    protected _createStatBuffer() {
        debugger;
        this._stateArrayMemory = new NativeMemory(StatElement.StatEnd * 4, false);
        this._statArray = this._stateArrayMemory.float32Array;
        this._timeArrayMemory = new NativeMemory(StatElement.StatEnd * 4, false);
        this._timeArray = this._timeArrayMemory.float32Array;
    }
}