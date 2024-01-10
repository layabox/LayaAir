import { TBPCNode, TBPEventProperty, TBPNode, TBPVarProperty } from "../datas/types/BlueprintTypes";
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


const mainScope = Symbol("mainScope");
export class BlueprintRuntime implements INodeManger<BlueprintRuntimeBaseNode>, IBPRutime {

    nodeMap: Map<any, BlueprintRuntimeBaseNode>;

    eventMap: Map<any, BlueprintEventNode>;
    /**
     * 自定义函数列表
     */
    customFunMap: Map<number, BlueprintCustomFunStart>;

    varMap: Record<string, TBPVarProperty>;

    dataMap: Record<string, TBPVarProperty | TBPEventProperty>

    excuteRuntimeList: Map<number | Symbol, BlueprintRuntimeBaseNode[]>;

    constructor() {
        this.nodeMap = new Map();
        this.eventMap = new Map();
        this.customFunMap = new Map();
        this.excuteRuntimeList = new Map();
        this.excuteRuntimeList.set(mainScope, [])
    }


    append(node: BlueprintRuntimeBaseNode) {
        this.nodeMap.set(node.nid, node);
        switch (node.type) {
            case EBlueNodeType.Event:
                this.eventMap.set(node.name, node as BlueprintEventNode);
                break;
        }
    }

    run(context: IRunAble, eventName: string, parms: any[]) {
        context.initData(this.nodeMap);
        let event = this.eventMap.get(eventName);
        if (event) {
            if (parms) {
                parms.forEach((value, index) => {
                    context.setPinData(event.outPutParmPins[index], value);
                })
            }
            this.runByContext(context, event);
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
    runCustomFun(context: IRunAble, funId: number, parms: any[]) {
        let fun = this.customFunMap.get(funId);
        if (fun) {
            if (parms) {
                parms.forEach((value, index) => {
                    context.setPinData(fun.outPutParmPins[index], value);
                })
            }
            return this.runByContext(context, fun);
            //  event.outExcute.excute(context);
            //let root=event.outExcute.linkTo
        }
        return null;
    }

    runByContext(context: IRunAble, node: IExcuteListInfo, enableDebugPause: boolean = true):boolean {
        const currentIndex = node.index;
        const excuteAbleList = this.excuteRuntimeList.get(node.listIndex);

        for (let i = currentIndex, n = excuteAbleList.length; i < n;) {
            const bpNode = excuteAbleList[i];
            let index = bpNode.step(context, true, this, enableDebugPause);
            enableDebugPause = true;
            if (index instanceof BlueprintPromise) {
                index.wait((mis: BlueprintPromise) => {
                    this.runByContext(context, mis, enableDebugPause);
                })
                return false;
            }
            else {
                i = index;
            }
        }
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
            this.getNodeById(item.id).parseLinkData(item, this);
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