
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BPType } from "../../datas/types/BlueprintTypes";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintEventNode } from "../node/BlueprintEventNode";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { BluePrintBlock, EBlockSource } from "./BluePrintBlock";
import { BluePrintComplexBlock } from "./BluePrintComplexBlock";

export class BluePrintEventBlock extends BluePrintBlock {
    protected parentId: symbol | number;
    protected parent: BluePrintComplexBlock;
    haRef: boolean = false;
    static findParamPin(node: BlueprintRuntimeBaseNode, nodeMap: Map<any, BlueprintRuntimeBaseNode>, anonymousfunMap: Map<number, BlueprintEventNode>,excuteList: BlueprintRuntimeBaseNode[],bluePrintEventBlock:BluePrintEventBlock) {
        let nodeData = nodeMap.get(node.nid);
        if (nodeData) {
            return;
        }
        else {
            //node.addRef();
            nodeMap.set(node.nid, node);
            node.inPutParmPins.forEach(value => {
                let linkPin = value.linkTo[0];
                if (linkPin) {
                    let linkNode = (linkPin as BlueprintPinRuntime).owner;
                    if (linkNode.outExcutes?.length > 0) {
                        if (linkNode.type == BPType.Event && (linkNode as BlueprintEventNode).isAnonymous) {
                            anonymousfunMap.set(linkNode.nid, linkNode as BlueprintEventNode);
                        }
                        if(!nodeMap.has(linkNode.nid)){
                            //linkNode.addRef();

                            if(excuteList.indexOf(linkNode) == -1){
                                bluePrintEventBlock.haRef = true;
                            }
                            nodeMap.set(linkNode.nid, linkNode);
                        }
                    }
                    else {
                        BluePrintEventBlock.findParamPin(linkNode, nodeMap, anonymousfunMap,excuteList,bluePrintEventBlock);
                    }
                }
            });
        }
    }

    init(event: BlueprintEventNode) {
        this.name = event.eventName || event.name;
        this.optimizeByStart(event, this.excuteList);
        this.excuteList.forEach(value => {
            //this.nodeMap.set(value.nid, value);
            BluePrintEventBlock.findParamPin(value, this.nodeMap, this.anonymousfunMap,this.excuteList,this);
        });
    }

    private _checkRef() {
        for (let key of this.nodeMap.keys()) {
            let node = this.nodeMap.get(key);
            if (node.getRef() > 1) {
                return true;
            }
        }
        return false;
    }

    optimizeByBlockMap(parent: BluePrintComplexBlock): void {
        this.parentId = parent.id;
        this.parent = parent;
        //this.haRef = this._checkRef();
        let hasRefAnony = false;
        this.anonymousfunMap.forEach(value => {
            let block = parent.anonymousBlockMap.get(value.nid);
            if (block.haRef) {
                hasRefAnony = true;
            }
            this.anonymousBlockMap.set(value.nid, block);
        });
        this.hasRefAnony = hasRefAnony;
    }

    getRunID() {
        return this.parent.getRunID();
    }

    recoverRunID(id: number, runtimeDataMgr: IRuntimeDataManger) {
        if (!this.hasRefAnony) {
            this.parent._recoverRunID(id, runtimeDataMgr);
        }
    }

    run(context: IRunAble, event: BlueprintEventNode, parms: any[], cb: Function, runId: number, execId: number): boolean {
        //context.initData(this.parentId, this.nodeMap, this.localVarMap, this.parentId);

        //let curRunId = this.getRunID();
        let runtimeDataMgr = context.getDataMangerByID(this.parentId);
        if (parms) {
            event.initData(runtimeDataMgr, parms, runId);
        }
        return this.runByContext(context, runtimeDataMgr, event, true, cb, runId, event.outExcutes[execId], null);
    }

    getDataMangerByID(context:IRunAble): IRuntimeDataManger {
        return context.getDataMangerByID(this.parentId);
    }

    get bpId(): string {
        return this.parent.name;
    }

    get blockSourceType(): EBlockSource {
        return this.parent.blockSourceType;
    }
}