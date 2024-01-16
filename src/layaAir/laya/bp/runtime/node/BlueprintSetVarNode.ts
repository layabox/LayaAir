import { TBPNode } from "../../datas/types/BlueprintTypes";
import { INodeManger } from "../../core/interface/INodeManger";

import { IRunAble } from "../interface/IRunAble";
import { BlueprintFunNode } from "./BlueprintFunNode";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { IBPRutime } from "../interface/IBPRutime";
import { BlueprintUtil } from "../../core/BlueprintUtil";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";

export class BlueprintSetVarNode extends BlueprintFunNode {
    private _varKey: string;
    constructor() {
        super();
    }

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintRuntimeBaseNode>) {
        let cfg = manger.dataMap[node.dataId];
        this._varKey = cfg ? cfg.name : BlueprintUtil.constAllVars[node.dataId].name;
    }

    step(context: IRunAble, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number): number {
        let _parmsArray: any[] = context.getDataById(this.nid).getParamsArray(runId);
        _parmsArray.length = 0;
        const varPin = this.inPutParmPins[0];

        let from = varPin.linkTo[0];
        if (from) {
            (from as BlueprintPinRuntime).step(context, runner, runId);
            context.parmFromOtherPin(varPin, from as BlueprintPinRuntime, _parmsArray, runId);
        }
        else {
            context.parmFromSelf(varPin, _parmsArray, runId);
        }

        context.parmFromCustom(_parmsArray, this._varKey, '"' + this._varKey + '"');

        context.parmFromCustom(_parmsArray, context, "context");

        if (this.nativeFun) {
            context.excuteFun(this.nativeFun, this.outPutParmPins, BlueprintFunNode, _parmsArray, runId);
        }
        return this.next(context, _parmsArray, runner, enableDebugPause, runId);
    }
}