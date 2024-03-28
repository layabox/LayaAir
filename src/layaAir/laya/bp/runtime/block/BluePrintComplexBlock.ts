import { BlueprintUtil } from "../../core/BlueprintUtil";
import { TBPNode, TBPCNode, TBPVarProperty, BPType } from "../../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../BlueprintFactory";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";

import { BluePrintAsNode } from "../node/BlueprintAsNode";
import { BlueprintEventNode } from "../node/BlueprintEventNode";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { BluePrintBlock } from "./BluePrintBlock";
import { BluePrintEventBlock } from "./BluePrintEventBlock";

export class BluePrintComplexBlock extends BluePrintBlock {
    static EventId: number = 0;
    private _asList: BluePrintAsNode[];
    private _pendingClass: Map<string, number[]>;
    private _eventId: number;


    constructor(id: symbol | number) {
        super(id);
        this._asList = [];
        this._pendingClass = new Map();
        this._eventId = BluePrintComplexBlock.EventId++;
    }

    protected initEventBlockMap(map: Map<number, BlueprintEventNode>, eventMap: Map<number, BluePrintEventBlock>) {
        map.forEach(value => {
            let eventBlock = eventMap.get(value.nid);
            if (!eventBlock) {
                eventBlock = new BluePrintEventBlock(value.nid);
                eventMap.set(value.nid, eventBlock);
            }
            eventBlock.init(value);
            eventBlock.dataMap = this.dataMap;
            eventBlock.optimize();
            // let 
        });
    }

    optimize(): void {
        super.optimize();
        this._asList.forEach(value => {
            value.optimize();
        });
        this.initEventBlockMap(this.anonymousfunMap, this.anonymousBlockMap);
        this.anonymousBlockMap.forEach(value => {
            value.optimizeByBlockMap(this);
        });
    }

    parse(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>) {
        this.localVarMap = varMap;
        //check ready?
        if (!this._checkReady(bpjson, getCNodeByNode, varMap)) return;
        //pin create

        bpjson.forEach(item => {
            let node = BlueprintFactory.instance.createNew(getCNodeByNode(item), item);
            this.append(node, item);
        });
        // debugger;

        bpjson.forEach(item => {
            // debugger;
            this.getNodeById(item.id).parseLinkData(item, this);
        });
        this.onParse(bpjson);
        this.optimize();
    }

    private _onReParse(bpjson: Array<TBPNode>, getCNodeByNode: (node: TBPNode) => TBPCNode, varMap: Record<string, TBPVarProperty>, name: string) {
        let result = this._pendingClass.get(name);
        if (result) {
            this._pendingClass.delete(name);
        }
        if (this._pendingClass.size == 0) {
            delete BlueprintUtil.onfinishCallbacks[this._eventId];
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

            BlueprintUtil.onfinishCallbacks[this._eventId] = [this._onReParse, this, [bpjson, getCNodeByNode, varMap]];
            return false;
        }
        return true;
    }

    append(node: BlueprintRuntimeBaseNode, item: TBPNode) {
        super.append(node, item);
        switch (node.type) {
            case BPType.Assertion:
                this._asList.push(node);
                break;
            case BPType.Event:
                if (item.dataId) {
                    this.anonymousfunMap.set(node.nid, node as BlueprintEventNode);
                }
                break;
        }
    }

    finishChild(context:IRunAble,runtime:IBPRutime) {
    }

}