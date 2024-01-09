import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { RuntimeNodeData } from "../action/RuntimeNodeData";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { IBPRutime } from "./IBPRutime";

export interface IRunAble {
    debuggerPause:boolean;

    pushBack(excuteNode:IExcuteListInfo):void;

    readonly vars: { [key: string]: any };

    beginExcute(runtimeNode: BlueprintRuntimeBaseNode,runner:IBPRutime,enableDebugPause:boolean): boolean;

    endExcute(runtimeNode: BlueprintRuntimeBaseNode): void;

    parmFromOtherPin(current: BlueprintPinRuntime, from: BlueprintPinRuntime, parmsArray: any[]): void;

    parmFromSelf(current: BlueprintPinRuntime, parmsArray: any[]): void;

    parmFromOutPut(outPutParmPins: BlueprintPinRuntime[], parmsArray: any[]): void;

    parmFromCustom(parmsArray: any[], parm: any, parmname: string): void;

    excuteFun(nativeFun: Function, outPutParmPins: BlueprintPinRuntime[],caller:any, parmsArray: any[]): any;

    getCode(): string;

    getVar(name: string): any;

    setVar(name: string, value: any):void;

    reCall(index:number):void;

    getSelf():any;

    initData(nodeMap:Map<number,BlueprintRuntimeBaseNode>):void;

    getDataById(nid:number):RuntimeNodeData;

    setPinData(pin: BlueprintPinRuntime,value:any):void;
}