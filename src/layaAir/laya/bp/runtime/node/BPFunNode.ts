
import { IRunAble } from "../interface/IRunAble";
import { EBlueNodeType, EPinDirection, EPinType } from "../../core/EBluePrint";
import { BPPinRuntime } from "../BPPinRuntime";
import { BPRuntimeBaseNode } from "./BPRuntimeBaseNode";
import { BPConst } from "../../core/BPConst";
import { BPNode } from "../../core/BPNode";

export class BPFunNode extends BPRuntimeBaseNode {
    /**
     * 输入引脚
     */
    inExcute: BPPinRuntime;
    /**
     * 输出引脚
     */
    outExcute: BPPinRuntime;

    setType(type: EBlueNodeType){
        super.setType(type);
        // this.addInput(BPNode.ExecInput);
        // this.addOutput(BPNode.ExecOutput);
    }

    next(context: IRunAble): number {
        // this.outPutParmPins.forEach(item=>{
        //     //if(item.linkTo.)
        // })
        // this.outExcute.excute(context);
        return this.staticNext ? this.staticNext.index : BPConst.MAX_CODELINE;
        // return (this.outExcute.linkTo[0] as BPPinRuntime).owner.index;
    }

    addPin(pin: BPPinRuntime) {
        super.addPin(pin);
        if (pin.type == EPinType.Exec) {
            if (pin.direction == EPinDirection.Input) {
                this.inExcute = pin;
            }
            else if (pin.direction == EPinDirection.Output) {
                this.outExcute = pin;
                if (!this.outExcutes) {
                    this.outExcutes = [];
                }
                this.outExcutes.push(pin);
            }
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