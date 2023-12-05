
import { IRunAble } from "../interface/IRunAble";
import { EPinDirection, EPinType } from "../../core/EBluePrint";
import { BPPinRuntime } from "../BPPinRuntime";
import { BPRuntimeBaseNode } from "./BPRuntimeBaseNode";
import { IBPRutime } from "../interface/IBPRutime";

export class BPComplexNode extends BPRuntimeBaseNode {
    /**
     * 输入引脚
     */
    inExcutes: BPPinRuntime[];

    constructor() {
        super();
        this.inExcutes = [];
        this.outExcutes = [];
    }

    next(context: IRunAble, parmsArray: any[],runner:IBPRutime): number{
        //context.find()
        let result = this.find(parmsArray[0], this.outExcutes);

        return (result.linkTo[0] as BPPinRuntime).owner.index;

        // result.excute(context);
        //this.outExcute.excute(context);
    }

    find: (input: any, outExcutes: BPPinRuntime[]) => BPPinRuntime;

    addPin(pin: BPPinRuntime) {
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
        this.find = fun as (input: any, outExcutes: BPPinRuntime[]) => BPPinRuntime;
    }
}