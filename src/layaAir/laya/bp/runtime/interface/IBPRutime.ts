import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { IRunAble } from "./IRunAble";

export interface IBPRutime {
    runByContext(context: IRunAble, node: IExcuteListInfo, enableDebugPause: boolean, cb: Function, runid: number): void
}