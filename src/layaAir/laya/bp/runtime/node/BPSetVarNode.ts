import { TBPNode } from "../../datas/types/BlueprintTypes";
import { INodeManger } from "../../core/interface/INodeManger";
import { BPPinRuntime } from "../BPPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BPFunNode } from "./BPFunNode";
import { BPRuntimeBaseNode } from "./BPRuntimeBaseNode";

export class BPSetVarNode extends BPFunNode {
    protected _parmsArray: any[];
    private _varKey:string;
    constructor() {
        super();
        this._parmsArray = [];
    }

    
    parseLinkDataNew(node: TBPNode, manger: INodeManger<BPRuntimeBaseNode>){
        this._varKey=node.varName;
        super.parseLinkDataNew(node,manger);
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

        context.parmFromCustom(this._parmsArray, this._varKey, '"' + this._varKey + '"');

        context.parmFromCustom(this._parmsArray, context, "context");

        if (this.nativeFun) {
            context.excuteFun(this.nativeFun, this.outPutParmPins, BPFunNode, this._parmsArray);
        }
        return this.next(context);
    }
}