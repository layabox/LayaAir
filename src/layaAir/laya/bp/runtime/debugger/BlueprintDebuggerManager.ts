import { Laya } from "../../../../Laya";
import { InputManager } from "../../../events/InputManager";

/**
 * 
 * @ brief: BlueprintDebuggerManger
 * @ author: zyh
 * @ data: 2024-01-15 15:40
 */
export class BlueprintDebuggerManager {
    currentStep: any;
    private _debugging: boolean;

    pause(node: any) {
        this.debugging = true;
        this.currentStep = node;
    }

    resume() {
        this.debugging = false;
        this.currentStep.next();
    }

    stepInto() {
        this.currentStep.next();
    }

    stepOver() {
        this.currentStep.next();
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