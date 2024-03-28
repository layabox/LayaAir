import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { EBlockSource } from "../block/BluePrintBlock";
import { BlueprintEventNode } from "../node/BlueprintEventNode";
import { IRunAble } from "./IRunAble";

export interface IBPRutime {
    readonly blockSourceType:EBlockSource;
    //蓝图文件id
    readonly bpId:string;
    getDataMangerByID(context:IRunAble): IRuntimeDataManger;
    getRunID(): number;
    runAnonymous(context: IRunAble, event: BlueprintEventNode, parms: any[], cb: Function, runId: number, execId: number, newRunId: number, oldRuntimeDataMgr: IRuntimeDataManger): boolean;
    runByContext(context: IRunAble,runtimeDataMgr: IRuntimeDataManger, node: IExcuteListInfo, enableDebugPause: boolean, cb: Function, runid: number,fromPin:BlueprintPinRuntime,prePin:BlueprintPinRuntime,notRecover?:boolean): boolean;
}