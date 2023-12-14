import { Browser } from "../../../utils/Browser";
import { ClassUtils } from "../../../utils/ClassUtils";
import { BPConst } from "../../core/BPConst";
import { TBPCNode } from "../../datas/types/BlueprintTypes";
import { BPPinRuntime } from "../BPPinRuntime";
import { IBPRutime } from "../interface/IBPRutime";
import { IRunAble } from "../interface/IRunAble";
import { BPRuntimeBaseNode } from "./BPRuntimeBaseNode";

export class BPNewTargetNode extends BPRuntimeBaseNode {
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
            return BPConst.MAX_CODELINE;
        }
        let _parmsArray: any[] = [];

        const inputPins = this.inPutParmPins;
        for (let i = 0, n = inputPins.length; i < n; i++) {
            const curInput = inputPins[i];
            let from = curInput.linkTo[0];
            if (from) {
                (from as BPPinRuntime).step(context);
                context.parmFromOtherPin(curInput, from as BPPinRuntime, _parmsArray);
            }
            else {
                context.parmFromSelf(curInput, _parmsArray);
            }
        }
        context.parmFromOutPut(this.outPutParmPins, _parmsArray);


        let result = Reflect.construct(this.cls, _parmsArray);

        this.outPutParmPins[0].setValue(result);

        if (fromExcute) {
            context.endExcute(this);
        }
        return this.next(context, _parmsArray, runner);
    }
}