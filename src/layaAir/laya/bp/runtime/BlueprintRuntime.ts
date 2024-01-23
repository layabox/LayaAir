import { BPType, TBPCNode, TBPConnType, TBPEventProperty, TBPNode, TBPVarProperty } from "../datas/types/BlueprintTypes";
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

    parse(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>) {
        this.mainBlock.dataMap = this.dataMap;
        this.mainBlock.parse(bpjson, getCNodeByNode, varMap);
    }

    parseFunction(funId: number, bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode) {
        let fun = new BluePrintFunBlock(funId);
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

    constructor(id: symbol | number) {
        this.id = id;
        this._maxID = 0;
        this.excuteList = [];
        this.nodeMap = new Map();
        this.poolIds = [];
        this._asList = [];
        this._pendingcode = new Map();
        this._pendingClass = new Map();
    }
    pendingLink(pin: BlueprintPin, config: TBPConnType): void {
        let node = this._pendingcode.get(config.nodeId);
        if (node) {
            node.push([pin, config]);
        }
        //debugger;
        // throw new Error("Method not implemented.");
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
    private _pendingcode: Map<number, any[]>;

    private _pendingClass: Map<string, number[]>

    private _onChangeParse(getCNodeByNode: (node: TBPNode) => TBPCNode, name: string) {
        let result = this._pendingClass.get(name);
        if (result) {
            result.forEach(value => {
                let temp = this._pendingcode.get(value);
                let item = temp[0];
                let node = BlueprintFactory.instance.createNew(getCNodeByNode(item), item.id);
                this.append(node);
            });

            result.forEach(value => {
                let temp = this._pendingcode.get(value);
                let item = temp[0];
                
                let node = this.getNodeById(item.id);
                if (node) {
                    node.parseLinkData(item, this);
                }
                // else {
                //     debugger;
                // }
                for (let i = 1; i < temp.length; i++) {
                    let pin: BlueprintPin = temp[i][0];
                    let config: TBPConnType = temp[i][1];
                    let nextNode = this.getNodeById(config.nodeId);
                    if (nextNode) {
                        let pinnext = nextNode.getPinByName(config.id);
                        pin.startLinkTo(pinnext);
                    }
                    // else {
                    //     debugger;
                    // }
                }
            })
            this._pendingClass.delete(name);
        }
        if (this._pendingClass.size == 0) {
            BlueprintUtil.eventManger.offAllCaller(this);
            this.clear();
            this.optimize();
        }
        //debugger;
    }

    parse(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>) {
        this.varMap = varMap;
        //pin create

        // for(let i:number=0,n:number=bpjson.length;i<n;i++){
        //     let item=bpjson[i];
        //     let itemdef = getCNodeByNode(item);
        //     if(!itemdef){
        //         BlueprintUtil.eventManger.on(BlueprintUtil.CustomClassFinish, this, this._onChangeParse, [getCNodeByNode]);
        //         return;
        //     }
        //     else{
        //         let node = BlueprintFactory.instance.createNew(itemdef, item.id);
        //         this.append(node);
        //     }
        // }
        bpjson.forEach(item => {
            let itemdef = getCNodeByNode(item);
            if (!itemdef) {
                this._pendingcode.set(item.id, [item]);
                let classID = item.cid.split("_")[0];//TODO
                let pcls = this._pendingClass.get(classID);

                if (pcls) {
                    pcls.push(item.id);
                }
                else {
                    this._pendingClass.set(classID, [item.id]);
                }
            }
            else {
                let node = BlueprintFactory.instance.createNew(itemdef, item.id);
                this.append(node);
            }
        });
        // debugger;

        bpjson.forEach(item => {
            // debugger;
            let node = this.getNodeById(item.id);
            if (node) {
                node.parseLinkData(item, this);
            }
        });
        this.onParse(bpjson);
        if (this._pendingcode.size > 0) {
            BlueprintUtil.eventManger.on(BlueprintUtil.CustomClassFinish, this, this._onChangeParse, [getCNodeByNode]);
        }
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


    runByContext(context: IRunAble, runTimeData: IRuntimeDataManger, node: IExcuteListInfo, enableDebugPause: boolean, cb: Function, runId: number): boolean {
        if (runId == -1) {
            runId = this.getRunID();
        }
        const currentIndex = node.index;
        const excuteAbleList = this.excuteList;

        for (let i = currentIndex, n = excuteAbleList.length; i < n;) {
            const bpNode = excuteAbleList[i];
            let index = bpNode.step(context, runTimeData, true, this, enableDebugPause, runId);
            enableDebugPause = true;
            if (index instanceof BlueprintPromise) {
                index.wait((mis: BlueprintPromise) => {
                    this.runByContext(context, runTimeData, mis, enableDebugPause, cb, runId);
                })
                return false;
            }
            else {
                i = index;
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
    optimize() {
        super.optimize();
        this.eventMap.forEach(value => {
            this.optimizeByStart(value, this.excuteList);
            // let 
        });
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
                parms.forEach((value, index) => {
                    runtimeDataMgr.setPinData(event.outPutParmPins[index], value, curRunId);
                })
            }

            this.runByContext(context, runtimeDataMgr, event, true, cb, curRunId);
            //  event.outExcute.excute(context);
            //let root=event.outExcute.linkTo
            return true;
        }
        return false;
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
                this.funEnds.push(value);
            }
        })
    }

    parse(bpjson: TBPNode[], getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>): void {
        super.parse(bpjson, getCNodeByNode, varMap);
        this.funStart = this.getNodeById(bpjson[0].id) as BlueprintCustomFunStart;
        this.excuteList.forEach(value => {
            if (value.type == BPType.CustomFunReturn) {
                this.funEnds.push(value);
            }
        })
    }

    run(context: IRunAble, eventName: string, parms: any[], cb: Function, runId: number): boolean {
        context.initData(this.id, this.nodeMap);

        let fun = this.funStart;
        if (fun) {
            let runtimeDataMgr = context.getDataMangerByID(this.id);
            let curRunId = this.getRunID();
            let returnNode = this.funEnds[0];
            if (returnNode) {
                let data = runtimeDataMgr.getDataById(returnNode.nid) as BlueprintCustomFunReturnContext;
                let result: any[] = [];
                data.returnMap.set(curRunId, result);
                data.runIdMap.set(curRunId, runId);
                for (let i = fun.outPutParmPins.length; i < parms.length; i++) {
                    result.push(parms[i]);
                }
            }

            if (parms) {
                fun.outPutParmPins.forEach((value, index) => {
                    runtimeDataMgr.setPinData(value, parms[index], curRunId);
                })
            }

            return this.runByContext(context, runtimeDataMgr, fun, true, cb, curRunId);
            //  event.outExcute.excute(context);
            //let root=event.outExcute.linkTo
        }
        return null;
    }
}