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

export class BlueprintRuntimeBaseNode extends BlueprintNode<BlueprintPinRuntime> implements IExcuteListInfo {
    /**
     * 在excuteAbleList中的索引
     */
    index: number;
    /**
     * excuteAbleList 的 map索引
     */
    listIndex: number | symbol;
    staticNext: BlueprintRuntimeBaseNode;//下一个节点
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

    nextNode: BlueprintRuntimeBaseNode;

    /**
     * 输出引脚
    */
    outExcutes: BlueprintPinRuntime[];

    tryExcute: (context: IRunAble, runTimeData: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime) => number | BlueprintPromise;

    constructor() {
        super();
        this.inPutParmPins = BlueprintRuntimeBaseNode._EMPTY;
        this.outPutParmPins = BlueprintRuntimeBaseNode._EMPTY;
        this.tryExcute = this.step;
        // this._parmsArray=[];
    }

    createPin(def: TBPPinDef): BlueprintPinRuntime {
        let pin = new BlueprintPinRuntime();
        pin.parse(def);
        return pin;
    }

    protected excuteFun(context: IRunAble, runTimeData: IRuntimeDataManger, caller: any, parmsArray: any[], runId: number) {
        return context.excuteFun(this.nativeFun, this.outPutParmPins, runTimeData, caller, parmsArray, runId);
    }

    protected colloctParam(context: IRunAble, runTimeData: IRuntimeDataManger, inputPins: BlueprintPinRuntime[], runner: IBPRutime, runId: number) {
        let _parmsArray: any[] = runTimeData.getDataById(this.nid).getParamsArray(runId);;
        _parmsArray.length = 0;
        for (let i = 0, n = inputPins.length; i < n; i++) {
            const curInput = inputPins[i];
            let from = curInput.linkTo[0];
            if (from) {
                (from as BlueprintPinRuntime).step(context, runTimeData, runner, runId);
                context.parmFromOtherPin(curInput, runTimeData, from as BlueprintPinRuntime, _parmsArray, runId);
            }
            else {
                context.parmFromSelf(curInput, runTimeData, _parmsArray, runId);
            }
        }
        return _parmsArray;
    }


    step(context: IRunAble, runTimeData: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number): number | BlueprintPromise {
        if (fromExcute && context.beginExcute(this, runner, enableDebugPause)) {
            return BlueprintConst.MAX_CODELINE;
        }
        let _parmsArray: any[] = this.colloctParam(context, runTimeData, this.inPutParmPins, runner, runId);
        context.parmFromOutPut(this.outPutParmPins, runTimeData, _parmsArray);
        if (this.nativeFun) {
            let caller = null;
            if (this.isMember) {
                let temp = _parmsArray.shift();
                caller = temp === undefined ? context.getSelf() : temp;
            }
            let result = this.excuteFun(context, runTimeData, caller, _parmsArray, runId);
            if (result instanceof Promise) {
                let promise = BlueprintPromise.create();
                result.then((value) => {
                    promise.index = this.next(context, runTimeData, _parmsArray, runner, enableDebugPause, runId);
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
        return this.next(context, runTimeData, _parmsArray, runner, enableDebugPause, runId);
    }

    next(context: IRunAble, runTimeData: IRuntimeDataManger, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number): number {
        return BlueprintConst.MAX_CODELINE;
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

}