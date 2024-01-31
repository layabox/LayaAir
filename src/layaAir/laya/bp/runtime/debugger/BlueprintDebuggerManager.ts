import { Laya } from "../../../../Laya";
import { InputManager } from "../../../events/InputManager";
import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintExcuteDebuggerNode } from "../action/BlueprintExcuteDebuggerNode";
import { IRunAble } from "../interface/IRunAble";

/**
 * 
 * @ brief: BlueprintDebuggerManger
 * @ author: zyh
 * @ data: 2024-01-15 15:40
 */
export class BlueprintDebuggerManager {
    context: BlueprintExcuteDebuggerNode;
    listInfo: IExcuteListInfo;
    private _debugging: boolean;
    runTimeData: IRuntimeDataManger;

    pause(context: BlueprintExcuteDebuggerNode, listInfo: IExcuteListInfo) {
        this.debugging = true;
        this.context = context;
        this.listInfo = listInfo;
        this.runTimeData = this.context.getDataMangerByID(this.listInfo.listIndex);
    }

    resume() {
        this.debugging = false;
        this.context.next();
    }

    stepOut() {
        this.runTimeData.debuggerPause = true;
        this.resume();
    }

    stepInto() {
        this.context.next();
    }

    stepOver() {
        this.runTimeData.debuggerPause = true;
        this.resume();
    }

    clear() {
        if (this.runTimeData) {
            this.runTimeData.debuggerPause = false;
        }
        this.listInfo = null;
        this.context = null;
        this.debugging = false;
        this.runTimeData = null;
    }

    public get debugging(): boolean {
        return this._debugging;
    }
    public set debugging(value: boolean) {
        if (this._debugging == value) return;
        this._debugging = value;

        if (value) {
            this.startDebugger();
        } else {
            this.stopDebugger();
        }
    }

    _loop: any;
    _originalfun: any;
    _ohandleKeys: any;
    _ohandleMouse: any;
    _ohandleTouch: any;
    startDebugger() {
        this._originalfun = requestAnimationFrame;
        this._ohandleKeys = InputManager.inst.handleKeys;
        this._ohandleMouse = InputManager.inst.handleMouse;
        this._ohandleTouch = InputManager.inst.handleTouch;
        InputManager.inst.handleKeys = this.handleKeys.bind(this);
        InputManager.inst.handleMouse = this.handleMouse.bind(this);
        InputManager.inst.handleTouch = this.handleTouch.bind(this);
        window.requestAnimationFrame = this._requestAnimationFrame.bind(this);
    }

    stopDebugger() {
        if (this._originalfun) {
            window.requestAnimationFrame = this._originalfun;
            window.requestAnimationFrame(this._loop);

            InputManager.inst.handleKeys = this._ohandleKeys;
            InputManager.inst.handleMouse = this._ohandleMouse;
            InputManager.inst.handleTouch = this._ohandleTouch;
        }
        this._originalfun = null;
        this._ohandleKeys = null;
        this._ohandleMouse = null;
        this._ohandleTouch = null;
    }

    private _requestAnimationFrame(callback: any) {
        if (this.debugging) {
            this._loop = callback;
            return null;
        }
        return this._originalfun(callback);
    }

    private handleKeys(ev: KeyboardEvent) {
        if (this.debugging) return;
        this._ohandleKeys(ev);
    }

    private handleMouse(ev: MouseEvent | WheelEvent, type: number) {
        if (this.debugging) return;
        this._ohandleMouse(ev, type);
    }

    private handleTouch(ev: TouchEvent, type: number) {
        if (this.debugging) return;
        this._ohandleTouch(ev, type);
    }
}