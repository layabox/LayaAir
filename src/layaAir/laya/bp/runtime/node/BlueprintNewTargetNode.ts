import { BlueprintUtil } from "../../core/BlueprintUtil";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { TBPCNode } from "../../datas/types/BlueprintTypes";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintPromise } from "../BlueprintPromise";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintNewTargetNode extends BlueprintRuntimeBaseNode {
    cls: ClassDecorator;

    parse(def: TBPCNode) {
        super.parse(def);
        this.cls = BlueprintUtil.getClass(def.target);
        if (!this.cls) {
            console.warn("regclass not find " + def.target);
        }
    }

    step(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime): BlueprintPinRuntime | BlueprintPromise {
        let _parmsArray: any[] = this.colloctParam(context, runtimeDataMgr, this.inPutParmPins, runner, runId);
        //context.parmFromOutPut(this.outPutParmPins, runtimeDataMgr, _parmsArray);

        let result = Reflect.construct(this.cls, _parmsArray);

        runtimeDataMgr.setPinData(this.outPutParmPins[0], result, runId);
        if (fromExcute) {
            context.endExcute(this);
        }
        return this.next(context, runtimeDataMgr, _parmsArray, runner, enableDebugPause, runId, fromPin);
    }
}