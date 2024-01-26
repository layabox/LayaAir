import { EPinDirection, EPinType } from "./EBluePrint";
import { TBPPinDef } from "./type/TBluePrint";

export class BlueprintPin {
    //方向
    private _direction: EPinDirection;
    public get direction(): EPinDirection {
        return this._direction;
    }
    public set direction(value: EPinDirection) {
        //BPFun当为输入引脚时 需要放入到参数列表
        if (value == EPinDirection.Input && this.type == EPinType.BPFun) {
            this.type = EPinType.Other;
        }
        this._direction = value;
    }
    id: string;
    name: string;
    nid: string;
    type: EPinType;
    otype: string;
    linkTo: BlueprintPin[];
    value: any;
    constructor() {
        this.linkTo = [];
    }

    parse(def: TBPPinDef) {
        this.name = def.name;
        this.nid = def.id || def.name;
        this.otype = def.type;
        switch (def.type) {
            case "exec":
                this.type = EPinType.Exec;
                break;
            case "bpFun":
                this.type = EPinType.BPFun;
                break;
            default:
                this.type = EPinType.Other;
        }
    }

    startLinkTo(e: BlueprintPin) {
        this.linkTo.push(e);
        if (e.linkTo.indexOf(this) == -1) {
            e.linkTo.push(this);
        }
    }
}