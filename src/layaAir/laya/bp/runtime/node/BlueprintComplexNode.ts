
import { IRunAble } from "../interface/IRunAble";
import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { IBPRutime } from "../interface/IBPRutime";
import { BlueprintConst } from "../../core/BlueprintConst";

export class BlueprintComplexNode extends BlueprintRuntimeBaseNode {
    /**
     * 输入引脚
     */
    inExcutes: BlueprintPinRuntime[];

    constructor() {
        super();
        this.inExcutes = [];
        this.outExcutes = [];
    }

    next(context: IRunAble, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number): number{
        //context.find()
        let result = this.find(parmsArray[0], this.outExcutes);
        if(result.linkTo.length){
            return (result.linkTo[0] as BlueprintPinRuntime).owner.index;    
        }
        return BlueprintConst.MAX_CODELINE;

        // result.excute(context);
        //this.outExcute.excute(context);
    }

    find: (input: any, outExcutes: BlueprintPinRuntime[]) => BlueprintPinRuntime;

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