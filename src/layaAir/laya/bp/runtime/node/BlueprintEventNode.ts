import { BlueprintNode } from "../../core/BlueprintNode";
import { BlueprintConst } from "../../core/BlueprintConst";
import { EBlueNodeType, EPinDirection, EPinType } from "../../core/EBluePrint";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintEventNode extends BlueprintRuntimeBaseNode {
    /**
     * 输出引脚
     */
    outExcute: BlueprintPinRuntime;

    setFunction(fun: Function, isMember: boolean) {
        this.nativeFun = null;
        this.isMember = isMember;
        this.funcode = fun?.name;
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