import { IBluePrintSubclass } from "../../core/interface/IBluePrintSubclass";
import { INodeManger } from "../../core/interface/INodeManger";
import { TBPEventProperty, TBPNode } from "../../datas/types/BlueprintTypes";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintFunNode } from "./BlueprintFunNode";

export class BlueprintCustomFunNode extends BlueprintFunNode {
    functionID: number;

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintFunNode>) {
        if (node.dataId) {
            this.functionID = node.dataId as any as number;
            this.isMember = true;
            //this.eventName = (manger.dataMap[node.dataId] as TBPEventProperty).name;
        }
    }

    protected excuteFun(context: IRunAble, caller: IBluePrintSubclass, parmsArray: any[]) {
        //TODO 
        if (caller && caller.context) {
            let result = caller.bp.runCustomFun(caller.context, this.functionID, parmsArray);
            if (result === false) {
                let primise = new Promise((resolve, reject) => {


                });
                return primise;
            }
        }
        return null;
        //return context.excuteFun(this.nativeFun, this.outPutParmPins, caller, parmsArray);
    }


    setFunction(fun: Function, isMember: boolean) {
        this.nativeFun = this.customFun;//fun;
        this.isMember = isMember;
        this.funcode = fun?.name;
    }


    customFun(parms: any[]) {

    }
}