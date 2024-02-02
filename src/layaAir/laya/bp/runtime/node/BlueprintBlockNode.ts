
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintComplexNode } from "./BlueprintComplexNode";

export class BluePrintBlockNode extends BlueprintComplexNode {
    
    deal:(inputExcute:BlueprintPinRuntime,inputExcutes:BlueprintPinRuntime[],outExcutes:BlueprintPinRuntime[],outPutParmPins:BlueprintPinRuntime[],context:IRunAble,runner: IBPRutime,runtimeDataMgr:IRuntimeDataManger,runId:number, ...args: any) => BlueprintPinRuntime;
    
    next(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number,fromPin:BlueprintPinRuntime): BlueprintPinRuntime{
        //context.find()
        let result = this.deal(fromPin,this.inExcutes,this.outExcutes,this.outPutParmPins,context,runner,runtimeDataMgr,runId, ...parmsArray);
        // if(result.linkTo.length){
        //     return (result.linkTo[0] as BlueprintPinRuntime).owner.index;    
        // }
        return result;
        // result.excute(context);
        //this.outExcute.excute(context);
    }
    
    setFunction(fun: Function) {
        this.nativeFun = null;
        this.funcode = fun?.name;
        this.deal = fun as(inputExcute:BlueprintPinRuntime,inputExcutes:BlueprintPinRuntime[],outExcutes:BlueprintPinRuntime[],outPutParmPins:BlueprintPinRuntime[],context:IRunAble,runner: IBPRutime,runtimeDataMgr:IRuntimeDataManger,runId:number, ...args: any) => BlueprintPinRuntime;
    }
}