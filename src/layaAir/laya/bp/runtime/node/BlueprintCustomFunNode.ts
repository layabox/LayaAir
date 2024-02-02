import { IBluePrintSubclass } from "../../core/interface/IBluePrintSubclass";
import { INodeManger } from "../../core/interface/INodeManger";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { TBPNode } from "../../datas/types/BlueprintTypes";
import { BlueprintFactory } from "../BlueprintFactory";
import { IRunAble } from "../interface/IRunAble";
import { BlueprintFunNode } from "./BlueprintFunNode";

export class BlueprintCustomFunNode extends BlueprintFunNode {
    functionID: number;

    protected onParseLinkData(node: TBPNode, manger: INodeManger<BlueprintFunNode>) {
        let id = node.dataId;
        if (id) {
            this.functionID = id as any as number;
            this.isMember = true;
            //this.eventName = (manger.dataMap[node.dataId] as TBPEventProperty).name;
        }
    }

    protected _excuteFun(context: IRunAble, cb: any) {
        if (cb) {
            cb();
        }
    }

    protected excuteFun(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, caller: IBluePrintSubclass, parmsArray: any[], runId: number) {
        //TODO 
        if (caller && caller[BlueprintFactory.contextSymbol]) {
            let primise: Promise<any>;
            let cb: any;
            let result: any;
            let _funcContext = caller[BlueprintFactory.contextSymbol];
            result = caller[BlueprintFactory.bpSymbol].runCustomFun(_funcContext, this.functionID, parmsArray, () => {
                this._excuteFun(_funcContext, cb)
            }, runId, null);
            if (result === false) {
                primise = new Promise((resolve, reject) => {
                    cb = resolve;
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