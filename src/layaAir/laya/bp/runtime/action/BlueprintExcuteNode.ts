import { IRunAble } from "../interface/IRunAble";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { BlueprintRunBase } from "./BlueprintRunBase";
import { IBPRutime } from "../interface/IBPRutime";
import { RuntimeNodeData, RuntimePinData } from "./RuntimeNodeData";

export class BlueprintExcuteNode extends BlueprintRunBase implements IRunAble {
    owner: any;
    dataMap: Map<number, RuntimeNodeData>;
    private _inited: boolean;


    constructor(data: any) {
        super();
        this.owner = data;

    }
    getDataById(nid: number): RuntimeNodeData {
       return this.dataMap.get(nid);
    }
    initData(nodeMap: Map<number, BlueprintRuntimeBaseNode>): void {
        if (!this._inited) {
            let dataMap = this.dataMap = new Map();
            nodeMap.forEach((value, key) => {
                let rdata = new RuntimeNodeData();
                dataMap.set(key, rdata);
                value.pins.forEach(pin => {
                    let pinData = new RuntimePinData();
                    rdata.pinsValue.set(pin.nid, pinData);
                })
            })
            this._inited = true;
        }
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
    beginExcute(runtimeNode: BlueprintRuntimeBaseNode, runner: IBPRutime, enableDebugPause: boolean): boolean {
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
    endExcute(runtimeNode: BlueprintRuntimeBaseNode): void {
        //throw new Error("Method not implemented.");
    }
    parmFromCustom(parmsArray: any[], parm: any, parmname: string): void {
        parmsArray.push(parm);
    }

    vars: { [key: string]: any; } = {};

    parmFromOtherPin(current: BlueprintPinRuntime, from: BlueprintPinRuntime, parmsArray: any[]): void {
        parmsArray.push(from.getValue());
    }

    parmFromSelf(current: BlueprintPinRuntime, parmsArray: any[]): void {
        parmsArray.push(current.getValue());
    }

    parmFromOutPut(outPutParmPins: BlueprintPinRuntime[], parmsArray: any[]): void {
        for (let i = 0, n = outPutParmPins.length; i < n; i++) {
            let out = outPutParmPins[i];
            parmsArray.push(out);
        }
    }

    excuteFun(nativeFun: Function, outPutParmPins: BlueprintPinRuntime[], caller: any, parmsArray: any[]): any {
        let result = nativeFun.apply(caller, parmsArray);
        if (result != undefined && !(result instanceof Promise)) {
            outPutParmPins[0].setValue(result);
        }
        return result;
    }

    reCall(index: number): void {

    }

}