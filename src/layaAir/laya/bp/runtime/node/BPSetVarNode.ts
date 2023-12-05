import { BPPinRuntime } from "../BPPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BPFunNode } from "./BPFunNode";

export class BPSetVarNode extends BPFunNode {
    protected _parmsArray: any[];
    constructor() {
        super();
        this._parmsArray = [];
    }
    step(context: IRunAble, fromExcute: boolean): number {
        this._parmsArray.length = 0;
        const varPin = this.inPutParmPins[0];

        let from = varPin.linkTo[0];
        if (from) {
            (from as BPPinRuntime).step(context);
            context.parmFromOtherPin(varPin, from as BPPinRuntime, this._parmsArray);
        }
        else {
            context.parmFromSelf(varPin, this._parmsArray);
        }

        context.parmFromCustom(this._parmsArray, varPin.name, '"' + varPin.name + '"');

        context.parmFromCustom(this._parmsArray, context, "context");

        if (this.nativeFun) {
            context.excuteFun(this.nativeFun, this.outPutParmPins, BPFunNode, this._parmsArray);
        }
        return this.next(context);
    }
}