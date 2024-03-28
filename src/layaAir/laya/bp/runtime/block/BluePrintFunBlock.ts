import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { TBPNode, BPType, TBPCNode, TBPVarProperty } from "../../datas/types/BlueprintTypes";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";

import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintCustomFunStart } from "../node/BlueprintCustomFunStart";
import { EBlockSource } from "./BluePrintBlock";
import { BluePrintComplexBlock } from "./BluePrintComplexBlock";
import { BluePrintFunStartBlock } from "./BluePrintFunStartBlock";
import { BluePrintMainBlock } from "./BluePrintMainBlock";

export class BluePrintFunBlock extends BluePrintComplexBlock {
    mainBlock: BluePrintMainBlock;

    funStart: BlueprintCustomFunStart;

    isStatic: boolean;

    funBlock:BluePrintFunStartBlock;

    get bpId(): string {
        return this.mainBlock.name;
    }

    get blockSourceType(): EBlockSource {
        return EBlockSource.Function;
    }

    optimize() {
        super.optimize();
        //this.optimizeByStart(this.funStart, this.excuteList);
        this.funBlock=new BluePrintFunStartBlock(this.id);
        this.funBlock.init(this.funStart);
        this.funBlock.optimizeByBlockMap(this);
    }
    protected onParse(bpjson: TBPNode[]) {
        this.funStart = this.getNodeById(bpjson[0].id) as BlueprintCustomFunStart;
        
    }

    parse(bpjson: TBPNode[], getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>): void {
        super.parse(bpjson, getCNodeByNode, varMap);
        this.funStart = this.getNodeById(bpjson[0].id) as BlueprintCustomFunStart;
    }

    run(context: IRunAble, eventName: string, parms: any[], cb: Function, runId: number, execId: number, outExcutes: BlueprintPinRuntime[], runner: IBPRutime, oldRuntimeDataMgr: IRuntimeDataManger): boolean {
        context.initData(this.id, this.nodeMap, this.localVarMap);
        return this.funBlock.runFun(context, eventName, parms, cb, runId, execId, outExcutes, runner, oldRuntimeDataMgr);
    }
}