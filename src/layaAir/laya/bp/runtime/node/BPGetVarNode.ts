import { TBPNode } from "../../datas/types/BlueprintTypes";
import { BPConst } from "../../core/BPConst";
import { BPNode } from "../../core/BPNode";
import { INodeManger } from "../../core/interface/INodeManger";
import { IRunAble } from "../../runtime/interface/IRunAble";
import { BPStaticFun } from "../BPStaticFun";
import { BPRuntimeBaseNode } from "./BPRuntimeBaseNode";

export class BPGetVarNode extends BPRuntimeBaseNode {
    protected _parmsArray: any[];

    private _varKey:string;
    constructor() {
        super();
        this._parmsArray = [];
    }

    parseLinkDataNew(node: TBPNode, manger: INodeManger<BPRuntimeBaseNode>){
        this._varKey=node.varName;
        super.parseLinkDataNew(node,manger);
    }

    step(context: IRunAble, fromExcute: boolean): number {
        this._parmsArray.length = 0;
        const varPin = this.outPutParmPins[0];
        context.parmFromCustom(this._parmsArray, this._varKey, '"' + this._varKey + '"');
        context.parmFromCustom(this._parmsArray, context, "context");

        if (this.nativeFun) {
            let result=context.excuteFun(this.nativeFun, this.outPutParmPins,BPStaticFun,this._parmsArray);
            if(result==undefined){
                this.outPutParmPins[0].setValue(result);
            }
        }
        return BPConst.MAX_CODELINE;
    }

}