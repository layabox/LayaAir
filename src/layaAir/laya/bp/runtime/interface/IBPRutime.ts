import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { IRunAble } from "./IRunAble";

export interface IBPRutime {
    runByContext(context: IRunAble,runTimeData: IRuntimeDataManger, node: IExcuteListInfo, enableDebugPause: boolean, cb: Function, runid: number): boolean
}