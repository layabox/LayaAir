import { IRunAble } from "../interface/IRunAble";
import { BPPinRuntime } from "../BPPinRuntime";
import { BPRuntimeBaseNode } from "../node/BPRuntimeBaseNode";
import { BPExcuteNode } from "./BPExcuteNode";

export class BPExcuteDebuggerNode extends BPExcuteNode implements IRunAble {
    private xx: any

    next() {
        this.xx(false);
    }

    excuteFun(nativeFun: Function, outPutParmPins: BPPinRuntime[],caller:any, parmsArray: any[]): void {
        super.excuteFun(nativeFun, outPutParmPins,caller, parmsArray);

    }

}