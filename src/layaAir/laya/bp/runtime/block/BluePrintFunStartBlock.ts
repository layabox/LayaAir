import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BPType } from "../../datas/types/BlueprintTypes";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintCustomFunReturn } from "../node/BlueprintCustomFunReturn";
import { BlueprintCustomFunStart } from "../node/BlueprintCustomFunStart";
import { BlueprintEventNode } from "../node/BlueprintEventNode";
import { BluePrintEventBlock } from "./BluePrintEventBlock";

export class BluePrintFunStartBlock extends BluePrintEventBlock {
    funEnds: BlueprintCustomFunReturn[] = [];

    funStart:BlueprintCustomFunStart;

    init(event: BlueprintCustomFunStart): void {
        this.funStart = event;
        super.init(event);
        this.excuteList.forEach(value => {
            if (value.type == BPType.CustomFunReturn) {
                this.funEnds.push(value as BlueprintCustomFunReturn);
            }
        })
    }
    //run(context: IRunAble, event: BlueprintEventNode, parms: any[], cb: Function, runId: number, execId: number): boolean 
    runFun(context: IRunAble, eventName: string, parms: any[], cb: Function, runId: number, execId: number, outExcutes: BlueprintPinRuntime[], runner: IBPRutime, oldRuntimeDataMgr: IRuntimeDataManger): boolean {
        let fun = this.funStart;
        if (fun) {
            let runtimeDataMgr = context.getDataMangerByID(this.parentId);
            let curRunId = this.getRunID();
            if (parms) {
                this.funEnds.forEach(value => {
                    value.initData(runtimeDataMgr, curRunId, runId, parms, fun.outPutParmPins.length, outExcutes, runner, oldRuntimeDataMgr);
                })
                fun.initData(runtimeDataMgr, parms, curRunId);
            }
            return this.runByContext(context, runtimeDataMgr, fun, true, cb, curRunId, fun.outExcutes[execId], null);
        }
        return null;
    }
    
}