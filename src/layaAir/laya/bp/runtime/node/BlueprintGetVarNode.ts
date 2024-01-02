import { TBPNode } from "../../datas/types/BlueprintTypes";
import { BlueprintConst } from "../../core/BlueprintConst";
import { BlueprintNode } from "../../core/BlueprintNode";
import { INodeManger } from "../../core/interface/INodeManger";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintStaticFun } from "../BlueprintStaticFun";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintGetVarNode extends BlueprintRuntimeBaseNode {
    private _varKey: string;
    constructor() {
        super();
    }

    parseLinkDataNew(node: TBPNode, manger: INodeManger<BlueprintRuntimeBaseNode>) {
        this._varKey = node.varName;
        super.parseLinkDataNew(node, manger);
    }

    step(context: IRunAble, fromExcute: boolean): number {
        let _parmsArray: any[] = context.getDataById(this.nid).parmsArray;

        _parmsArray.length = 0;
        const varPin = this.outPutParmPins[0];
        context.parmFromCustom(_parmsArray, this._varKey, '"' + this._varKey + '"');
        context.parmFromCustom(_parmsArray, context, "context");

        if (this.nativeFun) {
            let result = context.excuteFun(this.nativeFun, this.outPutParmPins, BlueprintStaticFun, _parmsArray);
            if (result == undefined) {
                this.outPutParmPins[0].setValue(result);
            }
        }
        return BlueprintConst.MAX_CODELINE;
    }

}