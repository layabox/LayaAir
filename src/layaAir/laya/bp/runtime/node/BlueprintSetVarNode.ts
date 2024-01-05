import { TBPNode } from "../../datas/types/BlueprintTypes";
import { INodeManger } from "../../core/interface/INodeManger";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintFunNode } from "./BlueprintFunNode";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { IBPRutime } from "../interface/IBPRutime";

export class BlueprintSetVarNode extends BlueprintFunNode {
    private _varKey: string;
    constructor() {
        super();
    }


    parseLinkDataNew(node: TBPNode, manger: INodeManger<BlueprintRuntimeBaseNode>) {
        this._varKey = node.varName;
        super.parseLinkDataNew(node, manger);
    }
    step(context: IRunAble, fromExcute: boolean, runner: IBPRutime,enableDebugPause:boolean): number {
        let _parmsArray: any[] = context.getDataById(this.nid).parmsArray;
        _parmsArray.length = 0;
        const varPin = this.inPutParmPins[0];

        let from = varPin.linkTo[0];
        if (from) {
            (from as BlueprintPinRuntime).step(context,runner);
            context.parmFromOtherPin(varPin, from as BlueprintPinRuntime, _parmsArray);
        }
        else {
            context.parmFromSelf(varPin, _parmsArray);
        }

        context.parmFromCustom(_parmsArray, this._varKey, '"' + this._varKey + '"');

        context.parmFromCustom(_parmsArray, context, "context");

        if (this.nativeFun) {
            context.excuteFun(this.nativeFun, this.outPutParmPins, BlueprintFunNode, _parmsArray);
        }
        return this.next(context);
    }
}