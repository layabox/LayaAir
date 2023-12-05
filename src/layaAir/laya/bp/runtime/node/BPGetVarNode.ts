import { BPConst } from "../../core/BPConst";
import { IRunAble } from "../../runtime/interface/IRunAble";
import { BPStaticFun } from "../BPStaticFun";
import { BPRuntimeBaseNode } from "./BPRuntimeBaseNode";

export class BPGetVarNode extends BPRuntimeBaseNode {
    protected _parmsArray: any[];
    constructor() {
        super();
        this._parmsArray = [];
    }
    step(context: IRunAble, fromExcute: boolean): number {
        this._parmsArray.length = 0;
        const varPin = this.outPutParmPins[0];
        context.parmFromCustom(this._parmsArray, varPin.name, '"' + varPin.name + '"');
        context.parmFromCustom(this._parmsArray, context, "context");

        if (this.nativeFun) {
            context.excuteFun(this.nativeFun, this.outPutParmPins,BPStaticFun,this._parmsArray);
        }
        return BPConst.MAX_CODELINE;
    }

}