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

export class BlueprintRuntime implements INodeManger<BlueprintRuntimeBaseNode>, IBPRutime {

    nodeMap: Map<any, BlueprintRuntimeBaseNode>;

    eventMap: Map<any, BlueprintEventNode>;
    /**
     * 自定义函数列表
     */
    customFunMap: Map<string, BlueprintCustomFunStart>;

    varMap: Record<string, TBPVarProperty>;

    dataMap: Record<string, TBPVarProperty | TBPEventProperty>

    excuteAbleList: BlueprintRuntimeBaseNode[];

    funRuntimeList: Map<string, BlueprintRuntimeBaseNode[]>;

    constructor() {
        this.nodeMap = new Map();
        this.eventMap = new Map();
        this.customFunMap = new Map();
        this.excuteAbleList = [];
        this.funRuntimeList = new Map();
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
            this.runByContext(context, event.index);
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
    runCustomFun(context: IRunAble, funName: string, parms: any[]) {
        let fun = this.customFunMap.get(funName);
        if (fun) {
            if (parms) {
                parms.forEach((value, index) => {
                    context.setPinData(fun.outPutParmPins[index], value);
                })
            }
            this.runByContext(context, fun.index);
            //  event.outExcute.excute(context);
            //let root=event.outExcute.linkTo
        }
    }

    runByContext(context: IRunAble, currentIndex: number, enableDebugPause: boolean = true) {
        for (let i = currentIndex, n = this.excuteAbleList.length; i < n;) {
            const bpNode = this.excuteAbleList[i];
            let index = bpNode.step(context, true, this, enableDebugPause);
            enableDebugPause = true;
            if (index instanceof BlueprintPromise) {
                index.wait((mis: BlueprintPromise) => {
                    this.runByContext(context, mis.curIndex, enableDebugPause);
                })
                return;
            }
            else {
                i = index;
            }
        }
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

    parseFunction(funId: string, bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode) {
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
        this.funRuntimeList.set(funId, funExcuteList);
        this.customFunMap.set(funId, funnode);
        this.optimizeByStart(funnode, funExcuteList);
    }

    private _addNode(value: BlueprintRuntimeBaseNode, excuteAbleList: BlueprintRuntimeBaseNode[]): boolean {
        if (excuteAbleList.indexOf(value) == -1) {
            value.index = excuteAbleList.length;
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


    optimize() {
        this.eventMap.forEach(value => {
            this.optimizeByStart(value, this.excuteAbleList);
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