import { BlueprintConst } from "../../core/BlueprintConst";
import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { INodeManger } from "../../core/interface/INodeManger";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { TBPVarProperty, TBPEventProperty, TBPNode } from "../../datas/types/BlueprintTypes";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintPromise } from "../BlueprintPromise";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintEventNode } from "../node/BlueprintEventNode";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { BluePrintEventBlock } from "./BluePrintEventBlock";

export class BluePrintBlock implements INodeManger<BlueprintRuntimeBaseNode>, IBPRutime {
    hasRefAnony: boolean;
    
    localVarMap: Record<string, TBPVarProperty>;

    get blockSourceType(): EBlockSource {
        return EBlockSource.Unknown;
    }

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

    anonymousfunMap: Map<number, BlueprintEventNode>;

    anonymousBlockMap: Map<number, BluePrintEventBlock>;

    //private varMap: Record<string, TBPVarProperty>;

    dataMap: Record<string, TBPVarProperty | TBPEventProperty>;

    // private _asList: BluePrintAsNode[];

    // private _pendingClass: Map<string, number[]>;

    constructor(id: symbol | number) {
        this.id = id;
        this._maxID = 0;
        this.excuteList = [];
        this.idToIndex = new Map();
        this.idToIndex.set(BlueprintConst.NULL_NODE, BlueprintConst.MAX_CODELINE);
        this.nodeMap = new Map();
        this.poolIds = [];
        this.anonymousfunMap = new Map();
        this.anonymousBlockMap = new Map();
    }
    getDataMangerByID(context:IRunAble): IRuntimeDataManger {
        return context.getDataMangerByID(this.id);
    }

    get bpId(): string {
        return this.name;
    }

    getNodeById(id: any): BlueprintRuntimeBaseNode {
        return this.nodeMap.get(id);
    }

    idToIndex: Map<number, number>;

    private _addNode(value: BlueprintRuntimeBaseNode, excuteAbleList: BlueprintRuntimeBaseNode[]): boolean {
        if (excuteAbleList.indexOf(value) == -1) {
            this.idToIndex.set(value.nid, excuteAbleList.length);
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

    }

    protected onParse(bpjson: TBPNode[]) {

    }



    append(node: BlueprintRuntimeBaseNode, item: TBPNode) {
        this.nodeMap.set(node.nid, node);
    }

    // run(context: IRunAble, eventName: string, parms: any[], cb: Function, runId: number, execId: number): boolean {
    //     return false;
    // }

    getRunID() {
        //console.log(">>>>>>>>>>获取节点ID");
        if (this.poolIds.length > 0) {
            return this.poolIds.pop();
        }
        else {
            return ++this._maxID;
        }
    }

    _recoverRunID(id: number, runtimeDataMgr: IRuntimeDataManger) {
        this.poolIds.push(id);
        runtimeDataMgr.clearVar(id);
    }

    recoverRunID(id: number, runtimeDataMgr: IRuntimeDataManger) {
        if (this.hasRefAnony) {
            this.poolIds.push(id);
            runtimeDataMgr.clearVar(id);
        }
    }

    runAnonymous(context: IRunAble, event: BlueprintEventNode, parms: any[], cb: Function, runId: number, execId: number, newRunId: number, oldRuntimeDataMgr: IRuntimeDataManger): boolean {
        let anonymousBlock = this.anonymousBlockMap.get(event.nid);
        if (anonymousBlock.haRef) oldRuntimeDataMgr.saveContextData(runId, newRunId);
        return anonymousBlock.run(context, event, parms, cb, newRunId, execId);
        //return this.runByContext(context, runtimeDataMgr, event, true, cb, curRunId, event.outExcutes[execId], null);
    }


    runByContext(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, node: IExcuteListInfo, enableDebugPause: boolean, cb: Function, runId: number, fromPin: BlueprintPinRuntime, prePin: BlueprintPinRuntime, notRecover: boolean = false): boolean {
        if (runId == -1) {
            runId = this.getRunID();
        }
        let idToIndex = this.idToIndex;
        const currentIndex = idToIndex.get(node.nid);
        const excuteAbleList = this.excuteList;
        let brecover = true;
        //let fromPin: BlueprintPinRuntime;
        for (let i = currentIndex, n = excuteAbleList.length; i < n;) {
            const bpNode = excuteAbleList[i];
            let index = bpNode.step(context, runtimeDataMgr, true, this, enableDebugPause, runId, fromPin, prePin);
            enableDebugPause = true;
            if (index instanceof BlueprintPinRuntime) {
                prePin = index;
                fromPin = index.linkTo[0] as BlueprintPinRuntime;
                if (fromPin == null) {
                    break;
                } else {
                    i = idToIndex.get(fromPin.owner.nid);
                }
            }
            else if (index instanceof BlueprintPromise) {
                index.wait((mis: BlueprintPromise) => {
                    this.runByContext(context, runtimeDataMgr, mis, mis.enableDebugPause != undefined ? mis.enableDebugPause : enableDebugPause, cb, runId, mis.pin, mis.prePin);
                })
                return false;
            }
            else if (index == null) {
                break;
            }
            else {
                brecover = false;
                break;
            }
        }
        cb && cb();
        if (!notRecover && brecover) {
            this.recoverRunID(runId, runtimeDataMgr);
        }
        //console.log(">>>>>>>>>>>>>runID over:" + runId);
        return true;
    }
}

export enum EBlockSource{
    Unknown,
    Main,
    Function
}