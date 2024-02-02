import { Browser } from "../../../utils/Browser";
import { ClassUtils } from "../../../utils/ClassUtils";
import { BlueprintConst } from "../../core/BlueprintConst";
import { BlueprintUtil } from "../../core/BlueprintUtil";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { TBPCNode } from "../../datas/types/BlueprintTypes";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintNewTargetNode extends BlueprintRuntimeBaseNode {
    cls: ClassDecorator;

    parse(def: TBPCNode) {
        super.parse(def);
        let arr = def.target.split(".");
        if (arr.length == 1) {
            this.cls = BlueprintUtil.getClass(arr[0]);
        }
        else {
            let cls = Browser.window;
            arr.forEach(value => {
                cls = cls[value];
            })
            this.cls = cls;
        }
        if (!this.cls) {
            console.warn("regclass not find " + arr[0]);
        }
    }

    step(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean, runId: number, fromPin: BlueprintPinRuntime): BlueprintPinRuntime {
        if (fromExcute && context.beginExcute(this, runner, enableDebugPause)) {
            this.getDebuggerPromise(context, fromPin);
        }
        let _parmsArray: any[] = this.colloctParam(context, runtimeDataMgr, this.inPutParmPins, runner, runId);
        context.parmFromOutPut(this.outPutParmPins, runtimeDataMgr, _parmsArray);


        let result = Reflect.construct(this.cls, _parmsArray);

        runtimeDataMgr.setPinData(this.outPutParmPins[0], result, runId);
        if (fromExcute) {
            context.endExcute(this);
        }
        return this.next(context, runtimeDataMgr, _parmsArray, runner, enableDebugPause, runId, fromPin);
    }
}