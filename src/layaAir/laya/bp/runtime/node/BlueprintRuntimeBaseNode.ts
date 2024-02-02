import { EPinType, EPinDirection } from "../../core/EBluePrint";
import { BlueprintNode } from "../../core/BlueprintNode";
import { TBPPinDef } from "../../core/type/TBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintPromise } from "../BlueprintPromise";
import { BlueprintConst } from "../../core/BlueprintConst";
import { IBPRutime } from "../interface/IBPRutime";
import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { TBPCNode } from "../../datas/types/BlueprintTypes";
import { BlueprintExcuteDebuggerNode } from "../action/BlueprintExcuteDebuggerNode";

export class BlueprintRuntimeBaseNode extends BlueprintNode<BlueprintPinRuntime> implements IExcuteListInfo {
    /**
     * 在excuteAbleList中的索引
     */
    index: number;
    /**
     * excuteAbleList 的 map索引
     */
    listIndex: number | symbol;
    staticNext: BlueprintPinRuntime;//下一个节点
    private static _EMPTY: BlueprintPinRuntime[] = [];
    nativeFun: Function;
    isMember: boolean;
    funcode: string;
    /**
     * 输入参数列表 
     */
    inPutParmPins: BlueprintPinRuntime[];
    /**
     * 输出参数列表
     */
    outPutParmPins: BlueprintPinRuntime[];


    /**
     * 输出引脚
    */
    outExcutes: BlueprintPinRuntime[];

    tryExcute: (context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime) => BlueprintPinRuntime | BlueprintPromise;

    hasDebugger: boolean;
    constructor() {
        super();
        this.inPutParmPins = BlueprintRuntimeBaseNode._EMPTY;
        this.outPutParmPins = BlueprintRuntimeBaseNode._EMPTY;
        this.tryExcute = this.step;
        // this._parmsArray=[];
    }


    emptyExcute(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime): BlueprintPinRuntime | BlueprintPromise {
        return null;
    }


    createPin(def: TBPPinDef): BlueprintPinRuntime {
        let pin = new BlueprintPinRuntime();
        pin.parse(def);
        return pin;
    }

    protected excuteFun(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, caller: any, parmsArray: any[], runId: number, fromPin: BlueprintPinRuntime) {
        return context.excuteFun(this.nativeFun, this.outPutParmPins, runtimeDataMgr, caller, parmsArray, runId);
    }

    protected colloctParam(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, inputPins: BlueprintPinRuntime[], runner: IBPRutime, runId: number) {
        let _parmsArray: any[] = runtimeDataMgr.getDataById(this.nid).getParamsArray(runId);;
        _parmsArray.length = 0;
        for (let i = 0, n = inputPins.length; i < n; i++) {
            const curInput = inputPins[i];
            let from = curInput.linkTo[0];
            if (from) {
                (from as BlueprintPinRuntime).step(context, runtimeDataMgr, runner, runId);
                context.parmFromOtherPin(curInput, runtimeDataMgr, from as BlueprintPinRuntime, _parmsArray, runId);
            }
            else {
                context.parmFromSelf(curInput, runtimeDataMgr, _parmsArray, runId);
            }
        }
        return _parmsArray;
    }


    step(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime): BlueprintPinRuntime | BlueprintPromise {
        if (fromExcute && context.beginExcute(this, runner, enableDebugPause)) {
            return this.getDebuggerPromise(context,fromPin);
        }
        let _parmsArray: any[] = this.colloctParam(context, runtimeDataMgr, this.inPutParmPins, runner, runId);
        context.parmFromOutPut(this.outPutParmPins, runtimeDataMgr, _parmsArray);
        if (this.nativeFun) {
            let caller = null;
            if (this.isMember) {
                let temp = _parmsArray.shift();
                caller = temp === undefined ? context.getSelf() : temp;
            }
            let result = this.excuteFun(context, runtimeDataMgr, caller, _parmsArray, runId, fromPin);
            if (result instanceof Promise) {
                let promise = BlueprintPromise.create();
                result.then((value) => {
                    this.outPutParmPins[0] && runtimeDataMgr.setPinData(this.outPutParmPins[0], value, runId);
                    let pin = this.next(context, runtimeDataMgr, _parmsArray, runner, enableDebugPause, runId);
                    promise.index = pin ? pin.owner.index : BlueprintConst.MAX_CODELINE;
                    promise.pin = pin;
                    promise.listIndex = this.listIndex;
                    promise.complete();
                    promise.recover();
                })
                return promise;
            }

        }
        if (fromExcute) {
            context.endExcute(this);
        }
        return this.next(context, runtimeDataMgr, _parmsArray, runner, true, runId);
    }

    next(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number): BlueprintPinRuntime {
        return null;
    }

    addPin(pin: BlueprintPinRuntime) {
        pin.owner = this;
        super.addPin(pin);
        if (pin.type == EPinType.Other) {
            switch (pin.direction) {
                case EPinDirection.Input:
                    if (this.inPutParmPins == BlueprintRuntimeBaseNode._EMPTY) {
                        this.inPutParmPins = [];
                    }
                    this.inPutParmPins.push(pin);
                    break;
                case EPinDirection.Output:
                    if (this.outPutParmPins == BlueprintRuntimeBaseNode._EMPTY) {
                        this.outPutParmPins = [];
                    }
                    this.outPutParmPins.push(pin);
                    break;
            }
        }
    }

    optimize() {

    }

    setFunction(fun: Function, isMember: boolean) {
        this.nativeFun = fun;
        this.isMember = isMember;
        this.funcode = fun?.name;
    }

    protected addNextPIn() {

    }

    parse(def: TBPCNode): void {
        super.parse(def);
        this.hasDebugger = def.hasDebugger;
    }

    protected getDebuggerPromise(context: IRunAble, fromPin: BlueprintPinRuntime) {
        let promise = BlueprintPromise.create();
        (context as BlueprintExcuteDebuggerNode).next = (runType?: number) => {
            promise.index = this.index;
            promise.listIndex = this.listIndex;
            promise.pin = fromPin;
            promise.enableDebugPause = false;
            promise.complete();
            promise.recover();
        }
        return promise;
    }
}