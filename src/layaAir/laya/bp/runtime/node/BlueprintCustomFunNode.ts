import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { IBluePrintSubclass } from "../../core/interface/IBluePrintSubclass";
import { INodeManger } from "../../core/interface/INodeManger";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { TBPNode } from "../../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../BlueprintFactory";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintFunNode } from "./BlueprintFunNode";

export class BlueprintCustomFunNode extends BlueprintFunNode {
    /**
     * 输入引脚
     */
    inExcutes: BlueprintPinRuntime[];
    functionID: number;

    constructor() {
        super();
        this.inExcutes = [];
    }

    colloctParam(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, inputPins: BlueprintPinRuntime[], runner: IBPRutime, runId: number){
        let parmsArray=super.colloctParam(context, runtimeDataMgr, this.inPutParmPins, runner, runId);
        context.parmFromOutPut(this.outPutParmPins, runtimeDataMgr, parmsArray);
        return parmsArray;
    }

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintFunNode>) {
        let id = node.dataId;
        if (id) {
            this.functionID = id as any as number;
            this.isMember = true;
            //this.eventName = (manger.dataMap[node.dataId] as TBPEventProperty).name;
        }
    }

    protected excuteFun(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, runner: IBPRutime, caller: IBluePrintSubclass, parmsArray: any[], runId: number, fromPin: BlueprintPinRuntime) {
        //TODO 
        if (caller && caller[BlueprintFactory.contextSymbol]) {
            let primise: Promise<any>;
            let cb: any;
            let result: any;
            let _funcContext = caller[BlueprintFactory.contextSymbol];
            result = caller[BlueprintFactory.bpSymbol].runCustomFun(_funcContext, this.functionID, parmsArray, () => {
                this._excuteFun(_funcContext, cb, parmsArray);
            }, runId, this.inExcutes.indexOf(fromPin), this.outExcutes, runner, runtimeDataMgr);
            if (result === false) {
                primise = new Promise((resolve, reject) => {
                    cb = resolve;
                });
                return primise;
            }
        }
        return null;
        //return context.excuteFun(this.nativeFun, this.outPutParmPins, caller, parmsArray);
    }

    protected _excuteFun(context: IRunAble, cb: any, parmsArray: any[]) {
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
        if (this.outExcutes.length == 1) {
            let linkto = this.outExcute.linkTo;
            this.staticNext = linkto[0] as BlueprintPinRuntime;
        }
        else {
            this.staticNext = null;
        }
    }


    setFunction(fun: Function, isMember: boolean) {
        this.nativeFun = this.customFun;//fun;
        this.isMember = isMember;
        this.funcode = fun?.name;
    }


    customFun(parms: any[]) {

    }
}