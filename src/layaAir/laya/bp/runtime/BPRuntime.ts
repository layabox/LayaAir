import { TBPCNode, TBPNode } from "../datas/types/BlueprintTypes";
import { EBlueNodeType } from "../core/EBluePrint";
import { INodeManger } from "../core/interface/INodeManger";
import { TBPNodeData } from "../core/type/TBluePrint";

import { BPFactory } from "./BPFactory";
import { BPPinRuntime } from "./BPPinRuntime";
import { BPPromise } from "./BPPromise";
import { IBPRutime } from "./interface/IBPRutime";
import { IRunAble } from "./interface/IRunAble";
import { BPEventNode } from "./node/BPEventNode";
import { BPRuntimeBaseNode } from "./node/BPRuntimeBaseNode";

export class BPRuntime implements INodeManger<BPRuntimeBaseNode>,IBPRutime{

    nodeMap: Map<any, BPRuntimeBaseNode>;

    eventMap: Map<any, BPEventNode>;

    excuteAbleList: BPRuntimeBaseNode[];
    constructor() {
        this.nodeMap = new Map();
        this.eventMap = new Map();
        this.excuteAbleList = [];
    }
 

    append(node: BPRuntimeBaseNode) {
        this.nodeMap.set(node.nid, node);
        switch (node.type) {
            case EBlueNodeType.Event:
                this.eventMap.set(node.name, node as BPEventNode);
                break;
        }
    }

    run(context: IRunAble, eventName: string, parms: any[]) {
        let event = this.eventMap.get(eventName);
        if (event) {
            if (parms) {
                parms.forEach((value, index) => {
                    event.inPutParmPins[index].setValue(value);
                })
            }
            this.runByContext(context, event.index);
            //  event.outExcute.excute(context);
            //let root=event.outExcute.linkTo
        }
    }

    runByContext(context: IRunAble, currentIndex: number,enableDebugPause:boolean=true) {
        for (let i = currentIndex, n = this.excuteAbleList.length; i < n;) {
            const bpNode = this.excuteAbleList[i];
            let index = bpNode.step(context, true, this,enableDebugPause);
            enableDebugPause=true;
            if (index instanceof BPPromise) {
                index.wait((mis: BPPromise) => {
                    this.runByContext(context, mis.curIndex,enableDebugPause);
                })
                return;
            }
            else {
                i = index;
            }
        }
    }

    parseNew(bpjson:Array<TBPNode>,getCNodeByNode:(node:TBPNode)=>TBPCNode){
        //pin create
        bpjson.forEach(item => {
            let d = BPFactory.instance.createNew(getCNodeByNode(item));
            d.nid = item.id;
            this.append(d);
        });
        // debugger;

        bpjson.forEach(item => {
            // debugger;
            this.getNodeById(item.id).parseLinkDataNew(item, this);
        });
        this.optimize();
    }

    private _addNode(value: BPRuntimeBaseNode): boolean {
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
            let stack: BPRuntimeBaseNode[] = [value];
            while (stack.length > 0) {
                const node = stack.pop();
                if (this._addNode(node) && node.outExcutes) {
                    node.optimize();
                    node.outExcutes.forEach(item => {
                        if (item.linkTo && item.linkTo[0]) {
                            stack.push((item.linkTo[0] as BPPinRuntime).owner);
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

    getNodeById(id: any): BPRuntimeBaseNode {
        return this.nodeMap.get(id);
    }
}