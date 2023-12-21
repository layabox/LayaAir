import { TBPNode } from "../../datas/types/BlueprintTypes";
import { INodeManger } from "../../core/interface/INodeManger";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintFunNode } from "./BlueprintFunNode";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintSetVarNode extends BlueprintFunNode {
    protected _parmsArray: any[];
    private _varKey:string;
    constructor() {
        super();
        this._parmsArray = [];
    }

    
    parseLinkDataNew(node: TBPNode, manger: INodeManger<BlueprintRuntimeBaseNode>){
        this._varKey=node.varName;
        super.parseLinkDataNew(node,manger);
    }
    step(context: IRunAble, fromExcute: boolean): number {
        this._parmsArray.length = 0;
        const varPin = this.inPutParmPins[0];

        let from = varPin.linkTo[0];
        if (from) {
            (from as BlueprintPinRuntime).step(context);
            context.parmFromOtherPin(varPin, from as BlueprintPinRuntime, this._parmsArray);
        }
        else {
            context.parmFromSelf(varPin, this._parmsArray);
        }

        context.parmFromCustom(this._parmsArray, this._varKey, '"' + this._varKey + '"');

        context.parmFromCustom(this._parmsArray, context, "context");

        if (this.nativeFun) {
            context.excuteFun(this.nativeFun, this.outPutParmPins, BlueprintFunNode, this._parmsArray);
        }
        return this.next(context);
    }
}