
import { IRunAble } from "../interface/IRunAble";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintComplexNode } from "./BlueprintComplexNode";
import { BlueprintConst } from "../../core/BlueprintConst";
import { IBPRutime } from "../interface/IBPRutime";

export class BlueprintSequenceNode extends BlueprintComplexNode {

    next(context: IRunAble, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number): number {
        for (let i = 0, n = this.outExcutes.length; i < n; i++) {
            let item = this.outExcutes[i];
            let pin = (item.linkTo[0] as BlueprintPinRuntime);
            if (pin) {
                if (context.debuggerPause) {
                    debugger;
                    context.pushBack(pin.owner);
                }
                else {
                    runner.runByContext(context, pin.owner, enableDebugPause, null, runId);
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