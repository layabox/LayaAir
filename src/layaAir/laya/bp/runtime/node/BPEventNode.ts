import { BPNode } from "../../core/BPNode";
import { BPConst } from "../../core/BPConst";
import { EBlueNodeType, EPinDirection, EPinType } from "../../core/EBluePrint";
import { BPPinRuntime } from "../BPPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BPRuntimeBaseNode } from "./BPRuntimeBaseNode";

export class BPEventNode extends BPRuntimeBaseNode {
    /**
     * 输出引脚
     */
    outExcute: BPPinRuntime;

    setType(type: EBlueNodeType) {
        super.setType(type)
        // this.addOutput(BPNode.ExecOutput);
    }

    next(context: IRunAble): number {
        return this.staticNext ? this.staticNext.index : BPConst.MAX_CODELINE;
        //return (this.outExcute.linkTo[0] as BPPinRuntime).owner.index; 
        //this.outExcute.excute(context);
    }

    addPin(pin: BPPinRuntime) {
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
            this.staticNext = (linkto[0] as BPPinRuntime).owner;
        }
        else {
            this.staticNext = null;
        }
    }

}