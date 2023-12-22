
import { IRunAble } from "../interface/IRunAble";
import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintComplexNode } from "./BlueprintComplexNode";
import { BlueprintConst } from "../../core/BlueprintConst";
import { IBPRutime } from "../interface/IBPRutime";

export class BlueprintSequenceNode extends BlueprintComplexNode {

    next(context: IRunAble, parmsArray: any[], runner: IBPRutime): number {
        for (let i = 0, n = this.outExcutes.length; i < n; i++) {
            let item = this.outExcutes[i];
            let jj = (item.linkTo[0] as BlueprintPinRuntime);
            if (jj) {
                if(context.debuggerPause){
                    debugger;
                    context.pushBack(jj.owner.index);
                }
                else{
                    runner.runByContext(context, jj.owner.index);
                }
                //item.excute(context);
            }
        }

        // this.outExcutes.forEach(item=>{
        //    let jj= (item.linkTo[0] as BPPinRuntime);
        //    if(jj){
        //         runner.runByContext(context,jj.owner.index);
        //         if(context.debuggerPause){
        //             debugger;
        //         }
        //        //item.excute(context);
        //    }
        // });
        return BlueprintConst.MAX_CODELINE;
        //this.outExcute.excute(context);
    }

    setFunction(fun: Function) {
        // this.nativeFun = null;
        // this.funcode = fun?.name;
        // this.find=fun as (input:any,outExcutes:BPPinRuntime[])=>BPPinRuntime;
    }
}