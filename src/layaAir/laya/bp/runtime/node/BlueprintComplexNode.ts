
import { IRunAble } from "../interface/IRunAble";
import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { IBPRutime } from "../interface/IBPRutime";
import { BlueprintConst } from "../../core/BlueprintConst";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintPromise } from "../BlueprintPromise";

export class BlueprintComplexNode extends BlueprintRuntimeBaseNode {
    /**
     * 输入引脚
     */
    inExcutes: BlueprintPinRuntime[];

    constructor() {
        super();
        this.inExcutes = [];
        this.outExcutes = [];
        this.tryExcute=this.emptyExcute;
    }

    next(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number,fromPin:BlueprintPinRuntime): BlueprintPinRuntime{
        //context.find()
        let result = this.find(this.outExcutes, ...parmsArray);
        if(result.linkTo.length){
            // return (result.linkTo[0] as BlueprintPinRuntime);    
            return result;
        }
        return null;
        // result.excute(context);
        //this.outExcute.excute(context);
    }

    find: (outExcutes: BlueprintPinRuntime[],...args:any) => BlueprintPinRuntime;

    addPin(pin: BlueprintPinRuntime) {
        super.addPin(pin);
        if (pin.type == EPinType.Exec) {
            if (pin.direction == EPinDirection.Input) {
                this.inExcutes.push(pin);
            }
            else if (pin.direction == EPinDirection.Output) {
                this.outExcutes.push(pin);
            }
        }
    }

    setFunction(fun: Function) {
        this.nativeFun = null;
        this.funcode = fun?.name;
        this.find = fun as (input: any, outExcutes: BlueprintPinRuntime[]) => BlueprintPinRuntime;
    }
}