import { BPType, TBPCNode, TBPEventProperty, TBPNode, TBPStageData, TBPVarProperty } from "../datas/types/BlueprintTypes";
import { INodeManger } from "../core/interface/INodeManger";

import { BlueprintFactory } from "./BlueprintFactory";
import { BlueprintPinRuntime } from "./BlueprintPinRuntime";
import { BlueprintPromise } from "./BlueprintPromise";
import { IBPRutime } from "./interface/IBPRutime";
import { IRunAble } from "./interface/IRunAble";
import { BlueprintEventNode } from "./node/BlueprintEventNode";
import { BlueprintRuntimeBaseNode } from "./node/BlueprintRuntimeBaseNode";
import { BlueprintCustomFunStart } from "./node/BlueprintCustomFunStart";
import { IExcuteListInfo } from "../core/interface/IExcuteListInfo";
import { BlueprintCustomFunReturn } from "./node/BlueprintCustomFunReturn";
import { IRuntimeDataManger } from "../core/interface/IRuntimeDataManger";
import { BluePrintAsNode } from "./node/BlueprintAsNode";
import { BlueprintUtil } from "../core/BlueprintUtil";
import { BlueprintAutoRun } from "./node/BlueprintAutoRun";
import { BluePrintFunBlock } from "./block/BluePrintFunBlock";
import { BluePrintMainBlock } from "./block/BluePrintMainBlock";


const mainScope = Symbol("mainScope");
export class BlueprintRuntime {
    mainBlock: BluePrintMainBlock;

    funBlockMap: Map<number, BluePrintFunBlock>;

    varMap: Record<string, TBPVarProperty>;

    dataMap: Record<string, TBPVarProperty | TBPEventProperty>;


    constructor() {
        this.mainBlock = new BluePrintMainBlock(mainScope);
        this.funBlockMap = new Map();
    }

    run(context: IRunAble, event: BlueprintEventNode, parms: any[], cb: Function) {
        this.mainBlock.run(context, event, parms, cb, this.mainBlock.getRunID(), -1);
    }

    /**
     * 执行自定义函数
     * @param context 
     * @param funName 
     * @param parms 
     */
    runCustomFun(context: IRunAble, funId: number, parms: any[], cb: Function, runId: number, execId: number, outExcutes: BlueprintPinRuntime[], runner: IBPRutime, oldRuntimeDataMgr: IRuntimeDataManger) {
        let fun = this.funBlockMap.get(funId);
        if (fun) {
            return fun.run(context, null, parms, cb, runId, execId, outExcutes, runner, oldRuntimeDataMgr);
        }
        return null;
    }

    parse(mainBlockData: TBPStageData, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>, newCls: Function) {
        let bpjson: Array<TBPNode> = mainBlockData.arr;
        this.mainBlock.name = mainBlockData.name;
        this.mainBlock.dataMap = this.dataMap;
        this.mainBlock.cls = newCls;
        this.mainBlock.parse(bpjson, getCNodeByNode, {});
    }

    parseFunction(funData: TBPStageData, getCNodeByNode: (node: TBPNode) => TBPCNode) {
        let funId: number = funData.id, bpjson: Array<TBPNode> = funData.arr;
        let fun = new BluePrintFunBlock(funId);
        fun.isStatic = funData.modifiers?.isStatic;
        fun.mainBlock = this.mainBlock;
        fun.name = funData.name;
        fun.dataMap = this.dataMap;
        //TODO Function varMap
        let varMap = {} as Record<string, TBPVarProperty>;
        if (funData.variable) {
            funData.variable.forEach(item => {
                varMap[item.name] = item;
            })
        }
        fun.parse(bpjson, getCNodeByNode, varMap);
        this.funBlockMap.set(funId, fun);
    }

    toCode(context: IRunAble) {
        //         let result = "";
        //         this.eventMap.forEach(item => {
        //             item.outExcute.excute(context);
        //             let code = context.getCode();;
        //             let name = item.name;
        //             let a =
        //                 `this.owner.${name}=function(){
        // ${code}
        // }
        // `
        //             result += a;
        //         })
        //         return result;
    }
}