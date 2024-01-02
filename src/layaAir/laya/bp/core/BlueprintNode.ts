
import { BPType, TBPCNode, TBPNode } from "../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../runtime/BlueprintFactory";
import { BlueprintPin } from "./BlueprintPin";
import { EBlueNodeType, EPinDirection } from "./EBluePrint";
import { INodeManger } from "./interface/INodeManger";
import { TBPNodeDef, TBPPinData, TBPPinDef } from "./type/TBluePrint";

export abstract class BlueprintNode<T extends BlueprintPin>{
    static ExecInput: TBPPinDef[] = [{
        name: "execute",
        type: "exec"
    }]

    static ExecOutput: TBPPinDef[] = [{
        name: "then",
        type: "exec"
    }]
    id: string;
    nid: number;
    name: string;
    type: EBlueNodeType;

    pins: T[];
    constructor() {
        this.pins = [];
    }

    abstract createPin(def: TBPPinDef): T;

    addPin(pin: T) {
        this.pins.push(pin);
    }

    parseNew(def: TBPCNode) {
        this.name = def.name;
        //this.id = def.id;
        let type: EBlueNodeType;
        switch (def.type) {
            case BPType.Event:
                type = EBlueNodeType.Event;
                break;
            case BPType.Function:
                type = EBlueNodeType.Fun;
                break;
            case BPType.Operator:
            case BPType.Pure:
                type = EBlueNodeType.Pure;
                break;
            case BPType.SetValue:
                type = EBlueNodeType.SetVarialbe;
                break;
            case BPType.GetValue:
                type = EBlueNodeType.GetVariable;
                break;
            case BPType.Sequence:
                type = EBlueNodeType.Sequnece;
                break;
            case BPType.Branch:
                type = EBlueNodeType.Branch;
                break;
            default:
                type = EBlueNodeType.Unknow;
        }

        this.setType(type);
        let arr = BlueprintFactory.getFunction(def.id || def.name);
        this.setFunction(arr ? arr[0] : null, arr ? arr[1] : false);
        if (def.input) {
            this.addInput(def.input as any);
        }
        if (def.output) {
            this.addOutput(def.output as any);
        }
    }

    // parseLinkData(data: Record<string, TBPPinData>, manger: INodeManger<BPNode<T>>) {
    //     for (let key in data) {
    //         let pin = this.getPinByName(key);
    //         let item = data[key];
    //         if (item.linkto) {
    //             item.linkto.forEach((f) => {
    //                 let arr = f.split(":");
    //                 let nextNode = manger.getNodeById(arr[0]);
    //                 let pinnext = nextNode.getPinByName(arr[1]);
    //                 pin.startLinkTo(pinnext);

    //             })
    //         }

    //         if (item.value != undefined) {
    //             pin.value = item.value;
    //         }
    //     }
    // }

    parseLinkDataNew(node: TBPNode, manger: INodeManger<BlueprintNode<T>>) {
        if (node.input) {//输入pin
            for (const key in node.input) {
                let pin = this.getPinByName(key);
                let item = node.input[key];

                if (item.value != undefined) {
                    pin.value = item.value;
                }
            }
        }

        if (node.output) {//输出pin
            for (const key in node.output) {
                let pin = this.getPinByName(key);
                let item = node.output[key];
                let infoArr = item.infoArr;
                for (let i = 0, len = infoArr.length; i < len; i++) {
                    let info = infoArr[i];
                    let nextNode = manger.getNodeById(info.nodeId);
                    let pinnext = nextNode.getPinByName(info.id);
                    pin.startLinkTo(pinnext);
                }
            }
        }
    }


    setFunction(fun: Function, isMember: boolean) {

    }

    setType(type: EBlueNodeType) {
        this.type = type;
    }

    addInput(input: TBPPinDef[]): void {
        input.forEach(item => {
            let pin = this.createPin(item);
            pin.direction = EPinDirection.Input;
            this.addPin(pin);
            pin.id = this.nid + "_" + (this.pins.length - 1);
        })

    }

    addOutput(output: TBPPinDef[]): void {
        output.forEach(item => {
            let pin = this.createPin(item);
            pin.direction = EPinDirection.Output;
            this.addPin(pin);
            pin.id = this.nid + "_" + (this.pins.length - 1);
        })
    }

    getPinByName(name: string): T {
        return this.pins.find((pin) => { return pin.name == name });
    }

}