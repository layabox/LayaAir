import { BPPinRuntime } from "../BPPinRuntime";
import { BPRuntimeBaseNode } from "../node/BPRuntimeBaseNode";

export interface IRunAble {
    readonly vars: { [key: string]: any };

    beginExcute(runtimeNode: BPRuntimeBaseNode): boolean;

    endExcute(runtimeNode: BPRuntimeBaseNode): void;

    parmFromOtherPin(current: BPPinRuntime, from: BPPinRuntime, parmsArray: any[]): void;

    parmFromSelf(current: BPPinRuntime, parmsArray: any[]): void;

    parmFromOutPut(outPutParmPins: BPPinRuntime[], parmsArray: any[]): void;

    parmFromCustom(parmsArray: any[], parm: any, parmname: string): void;

    excuteFun(nativeFun: Function, outPutParmPins: BPPinRuntime[],caller:any, parmsArray: any[]): any;

    getCode(): string;

    getVar(name: string): any;

    setVar(name: string, value: any):void;

    reCall(index:number):void;

    getSelf():any;
}