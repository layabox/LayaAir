import { BlueprintPin } from "../../core/BlueprintPin";
import { IOutParm } from "../../core/interface/IOutParm";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { RuntimeNodeData } from "../action/RuntimeNodeData";
import { BlueprintPromise } from "../BlueprintPromise";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintCustomFunReturn extends BlueprintRuntimeBaseNode {
    step(context: IRunAble, runTimeData: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number): number | BlueprintPromise {
        let result = super.step(context, runTimeData, fromExcute, runner, enableDebugPause, runId);
        let nodeContext = runTimeData.getDataById(this.nid) as BlueprintCustomFunReturnContext;
        nodeContext.returnResult(runId);
        return result;
    }

    initData(runTimeData: IRuntimeDataManger, curRunId: number, runId: number, parms: any[], offset: number) {
        let data = runTimeData.getDataById(this.nid) as BlueprintCustomFunReturnContext;
        data.initData(curRunId, runId, parms, offset);
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

    initData(curRunId: number, runId: number, parms: any[], offset: number) {
        let result: any[] = [];
        this.returnMap.set(curRunId, result);
        this.runIdMap.set(curRunId, runId);
        for (let i = offset; i < parms.length; i++) {
            result.push(parms[i]);
        }
    }

    returnResult(runId: number) {
        let result = this.returnMap.get(runId);
        let curRunId = this.runIdMap.get(runId);
        if (result) {
            result.forEach((parm, index) => {
                parm.setValue(curRunId, this.getParamsArray(runId)[index]);
            })
        }
    }
}