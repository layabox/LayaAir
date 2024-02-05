import { IRunAble } from "../interface/IRunAble";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { BlueprintRunBase } from "./BlueprintRunBase";
import { IBPRutime } from "../interface/IBPRutime";
import { RuntimeNodeData, RuntimePinData } from "./RuntimeNodeData";
import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { BlueprintFactory } from "../BlueprintFactory";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BpDebuggerRunType } from "../debugger/BlueprintDebuggerManager";
import { TBPVarProperty } from "../../datas/types/BlueprintTypes";

export class BlueprintExcuteNode extends BlueprintRunBase implements IRunAble {
    owner: any;
    varDefineMap: Map<string, boolean>;
    runtimeDataMgrMap: Map<number | symbol, RuntimeDataManger>;


    constructor(data: any) {
        super();
        this.owner = data;
        this.varDefineMap = new Map;
        this.runtimeDataMgrMap = new Map;
    }
    getDataMangerByID(id: number | symbol): IRuntimeDataManger {
        return this.runtimeDataMgrMap.get(id);
    }

    initData(key: number | symbol, nodeMap: Map<number, BlueprintRuntimeBaseNode>,localVarMap:Record<string, TBPVarProperty>): void {
        let runtimeDataMgr = this.runtimeDataMgrMap.get(key);
        if (!runtimeDataMgr) {
            runtimeDataMgr = new RuntimeDataManger(key);
            runtimeDataMgr.initData(nodeMap,localVarMap);
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

    initVar(name: string, value: any): void {
        this.vars[name] = value;
        this.varDefineMap.set(name, true);
    }

    setVar(name: string, value: any) {
        let obj = this.varDefineMap.get(name) ? this.vars : this.owner;
        obj[name] = value;
    }
    getVar(name: string) {
        let obj = this.varDefineMap.get(name) ? this.vars : this.owner;
        return obj[name];
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

    localVarObj: any;

    localVarMap: Map<number, any>;

    constructor(id: symbol | number) {
        this.id = id;
        this.localVarObj = {};
    }
    debuggerPause?: BpDebuggerRunType;

    private _initGetVarObj(runId: number) {
        let a = this.localVarMap.get(runId);
        if (!a) {
            a = Object.create(this.localVarObj);
            this.localVarMap.set(runId, a);
        }
        return a;
    }

    getVar(name: string, runId: number) {
        let varObj = this._initGetVarObj(runId);
        return varObj[name];
    }
    setVar(name: string, value: any, runId: number): void {
        let varObj = this._initGetVarObj(runId);
        return varObj[name] = value;
    }

    getDataById(nid: number): RuntimeNodeData {
        return this.nodeMap.get(nid);
    }

    getRuntimePinById(id: string): RuntimePinData {
        return this.pinMap.get(id);
    }

    setPinData(pin: BlueprintPinRuntime, value: any, runId: number): void {
        this.pinMap.get(pin.id).setValue(runId, value);
    }

    getPinData(pin: BlueprintPinRuntime, runId: number) {
        return this.pinMap.get(pin.id).getValue(runId);
    }



    initData(nodeMap: Map<number, BlueprintRuntimeBaseNode>,localVarMap:Record<string, TBPVarProperty>): void {
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
            if(localVarMap){
                for(let key in localVarMap){
                    this.localVarObj[key] = localVarMap[key].value;
                }
            }
            this.isInit = true;
        }
    }

}