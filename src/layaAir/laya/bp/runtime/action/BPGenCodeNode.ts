import { BPPinRuntime } from "../BPPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BPRuntimeBaseNode } from "../node/BPRuntimeBaseNode";
import { BPRunBase } from "./BPRunBase";

export class BPGenCodeNode extends BPRunBase implements IRunAble {
    getSelf() {
        throw new Error("Method not implemented.");
    }
    reCall(index: number): void {
        throw new Error("Method not implemented.");
    }
    getVar(name: string) {
        throw new Error("Method not implemented.");
    }
    setVar(name: string, value: any): void {
        throw new Error("Method not implemented.");
    }
    find(input: any, outExcutes: BPPinRuntime[]): BPPinRuntime {
        throw new Error("Method not implemented.");
    }
    codes: string[][] = [];
    currentFun: string[];
    vars: { [key: string]: any; } = {};

    blockMap: Map<number, any> = new Map();

    beginExcute(runtimeNode: BPRuntimeBaseNode): boolean {
        let index = this.listNode.indexOf(runtimeNode);
        if (index == -1) {
            this.listNode.push(runtimeNode);
            //super.beginExcute(runtimeNode);
            this.currentFun = [];
            return false;
        }
        else {
            let code = "while(true){\n";
            for (let i=index; i < this.codes.length; i++) {
                code += this.codes[i].join('\n')+"\n";
            }
            code += "}\n";
            this.blockMap.set(index, { end: this.codes.length - 1, code: code });
            return true;
        }
    }

    endExcute(runtimeNode: BPRuntimeBaseNode): void {
        if (this.currentFun) {
            this.codes.push(this.currentFun);
            this.currentFun = null;
        }
    }

    parmFromOtherPin(current: BPPinRuntime, from: BPPinRuntime, parmsArray: any[]): void {
        let last = this.currentFun.pop();
        last = "let " + current.name + current.owner.id + " = " + last;
        this.currentFun.push(last);
        parmsArray.push(current.name + current.owner.id);
    }

    parmFromSelf(current: BPPinRuntime, parmsArray: any[]): void {
        parmsArray.push(current.getValueCode());
    }

    parmFromOutPut(outPutParmPins: BPPinRuntime[], parmsArray: any[]): void {
    }

    parmFromCustom(parmsArray: any[], parm: any, parmname: string): void {
        parmsArray.push(parmname);
    }

    excuteFun(nativeFun: Function, outPutParmPins: BPPinRuntime[], parmsArray: any[]): void {

        let a = (nativeFun.name + "(" + parmsArray.join(",") + ");");
        this.currentFun.push(a);
    }

    toString() {
        return "context";
    }

    getCode(): string {
        let code = "";
        for (let i = 0, n = this.codes.length; i < n; i++) {
            let m = this.blockMap.get(i);
            if (m) {
                code+=m.code;
                i=m.end;
            }
            else{
                code+=this.codes[i].join("\n")+"\n";
            }
        }
        return code;
    }

}