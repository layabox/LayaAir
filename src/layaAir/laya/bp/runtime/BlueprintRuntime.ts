import { BPType, TBPCNode, TBPEventProperty, TBPNode, TBPVarProperty } from "../datas/types/BlueprintTypes";
import { EBlueNodeType } from "../core/EBluePrint";
import { INodeManger } from "../core/interface/INodeManger";
import { TBPNodeData } from "../core/type/TBluePrint";

import { BlueprintFactory } from "./BlueprintFactory";
import { BlueprintPinRuntime } from "./BlueprintPinRuntime";
import { BlueprintPromise } from "./BlueprintPromise";
import { IBPRutime } from "./interface/IBPRutime";
import { IRunAble } from "./interface/IRunAble";
import { BlueprintEventNode } from "./node/BlueprintEventNode";
import { BlueprintRuntimeBaseNode } from "./node/BlueprintRuntimeBaseNode";
import { RuntimeNodeData } from "./action/RuntimeNodeData";
import { BlueprintCustomFunStart } from "./node/BlueprintCustomFunStart";
import { IExcuteListInfo } from "../core/interface/IExcuteListInfo";
import { BlueprintCustomFunReturn, BlueprintCustomFunReturnContext } from "./node/BlueprintCustomFunReturn";


const mainScope = Symbol("mainScope");
export class BlueprintRuntime implements INodeManger<BlueprintRuntimeBaseNode>, IBPRutime {

    nodeMap: Map<any, BlueprintRuntimeBaseNode>;

    eventMap: Map<any, BlueprintEventNode>;
    /**
     * 自定义函数列表
     */
    customFunMap: Map<number, BlueprintCustomFunStart>;
    /**
     * 自定义函数返回节点列表
     */
    customFunReturnMap: Map<number, BlueprintCustomFunReturn>;

    varMap: Record<string, TBPVarProperty>;

    dataMap: Record<string, TBPVarProperty | TBPEventProperty>

    excuteRuntimeList: Map<number | Symbol, BlueprintRuntimeBaseNode[]>;
    private _maxID: number = 0;

    constructor() {
        this.nodeMap = new Map();
        this.eventMap = new Map();
        this.customFunMap = new Map();
        this.customFunReturnMap = new Map();
        this.excuteRuntimeList = new Map();
        this.excuteRuntimeList.set(mainScope, [])
    }


    append(node: BlueprintRuntimeBaseNode) {
        this.nodeMap.set(node.nid, node);
        switch (node.type) {
            case BPType.Event:
                this.eventMap.set(node.name, node as BlueprintEventNode);
                break;
        }
    }

    run(context: IRunAble, eventName: string, parms: any[], cb: Function) {
        context.initData(mainScope, this.nodeMap);
        let event = this.eventMap.get(eventName);
        if (event) {
            this._maxID++;
            if (parms) {
                parms.forEach((value, index) => {
                    context.setPinData(event.outPutParmPins[index], value, this._maxID);
                })
            }
            this.runByContext(context, event, true, cb, this._maxID);
            //  event.outExcute.excute(context);
            //let root=event.outExcute.linkTo
        }
    }

    /**
     * 执行自定义函数
     * @param context 
     * @param funName 
     * @param parms 
     */
    runCustomFun(context: IRunAble, funId: number, parms: any[], cb: Function, runId: number) {
        context.initData(funId, this.nodeMap);
        let fun = this.customFunMap.get(funId);
        if (fun) {
            this._maxID++;
            let curRunId=this._maxID;
            let returnNode = this.customFunReturnMap.get(funId);
            if (returnNode) {
                let data = context.getDataById(returnNode.nid) as BlueprintCustomFunReturnContext;
                let result: any[] = [];
                data.returnMap.set(curRunId, result);
                data.runIdMap.set(curRunId, runId);
                for (let i = fun.outPutParmPins.length; i < parms.length; i++) {
                    result.push(parms[i]);
                }
            }

            if (parms) {
                fun.outPutParmPins.forEach((value, index) => {
                    context.setPinData(value, parms[index], curRunId);
                })
            }

            return this.runByContext(context, fun, true, cb, curRunId);
            //  event.outExcute.excute(context);
            //let root=event.outExcute.linkTo
        }
        return null;
    }

    runByContext(context: IRunAble, node: IExcuteListInfo, enableDebugPause: boolean, cb: Function, runId: number): boolean {
        if (runId == -1) {
            runId = ++this._maxID;
        }
        const currentIndex = node.index;
        const excuteAbleList = this.excuteRuntimeList.get(node.listIndex);

        for (let i = currentIndex, n = excuteAbleList.length; i < n;) {
            const bpNode = excuteAbleList[i];
            let index = bpNode.step(context, true, this, enableDebugPause, runId);
            enableDebugPause = true;
            if (index instanceof BlueprintPromise) {
                index.wait((mis: BlueprintPromise) => {
                    this.runByContext(context, mis, enableDebugPause, cb, runId);
                })
                return false;
            }
            else {
                i = index;
            }
        }
        cb && cb();
        return true;
    }

    parse(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>) {
        this.varMap = varMap;
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
        this.optimize();
    }

    parseFunction(funId: number, bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode) {
        bpjson.forEach(item => {
            let node = BlueprintFactory.instance.createNew(getCNodeByNode(item), item.id);
            this.append(node);
        });
        bpjson.forEach(item => {
            // debugger;
            let itemNode = this.getNodeById(item.id) as BlueprintCustomFunReturn;
            if (itemNode.type == BPType.CustomFunReturn) {
                this.customFunReturnMap.set(funId, itemNode);
            }
            itemNode.parseLinkData(item, this);
        });
        let funExcuteList: BlueprintRuntimeBaseNode[] = [];
        let funnode = this.getNodeById(bpjson[0].id) as BlueprintCustomFunStart;
        this.excuteRuntimeList.set(funId, funExcuteList);
        this.customFunMap.set(funId, funnode);


        this.optimizeByStart(funnode, funExcuteList, funId);
    }

    private _addNode(value: BlueprintRuntimeBaseNode, excuteAbleList: BlueprintRuntimeBaseNode[], listIndex: number | Symbol): boolean {
        if (excuteAbleList.indexOf(value) == -1) {
            value.index = excuteAbleList.length;
            value.listIndex = listIndex;
            excuteAbleList.push(value);
            return true;
        }
        else {
            return false;
        }

    }

    optimizeByStart(value: BlueprintRuntimeBaseNode, excuteAbleList: BlueprintRuntimeBaseNode[], listIndex: number | Symbol) {
        let stack: BlueprintRuntimeBaseNode[] = [value];
        while (stack.length > 0) {
            const node = stack.pop();
            if (this._addNode(node, excuteAbleList, listIndex) && node.outExcutes) {
                node.optimize();
                node.outExcutes.forEach(item => {
                    if (item.linkTo && item.linkTo[0]) {
                        stack.push((item.linkTo[0] as BlueprintPinRuntime).owner);
                    }
                })
            }
        }
    }


    optimize() {
        let excuteAbleList = this.excuteRuntimeList.get(mainScope);
        this.eventMap.forEach(value => {
            this.optimizeByStart(value, excuteAbleList, mainScope);
            // let 
        });
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

    getNodeById(id: any): BlueprintRuntimeBaseNode {
        return this.nodeMap.get(id);
    }
}