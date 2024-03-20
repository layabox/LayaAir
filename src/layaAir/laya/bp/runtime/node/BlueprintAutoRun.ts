import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintAutoRun extends BlueprintRuntimeBaseNode {

    protected colloctParam(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, inputPins: BlueprintPinRuntime[], runner: IBPRutime, runId: number) {
        let _parmsArray: any[] = runtimeDataMgr.getDataById(this.nid).getParamsArray(runId);;
        _parmsArray.length = 0;
        for (let i = 0, n = inputPins.length; i < n; i++) {
            const curInput = inputPins[i];
            let from = curInput.linkTo[0];
            if (from) {
                let fowner = (from as BlueprintPinRuntime).owner;
                if (!context.getCacheAble(fowner, runId)) {
                    (from as BlueprintPinRuntime).step(context, runtimeDataMgr, runner, runId);
                    context.setCacheAble(fowner, runId, true);
                }
                context.parmFromOtherPin(curInput, runtimeDataMgr, from as BlueprintPinRuntime, _parmsArray, runId);
            }
            else {
                context.parmFromSelf(curInput, runtimeDataMgr, _parmsArray, runId);
            }
        }
        context.readCache = false;
        return _parmsArray;
    }

}