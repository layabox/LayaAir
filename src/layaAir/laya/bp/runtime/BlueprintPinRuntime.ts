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

    step(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, runner: IBPRutime, runId: number) {
        this.owner.tryExcute(context, runtimeDataMgr, false, runner, false, runId, this);
        //(this.linkTo[0] as PinRuntime).owner.step(context);
    }

    excute(context: IRunAble,runtimeDataMgr: IRuntimeDataManger, runner: IBPRutime) {
        debugger;
        (this.linkTo[0] as BlueprintPinRuntime)?.owner.step(context,runtimeDataMgr, true, runner, true, -1);
    }

    getValueCode(): any {
        return typeof this.value == "string" ? ('"' + this.value + '"') : this.value;
    }
}