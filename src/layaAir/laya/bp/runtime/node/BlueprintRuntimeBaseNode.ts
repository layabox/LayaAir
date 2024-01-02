import { EPinType, EPinDirection } from "../../core/EBluePrint";
import { BlueprintNode } from "../../core/BlueprintNode";
import { TBPPinDef } from "../../core/type/TBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintPromise } from "../BlueprintPromise";
import { BlueprintConst } from "../../core/BlueprintConst";
import { IBPRutime } from "../interface/IBPRutime";

export class BlueprintRuntimeBaseNode extends BlueprintNode<BlueprintPinRuntime> {
    index: number;
    staticNext: BlueprintRuntimeBaseNode;//下一个节点
    private static _EMPTY: BlueprintPinRuntime[] = [];
    nativeFun: Function;
    isMember:boolean; 
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

    tryExcute:(context: IRunAble, fromExcute: boolean,runner:IBPRutime,enableDebugPause:boolean)=> number| BlueprintPromise;


    constructor() {
        super();
        this.inPutParmPins = BlueprintRuntimeBaseNode._EMPTY;
        this.outPutParmPins = BlueprintRuntimeBaseNode._EMPTY;
        this.tryExcute=this.step;
        // this._parmsArray=[];
    }

    createPin(def: TBPPinDef): BlueprintPinRuntime {
        let pin = new BlueprintPinRuntime();
        pin.parse(def);
        return pin;
    }


    step(context: IRunAble, fromExcute: boolean,runner:IBPRutime,enableDebugPause:boolean): number| BlueprintPromise {
        if (fromExcute && context.beginExcute(this,runner,enableDebugPause)) {
            return BlueprintConst.MAX_CODELINE;
        }
        let _parmsArray:any[] = context.getDataById(this.nid).parmsArray;
        _parmsArray.length=0;

        const inputPins = this.inPutParmPins;
        for (let i = 0, n = inputPins.length; i < n; i++) {
            const curInput = inputPins[i];
            let from = curInput.linkTo[0];
            if (from) {
                (from as BlueprintPinRuntime).step(context);
                context.parmFromOtherPin(curInput, from as BlueprintPinRuntime, _parmsArray);
            }
            else {
                context.parmFromSelf(curInput, _parmsArray);
            }
        }
        context.parmFromOutPut(this.outPutParmPins, _parmsArray);
        if (this.nativeFun) {
            let caller=null;
            if(this.isMember){
                caller=_parmsArray.shift()||context.getSelf();
            }
            let result=context.excuteFun(this.nativeFun, this.outPutParmPins,caller,_parmsArray);
            if(result instanceof Promise){
                let promise=BlueprintPromise.create();
                result.then((value)=>{
                    promise.curIndex=this.next(context,_parmsArray,runner);
                    promise.complete();
                    promise.recover();
                })
                return promise;
            }

        }
        if (fromExcute) {
            context.endExcute(this);
        }
        return this.next(context, _parmsArray,runner);
    }

    next(context: IRunAble, parmsArray: any[],runner:IBPRutime): number {
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

    setFunction(fun: Function,isMember:boolean) {
        this.nativeFun = fun;
        this.isMember=isMember;
        this.funcode = fun?.name;
    }

    protected addNextPIn() {

    }

}