import { EPinDirection, EPinType } from "./EBluePrint";
import { TBPPinDef } from "./type/TBluePrint";

export class BlueprintPin {
    //方向
    direction: EPinDirection;
    id: string;
    nid:number;//内部ID
    name: string;
    type: EPinType;
    linkTo: BlueprintPin[];
    value: any;
    constructor() {
        this.linkTo = [];
    }

    parse(def: TBPPinDef){
        this.name=def.name;
        this.type=def.type=="exec"?EPinType.Exec:EPinType.Other;
    }

    startLinkTo(e: BlueprintPin) {
        this.linkTo.push(e);
        if (e.linkTo.indexOf(this) == -1) {
            e.linkTo.push(this);
        }
    }
}