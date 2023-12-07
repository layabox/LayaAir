import { IRunAble } from "../interface/IRunAble";
import { BPPinRuntime } from "../BPPinRuntime";
import { BPRuntimeBaseNode } from "../node/BPRuntimeBaseNode";
import { BPRunBase } from "./BPRunBase";
import { IBPRutime } from "../interface/IBPRutime";

export class BPExcuteNode extends BPRunBase implements IRunAble {
    owner: any;
    constructor(data: any) {
        super();
        this.owner = data;

    }
    debuggerPause: boolean;
    pushBack(index: number): void {
        debugger;
        //throw new Error("Method not implemented.");
    }
    getSelf() {
        return this.owner;
    }

    setVar(name: string, value: any) {
        this.vars[name] = value;
    }
    getVar(name: string) {
        return this.vars[name] === undefined ? this.owner[name] : this.vars[name];
    }
    getCode(): string {
        return "";
    }
    beginExcute(runtimeNode: BPRuntimeBaseNode,runner:IBPRutime,enableDebugPause:boolean): boolean {
        //throw new Error("Method not implemented.");
        if (this.listNode.indexOf(runtimeNode) == -1) {
            this.listNode.push(runtimeNode);
            //super.beginExcute(runtimeNode);
            // this.currentFun=[];
            return false;
        }
        else {
            return false;
            console.error("检测到有死循环");
            return true;
        }

    }
    endExcute(runtimeNode: BPRuntimeBaseNode): void {
        //throw new Error("Method not implemented.");
    }
    parmFromCustom(parmsArray: any[], parm: any, parmname: string): void {
        parmsArray.push(parm);
    }

    vars: { [key: string]: any; } = {};

    parmFromOtherPin(current: BPPinRuntime, from: BPPinRuntime, parmsArray: any[]): void {
        parmsArray.push(from.getValue());
    }

    parmFromSelf(current: BPPinRuntime, parmsArray: any[]): void {
        parmsArray.push(current.getValue());
    }

    parmFromOutPut(outPutParmPins: BPPinRuntime[], parmsArray: any[]): void {
        for (let i = 0, n = outPutParmPins.length; i < n; i++) {
            let out = outPutParmPins[i];
            parmsArray.push(out);
        }
    }

    excuteFun(nativeFun: Function, outPutParmPins: BPPinRuntime[],caller:any, parmsArray: any[]): any {
        let result = nativeFun.apply(caller, parmsArray);
        if ( result != undefined&&!(result instanceof Promise)) {
            outPutParmPins[0].setValue(result);
        }
        return result;
    }

    reCall(index: number): void {
        
    }

}