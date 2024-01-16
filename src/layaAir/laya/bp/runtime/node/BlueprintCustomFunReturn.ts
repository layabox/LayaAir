import { IOutParm } from "../../core/interface/IOutParm";
import { RuntimeNodeData } from "../action/RuntimeNodeData";
import { BlueprintPromise } from "../BlueprintPromise";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintCustomFunReturn extends BlueprintRuntimeBaseNode {
    step(context: IRunAble, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number): number | BlueprintPromise {
        let result = super.step(context, fromExcute, runner, enableDebugPause, runId);
        let nodeContext = context.getDataById(this.nid) as BlueprintCustomFunReturnContext;
        nodeContext.returnResult(runId);
        return result;
    }

}

export class BlueprintCustomFunReturnContext extends RuntimeNodeData {
    returnMap: Map<number, IOutParm[]>
    runIdMap: Map<number, number>;
    constructor() {
        super();
        this.returnMap = new Map();
        this.runIdMap = new Map();
    }

    returnResult(runId: number) {
        let result = this.returnMap.get(runId);
        let curRunId=this.runIdMap.get(runId);
        if (result) {
            result.forEach((parm, index) => {
                parm.setValue(curRunId, this.getParamsArray(runId)[index]);
            })
        }

    }
}