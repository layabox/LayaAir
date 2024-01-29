import { Laya } from "../../../../Laya";
import { InputManager } from "../../../events/InputManager";
import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
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

    pause(context: BlueprintExcuteDebuggerNode, listInfo: IExcuteListInfo) {
        this.debugging = true;
        this.context = context;
        this.listInfo = listInfo;
    }

    resume() {
        this.debugging = false;
        this.context.next();
    }

    stepOut() {
        const runTimeData = this.context.getDataMangerByID(this.listInfo.listIndex);
        runTimeData.debuggerPause = true;
        this.resume();
    }

    stepInto() {
        this.context.next();
    }

    stepOver() {
        this.context.next();
    }

    clear() {
        this.listInfo = null;
        this.context = null;
        this.debugging = false;
    }

    public get debugging(): boolean {
        return this._debugging;
    }
    public set debugging(value: boolean) {
        if (this._debugging == value) return;
        this._debugging = value;

        Laya.stage.timer.scale = Number(!value);
        // InputManager.keyEventsEnabled = InputManager.mouseEventsEnabled = !value;
    }
}