import { BPPin } from "../core/BPPin";
import { IOutParm } from "../core/interface/IOutParm";
import { IBPRutime } from "./interface/IBPRutime";
import { IRunAble } from "./interface/IRunAble";
import { BPRuntimeBaseNode } from "./node/BPRuntimeBaseNode";

export class BPPinRuntime extends BPPin implements IOutParm {
    /**
     * 所属节点
    */
    owner: BPRuntimeBaseNode;

    step(context: IRunAble) {
        this.owner.step(context, false,null,false);
        //(this.linkTo[0] as PinRuntime).owner.step(context);
    }

    excute(context: IRunAble,runner:IBPRutime) {
        (this.linkTo[0] as BPPinRuntime)?.owner.step(context, true,runner,true);
    }

    setValue(value: any): void {
        this.value = value;
    }

    getValue(): any {
        return this.value;
    }

    getValueCode(): any {
        return typeof this.value == "string" ? ('"' + this.value + '"') : this.value;
    }
}