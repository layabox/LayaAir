import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { IBPRutime } from "../interface/IBPRutime";
import { BlueprintPromise } from "../BlueprintPromise";
import { INodeManger } from "../../core/interface/INodeManger";
import { TBPEventProperty, TBPNode } from "../../datas/types/BlueprintTypes";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintUtil } from "../../core/BlueprintUtil";

export class BlueprintEventNode extends BlueprintRuntimeBaseNode {
    /**
     * 输出引脚
     */
    outExcute: BlueprintPinRuntime;

    eventName: string;

    autoReg: boolean;

    constructor() {
        super();
        this.tryExcute = this.emptyExcute;
    }

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintEventNode>) {
        if (node.dataId) {
            this.eventName = BlueprintUtil.getConstDataById(node.target, node.dataId).name;//(manger.dataMap[node.dataId] as TBPEventProperty).name;
        }
        else {
            this.eventName = node.name;
        }
    }

    setFunction(fun: Function, isMember: boolean) {
        this.nativeFun = null;
        this.isMember = isMember;
        this.funcode = fun?.name;
    }

    // call(context:IRunAble,parms:any[]){
    //     this.step(context,true,)

    // }


    emptyExcute(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime): BlueprintPinRuntime | BlueprintPromise {
        if (fromPin && fromPin.otype == "bpFun") {
            let data = runtimeDataMgr.getDataById(this.nid);
            let _this = this;
            data.eventName = this.eventName;
            data.callFun = data.callFun || function () {
                let parms = Array.from(arguments);
                let newRunId = runner.getRunID();
                _this.initData(runtimeDataMgr, parms, newRunId);
                let nextPin = _this.outExcute.linkTo[0] as BlueprintPinRuntime;
                if (nextPin) {
                    runner.runByContext(context, runtimeDataMgr, nextPin.owner, enableDebugPause, null, newRunId, nextPin);
                }
            }
            runtimeDataMgr.setPinData(fromPin, data.callFun, runId);
        }
        return null;
    }

    step(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime): BlueprintPinRuntime | BlueprintPromise {
        if (fromExcute) {
            context.endExcute(this);
        }
        return fromPin ? fromPin.linkTo[0] as BlueprintPinRuntime : this.staticNext;
    }

    addPin(pin: BlueprintPinRuntime) {
        super.addPin(pin);
        if (pin.type == EPinType.Exec && pin.direction == EPinDirection.Output) {
            this.outExcute = pin;

            if (!this.outExcutes) {
                this.outExcutes = [];
            }
            this.outExcutes.push(pin);
        }
    }


    optimize() {
        let linkto = this.outExcute.linkTo;
        this.staticNext = linkto[0] as BlueprintPinRuntime;
    }

    initData(runtimeDataMgr: IRuntimeDataManger, parms: any[], curRunId: number) {
        this.outPutParmPins.forEach((value, index) => {
            runtimeDataMgr.setPinData(value, parms[index], curRunId);
        })
    }

}