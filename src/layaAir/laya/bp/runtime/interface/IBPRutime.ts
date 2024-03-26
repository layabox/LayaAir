import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "./IRunAble";

export interface IBPRutime {
    //蓝图文件id
    readonly target:string;
    getRunID(): number;
    runByContext(context: IRunAble,runtimeDataMgr: IRuntimeDataManger, node: IExcuteListInfo, enableDebugPause: boolean, cb: Function, runid: number,fromPin:BlueprintPinRuntime,prePin:BlueprintPinRuntime,notRecover?:boolean): boolean;
}