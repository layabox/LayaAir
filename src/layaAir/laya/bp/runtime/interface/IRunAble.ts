import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { RuntimeNodeData } from "../action/RuntimeNodeData";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { IBPRutime } from "./IBPRutime";

export interface IRunAble {
    debuggerPause: boolean;

    pushBack(excuteNode: IExcuteListInfo): void;

    readonly vars: { [key: string]: any };

    beginExcute(runtimeNode: BlueprintRuntimeBaseNode, runner: IBPRutime, enableDebugPause: boolean): boolean;

    endExcute(runtimeNode: BlueprintRuntimeBaseNode): void;

    parmFromOtherPin(current: BlueprintPinRuntime, from: BlueprintPinRuntime, parmsArray: any[],runId:number): void;

    parmFromSelf(current: BlueprintPinRuntime, parmsArray: any[],runId:number): void;

    parmFromOutPut(outPutParmPins: BlueprintPinRuntime[], parmsArray: any[]): void;

    parmFromCustom(parmsArray: any[], parm: any, parmname: string): void;

    excuteFun(nativeFun: Function, outPutParmPins: BlueprintPinRuntime[], caller: any, parmsArray: any[],runId:number): any;

    getCode(): string;

    getVar(name: string): any;

    setVar(name: string, value: any): void;

    reCall(index: number): void;

    getSelf(): any;

    initData(key: number | Symbol, nodeMap: Map<number, BlueprintRuntimeBaseNode>): void;

    getDataById(nid: number): RuntimeNodeData;

    setPinData(pin: BlueprintPinRuntime, value: any, runId: number): void;

    getPinData(pin: BlueprintPinRuntime, runId: number): any;
}