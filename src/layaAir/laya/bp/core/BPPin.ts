import { EPinDirection, EPinType } from "./EBluePrint";
import { TBPPinDef } from "./type/TBluePrint";

export class BPPin {
    //方向
    direction: EPinDirection;
    id: string;
    name: string;
    type: EPinType;
    linkTo: BPPin[];
    value: any;
    constructor() {
        this.linkTo = [];
    }

    parse(def: TBPPinDef){
        this.name=def.name;
        this.type=def.type=="exec"?EPinType.Exec:EPinType.Other;
    }

    startLinkTo(e: BPPin) {
        this.linkTo.push(e);
        if (e.linkTo.indexOf(this) == -1) {
            e.linkTo.push(this);
        }
    }
}