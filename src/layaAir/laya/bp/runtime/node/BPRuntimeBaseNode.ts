import { EPinType, EPinDirection } from "../../core/EBluePrint";
import { BPNode } from "../../core/BPNode";
import { TBPPinDef } from "../../core/type/TBluePrint";
import { BPPinRuntime } from "../BPPinRuntime";
import { IRunAble } from "../../runtime/interface/IRunAble";
import { BPPromise } from "../BPPromise";
import { BPConst } from "../../core/BPConst";
import { IBPRutime } from "../interface/IBPRutime";

export class BPRuntimeBaseNode extends BPNode<BPPinRuntime> {
    index: number;
    staticNext: BPRuntimeBaseNode;//下一个节点
    private static _EMPTY: BPPinRuntime[] = [];
    nativeFun: Function;
    isMember:boolean; 
    funcode: string;
    /**
     * 输入参数列表 
     */
    inPutParmPins: BPPinRuntime[];
    /**
     * 输出参数列表
     */
    outPutParmPins: BPPinRuntime[];

    nextNode: BPRuntimeBaseNode;

    /**
     * 输出引脚
    */
    outExcutes: BPPinRuntime[];


    constructor() {
        super();
        this.inPutParmPins = BPRuntimeBaseNode._EMPTY;
        this.outPutParmPins = BPRuntimeBaseNode._EMPTY;
        // this._parmsArray=[];
    }

    createPin(def: TBPPinDef): BPPinRuntime {
        let pin = new BPPinRuntime();
        pin.parse(def);
        return pin;
    }



    step(context: IRunAble, fromExcute: boolean,runner:IBPRutime): number| BPPromise {
        if (fromExcute && context.beginExcute(this)) {
            return -1;
        }
        let _parmsArray:any[] = [];

        const inputPins = this.inPutParmPins;
        for (let i = 0, n = inputPins.length; i < n; i++) {
            const curInput = inputPins[i];
            let from = curInput.linkTo[0];
            if (from) {
                (from as BPPinRuntime).step(context);
                context.parmFromOtherPin(curInput, from as BPPinRuntime, _parmsArray);
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
                let promise=BPPromise.create();
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
        return BPConst.MAX_CODELINE;
    }

    addPin(pin: BPPinRuntime) {
        pin.owner = this;
        super.addPin(pin);
        if (pin.type == EPinType.Other) {
            switch (pin.direction) {
                case EPinDirection.Input:
                    if (this.inPutParmPins == BPRuntimeBaseNode._EMPTY) {
                        this.inPutParmPins = [];
                    }
                    this.inPutParmPins.push(pin);
                    break;
                case EPinDirection.Output:
                    if (this.outPutParmPins == BPRuntimeBaseNode._EMPTY) {
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