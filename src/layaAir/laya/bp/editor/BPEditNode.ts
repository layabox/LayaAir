import { BPNode } from "../core/BPNode";
import { TBPPinDef } from "../core/type/TBluePrint";
import { BPPinEdit } from "./BPPinEdit";

export class BPEditNode extends BPNode<BPPinEdit>{
    createPin(def: TBPPinDef): BPPinEdit {
        throw new Error("Method not implemented.");
    }
    x: number;
    y: number;
    width: number;
    height: number;

    get paramPins(): BPPinEdit[] {
        return null;
    }


    linkTo() {

    }
}
