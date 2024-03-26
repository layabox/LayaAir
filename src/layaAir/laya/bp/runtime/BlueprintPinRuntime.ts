import { BlueprintPin } from "../core/BlueprintPin";
import { IRuntimeDataManger } from "../core/interface/IRuntimeDataManger";
import { IBPRutime } from "./interface/IBPRutime";
import { IRunAble } from "./interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./node/BlueprintRuntimeBaseNode";

export class BlueprintPinRuntime extends BlueprintPin {
    /**
     * 所属节点
    */
    owner: BlueprintRuntimeBaseNode;

    step(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, runner: IBPRutime, runId: number, prePin: BlueprintPinRuntime) {
        return this.owner.tryExcute(context, runtimeDataMgr, false, runner, true, runId, this, prePin);
        //(this.linkTo[0] as PinRuntime).owner.step(context);
    }

    excute(context: IRunAble,runtimeDataMgr: IRuntimeDataManger, runner: IBPRutime,runId: number) {
        const nextPin = (this.linkTo[0] as BlueprintPinRuntime);
        const index = nextPin?.owner.step(context,runtimeDataMgr, true, runner, true, runId, nextPin, this) as BlueprintPinRuntime;
        // return index.linkTo[0];
        return index;
    }

    getValueCode(): any {
        return typeof this.value == "string" ? ('"' + this.value + '"') : this.value;
    }
}