import { BlueprintUtil } from "../../core/BlueprintUtil";
import { TBPNode, BPType } from "../../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../BlueprintFactory";
import { BlueprintRuntime } from "../BlueprintRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintAutoRun } from "../node/BlueprintAutoRun";
import { BlueprintEventNode } from "../node/BlueprintEventNode";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { EBlockSource } from "./BluePrintBlock";
import { BluePrintComplexBlock } from "./BluePrintComplexBlock";
import { BluePrintEventBlock } from "./BluePrintEventBlock";

export class BluePrintMainBlock extends BluePrintComplexBlock {
    autoAnonymousfuns: BlueprintEventNode[];
    autoRunNodes: BlueprintAutoRun[];
    eventBlockMap: Map<number, BluePrintEventBlock>;
    constructor(id: symbol) {
        super(id);
        this.eventMap = new Map();
        this.autoAnonymousfuns = [];
        this.autoRunNodes = [];
        this.eventBlockMap = new Map();
    }
    get bpName() {
        return BlueprintUtil.getNameByUUID(this.name);
    }
    get blockSourceType(): EBlockSource {
        return EBlockSource.Main;
    }
    eventMap: Map<any, BlueprintEventNode>;
    cls: Function;
    optimize() {
        super.optimize();
        this.initEventBlockMap(this.eventMap, this.eventBlockMap);
        this.eventBlockMap.forEach(value => {
            value.optimizeByBlockMap(this);
        });

        this.anonymousBlockMap.forEach(value => {
            this.eventBlockMap.set(value.id as number, value);
        });
        for (let i = 0, n = this.autoRunNodes.length; i < n; i++) {
            let item = this.autoRunNodes[i];
            let hasLink = false;
            for (let j = 0, m = item.outPutParmPins.length; j < m; j++) {
                let pin = item.outPutParmPins[j];
                if (pin.linkTo.length > 0) {
                    hasLink = true;
                    break;
                }
            }
            if (hasLink) {
                this.autoRunNodes.splice(i, 1);
                i--;
                n--;
            }
        }

    }

    protected onEventParse(eventName: string) {
        let cls = this.cls;
        let originFunc: Function = cls.prototype[eventName];
        let _this = this;
        cls.prototype[eventName] = function (...args: any[]) {
            //     const funcContext: IRunAble = this[BlueprintFactory.contextSymbol];
            //     originFunc && originFunc.call(this, args);
            //     this[BlueprintFactory.bpSymbol].run(funcContext, eventName, args);
            _this._onEventParse(eventName, originFunc, this, ...args);
        }
    }

    protected _onEventParse(...args: any[]) {
        const eventName = args.shift();
        const originFunc = args.shift();
        const caller = args.shift();

        const funcContext: IRunAble = caller[BlueprintFactory.contextSymbol];
        originFunc && originFunc.call(caller, args);
        (caller[BlueprintFactory.bpSymbol] as BlueprintRuntime).run(funcContext, this.eventMap.get(eventName), args, null);
    }

    append(node: BlueprintRuntimeBaseNode, item: TBPNode) {
        super.append(node, item);
        switch (node.type) {
            case BPType.Pure:
                if (node instanceof BlueprintAutoRun) {
                    this.autoRunNodes.push(node);
                }
                break;
            case BPType.Event:
                if (!item.dataId) {
                    this.eventMap.set(node.name, node as BlueprintEventNode);
                }
                else if (item.dataId && item.autoReg) {
                    this.autoAnonymousfuns.push(node as BlueprintEventNode);
                }
                break;
        }
    }

    runAuto(context: IRunAble) {
        context.initData(this.id, this.nodeMap, this.localVarMap);
        let id = this.getRunID();
        for (let i = 0, n = this.autoRunNodes.length; i < n; i++) {
            let item = this.autoRunNodes[i];
            item.step(context, context.getDataMangerByID(this.id), true, this, true, id, null, null);
        }
    }

    run(context: IRunAble, event: BlueprintEventNode, parms: any[], cb: Function, runId: number, execId: number): boolean {
        context.initData(this.id, this.nodeMap, this.localVarMap);
        return this.eventBlockMap.get(event.nid).run(context, event, parms, cb, runId, execId);
    }

    finishChild(context:IRunAble,runtime:IBPRutime) {
        context.finish(runtime);
    }
    
}
