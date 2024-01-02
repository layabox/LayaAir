import { Browser } from "../../../utils/Browser";
import { ClassUtils } from "../../../utils/ClassUtils";
import { BlueprintConst } from "../../core/BlueprintConst";
import { TBPCNode } from "../../datas/types/BlueprintTypes";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintNewTargetNode extends BlueprintRuntimeBaseNode {
    cls: ClassDecorator;

    parseNew(def: TBPCNode) {
        super.parseNew(def);
        let arr = def.target.split(".");
        if (arr.length == 1) {
            this.cls = ClassUtils.getClass(arr[0]);
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

    step(context: IRunAble, fromExcute: boolean, runner: IBPRutime, enableDebugPause: boolean): number {
        if (fromExcute && context.beginExcute(this, runner, enableDebugPause)) {
            return BlueprintConst.MAX_CODELINE;
        }
        let _parmsArray:any[] = context.getDataById(this.nid).parmsArray;
        _parmsArray.length=0;
        const inputPins = this.inPutParmPins;
        for (let i = 0, n = inputPins.length; i < n; i++) {
            const curInput = inputPins[i];
            let from = curInput.linkTo[0];
            if (from) {
                (from as BlueprintPinRuntime).step(context);
                context.parmFromOtherPin(curInput, from as BlueprintPinRuntime, _parmsArray);
            }
            else {
                context.parmFromSelf(curInput, _parmsArray);
            }
        }
        context.parmFromOutPut(this.outPutParmPins, _parmsArray);


        let result = Reflect.construct(this.cls, _parmsArray);

        context.setPinData(this.outPutParmPins[0],result);
        if (fromExcute) {
            context.endExcute(this);
        }
        return this.next(context, _parmsArray, runner);
    }
}