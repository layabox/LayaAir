
import { IRunAble } from "../interface/IRunAble";
import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { BPPinRuntime } from "../BPPinRuntime";
import { BPComplexNode } from "./BPComplexNode";
import { BPConst } from "../../core/BPConst";
import { IBPRutime } from "../interface/IBPRutime";

export class BPSequenceNode extends BPComplexNode {

    next(context: IRunAble,parmsArray: any[],runner:IBPRutime): number {
        this.outExcutes.forEach(item=>{
           let jj= (item.linkTo[0] as BPPinRuntime);
           if(jj){
                runner.runByContext(context,jj.owner.index);
               //item.excute(context);
           }
        });
        return BPConst.MAX_CODELINE;
        //this.outExcute.excute(context);
    }

    setFunction(fun: Function) {
        // this.nativeFun = null;
        // this.funcode = fun?.name;
        // this.find=fun as (input:any,outExcutes:BPPinRuntime[])=>BPPinRuntime;
    }
}