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

export class BlueprintRuntime implements INodeManger<BlueprintRuntimeBaseNode>, IBPRutime {

    nodeMap: Map<any, BlueprintRuntimeBaseNode>;

    eventMap: Map<any, BlueprintEventNode>;

    varMap: Record<string, TBPVarProperty>;

    dataMap: Record<string, TBPVarProperty | TBPEventProperty>

    excuteAbleList: BlueprintRuntimeBaseNode[];

    constructor() {
        this.nodeMap = new Map();
        this.eventMap = new Map();
        this.excuteAbleList = [];
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

    parseNew(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>) {
        this.varMap = varMap;
        //pin create
        bpjson.forEach(item => {
            let d = BlueprintFactory.instance.createNew(getCNodeByNode(item),item.id);
            this.append(d);
        });
        // debugger;

        bpjson.forEach(item => {
            // debugger;
            this.getNodeById(item.id).parseLinkDataNew(item, this);
        });
        this.optimize();
    }

    private _addNode(value: BlueprintRuntimeBaseNode): boolean {
        if (this.excuteAbleList.indexOf(value) == -1) {
            value.index = this.excuteAbleList.length;
            this.excuteAbleList.push(value);
            return true;
        }
        else {
            return false;
        }

    }

    optimize() {
        this.eventMap.forEach(value => {
            let stack: BlueprintRuntimeBaseNode[] = [value];
            while (stack.length > 0) {
                const node = stack.pop();
                if (this._addNode(node) && node.outExcutes) {
                    node.optimize();
                    node.outExcutes.forEach(item => {
                        if (item.linkTo && item.linkTo[0]) {
                            stack.push((item.linkTo[0] as BlueprintPinRuntime).owner);
                        }
                    })
                }
            }
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