
import { IRunAble } from "../interface/IRunAble";
import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { BlueprintConst } from "../../core/BlueprintConst";
import { IBPRutime } from "../interface/IBPRutime";
import { BlueprintPromise } from "../BlueprintPromise";
import { TBPEventProperty, TBPNode } from "../../datas/types/BlueprintTypes";
import { INodeManger } from "../../core/interface/INodeManger";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";

export class BlueprintFunNode extends BlueprintRuntimeBaseNode {
    /**
     * 输入引脚
     */
    inExcute: BlueprintPinRuntime;
    /**
     * 输出引脚
     */
    outExcute: BlueprintPinRuntime;

    eventName: string;

    constructor() {
        super();
        this.tryExcute = this.emptyExcute;
    }

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintRuntimeBaseNode>) {
        if (node.dataId) {
            this.eventName = (manger.dataMap[node.dataId] as TBPEventProperty).name;
            this.excuteFun = this.excuteHookFun;
        }
    }

    private excuteHookFun(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, caller: any, parmsArray: any[], runId: number,fromPin:BlueprintPinRuntime) {
        parmsArray.unshift(this.eventName);
        return context.excuteFun(this.nativeFun, this.outPutParmPins, runtimeDataMgr, caller, parmsArray, runId);
    }


    next(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number): BlueprintPinRuntime {
        return this.staticNext ? this.staticNext : null;
    }

    addPin(pin: BlueprintPinRuntime) {
        super.addPin(pin);
        if (pin.type == EPinType.Exec) {
            if (pin.direction == EPinDirection.Input) {
                this.inExcute = pin;
            }
            else if (pin.direction == EPinDirection.Output) {
                this.outExcute = pin;
                if (!this.outExcutes) {
                    this.outExcutes = [];
                }
                this.outExcutes.push(pin);
            }
        }
    }

    optimize() {
        let linkto = this.outExcute.linkTo;
        this.staticNext=linkto[0] as BlueprintPinRuntime;
    }
}