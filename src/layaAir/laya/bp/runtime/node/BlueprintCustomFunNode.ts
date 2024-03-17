import { BlueprintUtil } from "../../core/BlueprintUtil";
import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { IBluePrintSubclass } from "../../core/interface/IBluePrintSubclass";
import { INodeManger } from "../../core/interface/INodeManger";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { TBPNode } from "../../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../BlueprintFactory";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntime } from "../BlueprintRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintFunNode } from "./BlueprintFunNode";

export class BlueprintCustomFunNode extends BlueprintFunNode {
    /**
     * 输入引脚
     */
    inExcutes: BlueprintPinRuntime[];
    functionID: number;
    staticContext: IRunAble;
    bpruntime: BlueprintRuntime;

    private _isCheck: boolean;

    constructor() {
        super();
        this.inExcutes = [];
    }

    colloctParam(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, inputPins: BlueprintPinRuntime[], runner: IBPRutime, runId: number) {
        this._checkFun();
        let parmsArray = super.colloctParam(context, runtimeDataMgr, this.inPutParmPins, runner, runId);
        context.parmFromOutPut(this.outPutParmPins, runtimeDataMgr, parmsArray);
        return parmsArray;
    }

    private _checkFun() {
        if (!this._isCheck) {
            this._isCheck = true;
            if (this.bpruntime) {
                let fun = this.bpruntime.funBlockMap.get(this.functionID);
                if (fun && fun.isStatic) {
                    this.isMember = false;
                }
                else {
                    this.staticContext = null;
                }
            }
        }
    }

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintFunNode>) {
        let id = node.dataId;
        if (id) {
            this.functionID = id as any as number;
            this.isMember = true;
            let cls = BlueprintUtil.getClass(node.target);
            if (cls) {
                this.bpruntime = cls.prototype[BlueprintFactory.bpSymbol];
                this.staticContext = cls[BlueprintFactory.contextSymbol];
            }
            //this.eventName = (manger.dataMap[node.dataId] as TBPEventProperty).name;
        }
    }

    protected excuteFun(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, runner: IBPRutime, caller: IBluePrintSubclass, parmsArray: any[], runId: number, fromPin: BlueprintPinRuntime) {
        //TODO 
        let bpRuntime: BlueprintRuntime;
        let _funcContext: IRunAble;
        if (!this.isMember) {
            bpRuntime = this.bpruntime;
            _funcContext = this.staticContext;
        }
        else if (caller && caller[BlueprintFactory.contextSymbol]) {
            bpRuntime = caller[BlueprintFactory.bpSymbol];
            _funcContext = caller[BlueprintFactory.contextSymbol];
        }
        else {
            return null;
        }
        let primise: Promise<any>;
        let cb: any;
        let result: any;

        result = bpRuntime.runCustomFun(_funcContext, this.functionID, parmsArray, () => {
            this._excuteFun(_funcContext, cb, parmsArray, runner);
        }, runId, this.inExcutes.indexOf(fromPin), this.outExcutes, runner, runtimeDataMgr);
        if (result === false) {
            primise = new Promise((resolve, reject) => {
                cb = resolve;
            });
            return primise;
        }
        return null;
        //return context.excuteFun(this.nativeFun, this.outPutParmPins, caller, parmsArray);
    }

    protected _excuteFun(context: IRunAble, cb: any, parmsArray: any[], runner: IBPRutime) {
        if (cb) {
            cb();
        }
    }

    addPin(pin: BlueprintPinRuntime) {
        super.addPin(pin);
        if (pin.type == EPinType.Exec) {
            if (pin.direction == EPinDirection.Input) {
                this.inExcutes.push(pin);
            }
        }
    }

    optimize() {
        let linkto = this.outExcutes[0].linkTo;
        this.staticNext = linkto[0] as BlueprintPinRuntime;
    }


    setFunction(fun: Function, isMember: boolean) {
        this.nativeFun = this.customFun;//fun;
        this.isMember = isMember;
        this.funcode = fun?.name;
    }


    customFun(parms: any[]) {

    }
}