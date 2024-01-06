import { BlueprintNode } from "../../core/BlueprintNode";
import { BlueprintConst } from "../../core/BlueprintConst";
import { EBlueNodeType, EPinDirection, EPinType } from "../../core/EBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { IBPRutime } from "../interface/IBPRutime";
import { BlueprintPromise } from "../BlueprintPromise";
import { BlueprintUtil } from "../../core/BlueprintUtil";
import { INodeManger } from "../../core/interface/INodeManger";
import { TBPEventProperty, TBPNode } from "../../datas/types/BlueprintTypes";

export class BlueprintEventNode extends BlueprintRuntimeBaseNode {
    /**
     * 输出引脚
     */
    outExcute: BlueprintPinRuntime;

    eventName: string;

    constructor() {
        super();
        this.tryExcute = this.emptyExcute;
    }

    parseLinkDataNew(node: TBPNode, manger: INodeManger<BlueprintRuntimeBaseNode>) {
        if (node.dataId) {
            this.eventName = (manger.dataMap[node.dataId] as TBPEventProperty).name;
        }
        else {
            this.eventName = node.name;
        }
        super.parseLinkDataNew(node, manger);
    }

    setFunction(fun: Function, isMember: boolean) {
        this.nativeFun = null;
        this.isMember = isMember;
        this.funcode = fun?.name;
    }

    // call(context:IRunAble,parms:any[]){
    //     this.step(context,true,)

    // }


    emptyExcute(context: IRunAble, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, fromPin: BlueprintPinRuntime): number | BlueprintPromise {
        if (fromPin && fromPin.otype == "bpFun") {
            let data = context.getDataById(this.nid);
            let cid = this.index;
            let _this = this;
            data.eventName = this.eventName;
            data.callFun = data.callFun || function () {
                let parms = Array.from(arguments);
                parms.forEach((value, index) => {
                    context.setPinData(_this.outPutParmPins[index], value);
                })
                runner.runByContext(context, cid, enableDebugPause);
            }
            context.setPinData(fromPin, data.callFun);
        }
        return BlueprintConst.MAX_CODELINE;
    }

    step(context: IRunAble, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean): number | BlueprintPromise {
        if (fromExcute && context.beginExcute(this, runner, enableDebugPause)) {
            return BlueprintConst.MAX_CODELINE;
        }
        // let _parmsArray:any[] = context.getDataById(this.nid).parmsArray;
        // _parmsArray.length=0;

        // const inputPins = this.inPutParmPins;
        // for (let i = 0, n = inputPins.length; i < n; i++) {
        //     const curInput = inputPins[i];
        //     let from = curInput.linkTo[0];
        //     if (from) {
        //         (from as BlueprintPinRuntime).step(context);
        //         context.parmFromOtherPin(curInput, from as BlueprintPinRuntime, _parmsArray);
        //     }
        //     else {
        //         context.parmFromSelf(curInput, _parmsArray);
        //     }
        // }
        // context.parmFromOutPut(this.outPutParmPins, _parmsArray);
        // if (this.nativeFun) {
        //     let caller=null;
        //     if(this.isMember){
        //         caller=_parmsArray.shift()||context.getSelf();
        //     }
        //     let result=context.excuteFun(this.nativeFun, this.outPutParmPins,caller,_parmsArray);
        //     if(result instanceof Promise){
        //         let promise=BlueprintPromise.create();
        //         result.then((value)=>{
        //             promise.curIndex=this.next(context,_parmsArray,runner);
        //             promise.complete();
        //             promise.recover();
        //         })
        //         return promise;
        //     }

        // }
        if (fromExcute) {
            context.endExcute(this);
        }
        return this.next(context);
    }

    next(context: IRunAble): number {
        return this.staticNext ? this.staticNext.index : BlueprintConst.MAX_CODELINE;
        //return (this.outExcute.linkTo[0] as BPPinRuntime).owner.index; 
        //this.outExcute.excute(context);
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
        if (linkto[0]) {
            this.staticNext = (linkto[0] as BlueprintPinRuntime).owner;
        }
        else {
            this.staticNext = null;
        }
    }

}