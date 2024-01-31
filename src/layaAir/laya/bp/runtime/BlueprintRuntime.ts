import { BPType, TBPCNode, TBPConnType, TBPEventProperty, TBPNode, TBPStageData, TBPVarProperty } from "../datas/types/BlueprintTypes";
import { INodeManger } from "../core/interface/INodeManger";

import { BlueprintFactory } from "./BlueprintFactory";
import { BlueprintPinRuntime } from "./BlueprintPinRuntime";
import { BlueprintPromise } from "./BlueprintPromise";
import { IBPRutime } from "./interface/IBPRutime";
import { IRunAble } from "./interface/IRunAble";
import { BlueprintEventNode } from "./node/BlueprintEventNode";
import { BlueprintRuntimeBaseNode } from "./node/BlueprintRuntimeBaseNode";
import { BlueprintCustomFunStart } from "./node/BlueprintCustomFunStart";
import { IExcuteListInfo } from "../core/interface/IExcuteListInfo";
import { BlueprintCustomFunReturn, BlueprintCustomFunReturnContext } from "./node/BlueprintCustomFunReturn";
import { IRuntimeDataManger } from "../core/interface/IRuntimeDataManger";
import { BluePrintAsNode } from "./node/BlueprintAsNode";
import { BlueprintPin } from "../core/BlueprintPin";
import { BlueprintUtil } from "../core/BlueprintUtil";
import { BlueprintConst } from "../core/BlueprintConst";


const mainScope = Symbol("mainScope");
export class BlueprintRuntime {

    mainBlock: BluePrintMainBlock;

    funBlockMap: Map<number, BluePrintFunBlock>;

    varMap: Record<string, TBPVarProperty>;

    dataMap: Record<string, TBPVarProperty | TBPEventProperty>;


    constructor() {
        this.mainBlock = new BluePrintMainBlock(mainScope);
        this.funBlockMap = new Map();
    }

    run(context: IRunAble, eventName: string, parms: any[], cb: Function) {
        this.mainBlock.run(context, eventName, parms, cb, 0);
        // context.initData(mainScope, this.nodeMap);
        // let event = this.eventMap.get(eventName);
        // if (event) {
        //     this._maxID++;
        //     if (parms) {
        //         parms.forEach((value, index) => {
        //             context.setPinData(event.outPutParmPins[index], value, this._maxID);
        //         })
        //     }
        //     this.runByContext(context, event, true, cb, this._maxID);
        //     //  event.outExcute.excute(context);
        //     //let root=event.outExcute.linkTo
        // }
    }

    /**
     * 执行自定义函数
     * @param context 
     * @param funName 
     * @param parms 
     */
    runCustomFun(context: IRunAble, funId: number, parms: any[], cb: Function, runId: number) {
        let fun = this.funBlockMap.get(funId);
        if (fun) {
            return fun.run(context, null, parms, cb, runId);
        }
        return null;
    }

    parse(mainBlockData: TBPStageData, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>, newCls: Function) {
        let bpjson: Array<TBPNode> = mainBlockData.arr;
        this.mainBlock.name = mainBlockData.name;
        this.mainBlock.dataMap = this.dataMap;
        this.mainBlock.cls = newCls;
        this.mainBlock.parse(bpjson, getCNodeByNode, varMap);
    }

    parseFunction(funData: TBPStageData, getCNodeByNode: (node: TBPNode) => TBPCNode) {
        let funId: number = funData.id, bpjson: Array<TBPNode> = funData.arr;
        let fun = new BluePrintFunBlock(funId);
        fun.name = funData.name;
        fun.dataMap = this.dataMap;
        fun.parse(bpjson, getCNodeByNode, this.varMap);
        this.funBlockMap.set(funId, fun);
    }

    toCode(context: IRunAble) {
        //         let result = "";
        //         this.eventMap.forEach(item => {
        //             item.outExcute.excute(context);
        //             let code = context.getCode();;
        //             let name = item.name;
        //             let a =
        //                 `this.owner.${name}=function(){
        // ${code}
        // }
        // `
        //             result += a;
        //         })
        //         return result;
    }
}

class BluePrintBlock implements INodeManger<BlueprintRuntimeBaseNode>, IBPRutime {
    private poolIds: number[];
    protected _maxID: number;
    /**
     * block ID 注释
     */
    id: symbol | number;
    /**
     * block 名称
     */
    name: string;
    /**
     * 节点Map
     */
    nodeMap: Map<any, BlueprintRuntimeBaseNode>;
    /**
     * 执行list
     */
    excuteList: BlueprintRuntimeBaseNode[];

    varMap: Record<string, TBPVarProperty>;

    dataMap: Record<string, TBPVarProperty | TBPEventProperty>;

    private _asList: BluePrintAsNode[];

    private _pendingClass: Map<string, number[]>;

    constructor(id: symbol | number) {
        this.id = id;
        this._maxID = 0;
        this.excuteList = [];
        this.nodeMap = new Map();
        this.poolIds = [];
        this._asList = [];
        this._pendingClass = new Map();
    }


    getNodeById(id: any): BlueprintRuntimeBaseNode {
        return this.nodeMap.get(id);
    }

    private _addNode(value: BlueprintRuntimeBaseNode, excuteAbleList: BlueprintRuntimeBaseNode[]): boolean {
        if (excuteAbleList.indexOf(value) == -1) {
            value.index = excuteAbleList.length;
            value.listIndex = this.id;
            excuteAbleList.push(value);
            return true;
        }
        else {
            return false;
        }

    }

    optimizeByStart(value: BlueprintRuntimeBaseNode, excuteAbleList: BlueprintRuntimeBaseNode[]) {
        let stack: BlueprintRuntimeBaseNode[] = [value];
        while (stack.length > 0) {
            const node = stack.pop();
            if (this._addNode(node, excuteAbleList) && node.outExcutes) {
                node.optimize();
                node.outExcutes.forEach(item => {
                    if (item.linkTo && item.linkTo[0]) {
                        stack.push((item.linkTo[0] as BlueprintPinRuntime).owner);
                    }
                })
            }
        }
    }

    clear() {
        //this._asList.length = 0;
        this.excuteList.length = 0;
    }

    optimize() {
        this._asList.forEach(value => {
            value.optimize();
        });
    }

    protected onParse(bpjson: TBPNode[]) {

    }

    private _onReParse(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>, name: string) {
        let result = this._pendingClass.get(name);
        if (result) {
            this._pendingClass.delete(name);
        }
        if (this._pendingClass.size == 0) {
            BlueprintUtil.eventManger.offAllCaller(this);
            this.parse(bpjson, getCNodeByNode, varMap);
        }
    }

    protected onEventParse(eventName: string) {

    }

    //check ready?
    private _checkReady(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>): boolean {
        bpjson.forEach(item => {
            let itemdef = getCNodeByNode(item);
            if (!itemdef) {
                let classID = item.target;//TODO
                if (!classID) {
                    console.error("It's old style:" + item.name);
                }
                let pcls = this._pendingClass.get(classID);
                if (pcls) {
                    pcls.push(item.id);
                }
                else {
                    this._pendingClass.set(classID, [item.id]);
                }
            }
            else {
                if (itemdef.type == BPType.Event && item.output && item.output["then"]) {
                    this.onEventParse(itemdef.name);
                }
            }
        });
        if (this._pendingClass.size > 0) {
            BlueprintUtil.eventManger.on(BlueprintUtil.CustomClassFinish, this, this._onReParse, [bpjson, getCNodeByNode, varMap]);
            return false;
        }
        return true;
    }

    parse(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>) {
        this.varMap = varMap;
        //check ready?
        if (!this._checkReady(bpjson, getCNodeByNode, varMap)) return;
        //pin create

        bpjson.forEach(item => {
            let node = BlueprintFactory.instance.createNew(getCNodeByNode(item), item.id);
            this.append(node);
        });
        // debugger;

        bpjson.forEach(item => {
            // debugger;
            this.getNodeById(item.id).parseLinkData(item, this);
        });
        this.onParse(bpjson);
        this.optimize();
    }

    append(node: BlueprintRuntimeBaseNode) {
        this.nodeMap.set(node.nid, node);
        switch (node.type) {
            case BPType.Assertion:
                this._asList.push(node);
                break;
        }
    }

    run(context: IRunAble, eventName: string, parms: any[], cb: Function, runId: number): boolean {
        return false;
    }

    protected getRunID() {
        //console.log(">>>>>>>>>>获取节点ID");
        if (this.poolIds.length > 0) {
            return this.poolIds.pop();
        }
        else {
            return ++this._maxID;
        }
    }


    runByContext(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, node: IExcuteListInfo, enableDebugPause: boolean, cb: Function, runId: number): boolean {
        if (runId == -1) {
            runId = this.getRunID();
        }
        const currentIndex = node.index;
        const excuteAbleList = this.excuteList;

        for (let i = currentIndex, n = excuteAbleList.length; i < n;) {
            const bpNode = excuteAbleList[i];
            let index = bpNode.step(context, runtimeDataMgr, true, this, enableDebugPause, runId);
            enableDebugPause = true;
            if (index instanceof BlueprintPromise) {
                index.wait((mis: BlueprintPromise) => {
                    this.runByContext(context, runtimeDataMgr, mis, mis.enableDebugPause != undefined ? mis.enableDebugPause : enableDebugPause, cb, runId);
                })
                return false;
            }
            else {
                i = index;
                if(index == BlueprintConst.MAX_CODELINE){
                    if(mainScope == this.id && context.debuggerManager){
                        context.debuggerManager.clear();
                    }
                }
            }
        }
        cb && cb();
        this.poolIds.push(runId);
        //console.log(">>>>>>>>>>>>>runID over:" + runId);
        return true;
    }
}

class BluePrintMainBlock extends BluePrintBlock {
    constructor(id: symbol) {
        super(id);
        this.eventMap = new Map();
    }
    eventMap: Map<any, BlueprintEventNode>;
    cls: Function;
    optimize() {
        super.optimize();
        this.eventMap.forEach(value => {
            this.optimizeByStart(value, this.excuteList);
            // let 
        });
    }

    protected onEventParse(eventName: string) {
        let cls = this.cls;
        let originFunc: Function = cls.prototype[eventName];
        cls.prototype[eventName] = function (...args: any[]) {
            const funcContext:IRunAble = this[BlueprintFactory.contextSymbol];
            if(funcContext.debuggerManager && funcContext.debuggerManager.debugging) return;
            originFunc && originFunc.call(this, args);
            this[BlueprintFactory.bpSymbol].run(funcContext, eventName, args);
        }
    }

    append(node: BlueprintRuntimeBaseNode) {
        super.append(node);
        switch (node.type) {
            case BPType.Event:
                this.eventMap.set(node.name, node as BlueprintEventNode);
                break;
        }
    }

    run(context: IRunAble, eventName: string, parms: any[], cb: Function, runId: number): boolean {
        context.initData(this.id, this.nodeMap);
        let event = this.eventMap.get(eventName);
        if (event) {
            let curRunId = this.getRunID();
            let runtimeDataMgr = context.getDataMangerByID(this.id);
            if (parms) {
                event.initData(runtimeDataMgr, parms, curRunId);
            }
            return this.runByContext(context, runtimeDataMgr, event, true, cb, curRunId);
        }
        return null;
    }
}

class BluePrintFunBlock extends BluePrintBlock {
    funStart: BlueprintCustomFunStart;

    funEnds: BlueprintCustomFunReturn[] = [];
    optimize() {
        super.optimize();
        this.optimizeByStart(this.funStart, this.excuteList);
    }
    protected onParse(bpjson: TBPNode[]) {
        this.funStart = this.getNodeById(bpjson[0].id) as BlueprintCustomFunStart;
        this.excuteList.forEach(value => {
            if (value.type == BPType.CustomFunReturn) {
                this.funEnds.push(value as BlueprintCustomFunReturn);
            }
        })
    }

    parse(bpjson: TBPNode[], getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>): void {
        super.parse(bpjson, getCNodeByNode, varMap);
        this.funStart = this.getNodeById(bpjson[0].id) as BlueprintCustomFunStart;
        this.excuteList.forEach(value => {
            if (value.type == BPType.CustomFunReturn) {
                this.funEnds.push(value as BlueprintCustomFunReturn);
            }
        })
    }

    run(context: IRunAble, eventName: string, parms: any[], cb: Function, runId: number): boolean {
        context.initData(this.id, this.nodeMap);
        let fun = this.funStart;
        if (fun) {
            let runtimeDataMgr = context.getDataMangerByID(this.id);
            let curRunId = this.getRunID();
            if (parms) {
                this.funEnds.forEach(value => {
                    value.initData(runtimeDataMgr, curRunId, runId, parms, fun.outPutParmPins.length);
                })
                fun.initData(runtimeDataMgr, parms, curRunId);
            }
            return this.runByContext(context, runtimeDataMgr, fun, true, cb, curRunId);
        }
        return null;
    }
}