import { TBPNode } from "../../datas/types/BlueprintTypes";
import { INodeManger } from "../../core/interface/INodeManger";

import { IRunAble } from "../interface/IRunAble";
import { BlueprintFunNode } from "./BlueprintFunNode";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";
import { IBPRutime } from "../interface/IBPRutime";
import { BlueprintUtil } from "../../core/BlueprintUtil";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";

export class BlueprintSetVarNode extends BlueprintFunNode {
    private _varKey: string;
    constructor() {
        super();
    }

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintRuntimeBaseNode>) {
        let cfg = manger.dataMap[node.dataId];
        this._varKey = cfg ? cfg.name : BlueprintUtil.getConstDataById(node.target, node.dataId).name;
    }

    step(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime): BlueprintPinRuntime {
        let _parmsArray: any[] = this.colloctParam(context, runtimeDataMgr, this.inPutParmPins, runner, runId);

        context.parmFromCustom(_parmsArray, this._varKey, '"' + this._varKey + '"');

        context.parmFromCustom(_parmsArray, context, "context");

        if (this.nativeFun) {
            context.excuteFun(this.nativeFun, this.outPutParmPins, runtimeDataMgr, BlueprintFunNode, _parmsArray, runId);
        }
        return this.next();
    }
}