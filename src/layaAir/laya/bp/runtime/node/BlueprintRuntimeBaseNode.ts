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
    canCache: boolean;
    /**
     * 输入参数列表 
     */
    inPutParmPins: BlueprintPinRuntime[];
    /**
     * 输出参数列表
     */
    outPutParmPins: BlueprintPinRuntime[];

    returnValue: BlueprintPinRuntime;


    /**
     * 输出引脚
    */
    outExcutes: BlueprintPinRuntime[];

    tryExcute: (context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime, prePin:BlueprintPinRuntime) => BlueprintPinRuntime | BlueprintPromise | number;

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

    protected excuteFun(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, runner: IBPRutime, caller: any, parmsArray: any[], runId: number, fromPin: BlueprintPinRuntime) {
        return context.excuteFun(this.nativeFun, this.returnValue, runtimeDataMgr, caller, parmsArray, runId);
    }

    protected colloctParam(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, inputPins: BlueprintPinRuntime[], runner: IBPRutime, runId: number, prePin:BlueprintPinRuntime) {
        let _parmsArray: any[] = runtimeDataMgr.getDataById(this.nid).getParamsArray(runId);;
        _parmsArray.length = 0;
        for (let i = 0, n = inputPins.length; i < n; i++) {
            const curInput = inputPins[i];
            let from = curInput.linkTo[0];
            if (from) {
                if (!context.readCache) {
                    (from as BlueprintPinRuntime).step(context, runtimeDataMgr, runner, runId, prePin);
                }
                context.parmFromOtherPin(curInput, runtimeDataMgr, from as BlueprintPinRuntime, _parmsArray, runId);
            }
            else {
                context.parmFromSelf(curInput, runtimeDataMgr, _parmsArray, runId);
            }
        }
        context.readCache = false;
        return _parmsArray;
    }
    private _checkRun(parmsArray: any[]): Promise<any> {
        let promiseList: Promise<any>[];
        parmsArray.forEach((parm) => {
            if (parm instanceof Promise) {
                if (!promiseList) promiseList = [];
                promiseList.push(parm);
            }
        });
        if (promiseList) {
            return Promise.all(promiseList);
        }
        else {
            return null;
        }
    }

    step(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime, prePin:BlueprintPinRuntime): BlueprintPinRuntime | BlueprintPromise | number {
        let _parmsArray: any[] = this.colloctParam(context, runtimeDataMgr, this.inPutParmPins, runner, runId, prePin);
        if (this.outPutParmPins.length > 1) {
            context.parmFromOutPut(this.outPutParmPins, runtimeDataMgr, _parmsArray);
            context.parmFromCustom(_parmsArray, runId, "runId");
        }
        let promise = this._checkRun(_parmsArray);
        if (promise) {
            let bPromise = BlueprintPromise.create();
            this.returnValue && runtimeDataMgr.setPinData(this.returnValue, promise, runId);
            promise.then((value) => {
                //debugger;
                if (bPromise.hasCallBack()) {
                    bPromise.index = this.index;
                    bPromise.pin = fromPin;
                    bPromise.prePin = prePin;
                    bPromise.listIndex = this.listIndex;
                    context.readCache = true;
                    bPromise.complete();
                }
                else {
                    context.readCache = true;
                    this.step(context, runtimeDataMgr, fromExcute, runner, enableDebugPause, runId, fromPin, prePin);
                }
                bPromise.recover();
                //let result =this.step(context, runtimeDataMgr, fromExcute, runner, enableDebugPause, runId, fromPin);
            });
            return bPromise;
        }
        const result = fromExcute && context.beginExcute(this, runner, enableDebugPause, fromPin, _parmsArray, prePin);
        if (result) {
            return result;
        }
        if (this.nativeFun) {
            let caller = null;
            if (this.isMember) {
                let temp = _parmsArray.shift();
                caller = temp === undefined ? context.getSelf() : temp;
            }
            let result = this.excuteFun(context, runtimeDataMgr, runner, caller, _parmsArray, runId, fromPin);
            if (result instanceof Promise) {
                let promise = BlueprintPromise.create();
                result.then((value) => {
                    this.returnValue && runtimeDataMgr.setPinData(this.returnValue, value, runId);
                    let pin = this.next(context, runtimeDataMgr, _parmsArray, runner, enableDebugPause, runId, fromPin);
                    pin = pin.linkTo[0] as BlueprintPinRuntime;
                    promise.index = pin ? pin.owner.index : BlueprintConst.MAX_CODELINE;
                    promise.pin = pin;
                    promise.prePin = prePin;
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
        return this.next(context, runtimeDataMgr, _parmsArray, runner, true, runId, fromPin);
    }

    next(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime): BlueprintPinRuntime {
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
                    if (this.outPutParmPins.length == 1) {
                        this.returnValue = pin;
                    }
                    else {
                        this.returnValue = null;
                    }
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

}