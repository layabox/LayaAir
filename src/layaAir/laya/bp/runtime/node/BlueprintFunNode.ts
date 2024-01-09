
import { IRunAble } from "../interface/IRunAble";
import { EBlueNodeType, EPinDirection, EPinType } from "../../core/EBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { BlueprintConst } from "../../core/BlueprintConst";
import { BlueprintNode } from "../../core/BlueprintNode";
import { IBPRutime } from "../interface/IBPRutime";
import { BlueprintPromise } from "../BlueprintPromise";
import { TBPEventProperty, TBPNode } from "../../datas/types/BlueprintTypes";
import { INodeManger } from "../../core/interface/INodeManger";

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

    emptyExcute(context: IRunAble, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean): number | BlueprintPromise {
        return BlueprintConst.MAX_CODELINE;
    }

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintRuntimeBaseNode>) {
        if (node.dataId) {
            this.eventName = (manger.dataMap[node.dataId] as TBPEventProperty).name;
            this.excuteFun = this.excuteHookFun;
        }
    }

    private excuteHookFun(context: IRunAble, caller: any, parmsArray: any[]) {
        parmsArray.unshift(this.eventName);
        return context.excuteFun(this.nativeFun, this.outPutParmPins, caller, parmsArray);
    }

    setType(type: EBlueNodeType) {
        super.setType(type);
        // this.addInput(BPNode.ExecInput);
        // this.addOutput(BPNode.ExecOutput);
    }

    next(context: IRunAble): number {
        // this.outPutParmPins.forEach(item=>{
        //     //if(item.linkTo.)
        // })
        // this.outExcute.excute(context);
        return this.staticNext ? this.staticNext.index : BlueprintConst.MAX_CODELINE;
        // return (this.outExcute.linkTo[0] as BPPinRuntime).owner.index;
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
        if (linkto[0]) {
            this.staticNext = (linkto[0] as BlueprintPinRuntime).owner;
        }
        else {
            this.staticNext = null;
        }
    }
}