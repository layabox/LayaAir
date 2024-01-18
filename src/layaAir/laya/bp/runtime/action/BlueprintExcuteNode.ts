import { IRunAble } from "../interface/IRunAble";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { BlueprintRunBase } from "./BlueprintRunBase";
import { IBPRutime } from "../interface/IBPRutime";
import { RuntimeNodeData, RuntimePinData } from "./RuntimeNodeData";
import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { BlueprintFactory } from "../BlueprintFactory";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";

export class BlueprintExcuteNode extends BlueprintRunBase implements IRunAble {
    owner: any;

    runtimeDataMgrMap: Map<number | symbol, RuntimeDataManger>;


    constructor(data: any) {
        super();
        this.owner = data;
        this.runtimeDataMgrMap = new Map;
    }
    getDataMangerByID(id: number | symbol): IRuntimeDataManger {
        return this.runtimeDataMgrMap.get(id);
    }

    initData(key: number | symbol, nodeMap: Map<number, BlueprintRuntimeBaseNode>): void {
        let runtimeDataMgr = this.runtimeDataMgrMap.get(key);
        if (!runtimeDataMgr) {
            runtimeDataMgr = new RuntimeDataManger(key);
            runtimeDataMgr.initData(nodeMap);
            this.runtimeDataMgrMap.set(key, runtimeDataMgr);
        }
    }
    debuggerPause: boolean;
    pushBack(excuteNode: IExcuteListInfo): void {
        debugger;
        //throw new Error("Method not implemented.");
    }
    getSelf() {
        return this.owner;
    }

    setVar(name: string, value: any) {
        let obj = this.vars[name] === undefined ? this.owner : this.vars;
        obj[name] = value;
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

    parmFromOtherPin(current: BlueprintPinRuntime, runtimeDataMgr: IRuntimeDataManger, from: BlueprintPinRuntime, parmsArray: any[], runId: number): void {
        parmsArray.push(runtimeDataMgr.getPinData(from, runId));
    }

    parmFromSelf(current: BlueprintPinRuntime, runtimeDataMgr: IRuntimeDataManger, parmsArray: any[], runId: number): void {
        parmsArray.push(runtimeDataMgr.getPinData(current, runId));
    }

    parmFromOutPut(outPutParmPins: BlueprintPinRuntime[], runtimeDataMgr: IRuntimeDataManger, parmsArray: any[]): void {
        for (let i = 0, n = outPutParmPins.length; i < n; i++) {
            let out = outPutParmPins[i];
            parmsArray.push(runtimeDataMgr.getRuntimePinById(out.id));
        }
    }

    excuteFun(nativeFun: Function, outPutParmPins: BlueprintPinRuntime[], runtimeDataMgr: IRuntimeDataManger, caller: any, parmsArray: any[], runId: number): any {
        let result = nativeFun.apply(caller, parmsArray);
        if (result != undefined && !(result instanceof Promise)) {
            runtimeDataMgr.setPinData(outPutParmPins[0], result, runId);
            //outPutParmPins[0].setValue(result);
        }
        return result;
    }

    reCall(index: number): void {

    }

}

class RuntimeDataManger implements IRuntimeDataManger {
    id: symbol | number;

    isInit: boolean;
    /**
    * 节点数据区Map
    */
    nodeMap: Map<number, RuntimeNodeData>;
    /**
     * 引脚数据Map
     */
    pinMap: Map<string, RuntimePinData>;

    constructor(id: symbol | number) {
        this.id = id;
    }

    getDataById(nid: number): RuntimeNodeData {
        return this.nodeMap.get(nid);
    }

    getRuntimePinById(id:string):RuntimePinData {
        return this.pinMap.get(id);
    }

    setPinData(pin: BlueprintPinRuntime, value: any, runId: number): void {
        this.pinMap.get(pin.id).setValue(runId, value);
    }

    getPinData(pin: BlueprintPinRuntime, runId: number) {
        return this.pinMap.get(pin.id).getValue(runId);
    }



    initData(nodeMap: Map<number, BlueprintRuntimeBaseNode>): void {
        if (!this.isInit) {
            if (!this.nodeMap) {
                this.nodeMap = new Map()
            }
            if (!this.pinMap) {
                this.pinMap = new Map();
            }
            let dataMap = this.nodeMap;
            let pinMap = this.pinMap;
            nodeMap.forEach((value, key) => {
                if (dataMap.get(key)) {
                    return;
                }
                let cls = BlueprintFactory.getBPContextData(value.type);
                let rdata = new cls();
                dataMap.set(key, rdata);
                value.pins.forEach(pin => {
                    let pinData = new RuntimePinData();
                    pinData.name = pin.name;
                    if (pin.value != undefined && pin.linkTo.length == 0) {
                        pinData.initValue(pin.value);
                    }

                    if (pinMap.get(pin.id)) {
                        debugger;
                    }
                    pinMap.set(pin.id, pinData);
                })
            })
            this.isInit = true;
        }
    }

}