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

    protected excuteFun(context: IRunAble, caller: IBluePrintSubclass, parmsArray: any[],runId: number) {
        //TODO 
        if (caller && caller.context) {
            let primise:Promise<any>;
            let cb:any;
            let result:any;
            result = caller.bp.runCustomFun(caller.context, this.functionID, parmsArray,()=>{
                if(result===false&&cb){
                    cb();
                }
            },runId);
            if (result === false) {
                primise = new Promise((resolve, reject) => {
                    cb=resolve;
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