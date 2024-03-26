
import { IRunAble } from "../interface/IRunAble";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintComplexNode } from "./BlueprintComplexNode";
import { BlueprintConst } from "../../core/BlueprintConst";
import { IBPRutime } from "../interface/IBPRutime";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintPromise } from "../BlueprintPromise";
import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BlueprintSequenceNode extends BlueprintComplexNode {


    next(context: IRunAble, runtimeDataMgr: IRuntimeDataManger, parmsArray: any[], runner: IBPRutime, enableDebugPause: boolean, runId: number): BlueprintPinRuntime {
        let first = true;
        let arr: Promise<any>[] = [];
        for (let i = 0, n = this.outExcutes.length; i < n; i++) {
            let item = this.outExcutes[i];
            let pin = (item.linkTo[0] as BlueprintPinRuntime);
            if (pin) {
                let cb: any;
                let result: boolean;
                //TODO 代码待优化
                if (context.debuggerPause) {
                    result = false;
                    let callback = (owner: BlueprintRuntimeBaseNode) => {
                        if (context.debuggerPause) {
                            context.pushBack(owner, callback);
                        } else {
                            result = runner.runByContext(context, runtimeDataMgr, owner, enableDebugPause, () => {
                                if (result === false && cb) {
                                    cb();
                                }
                            }, runId, pin, item, true);

                            if (result && cb) {
                                cb();
                            }
                        }
                    }
                    context.pushBack(pin.owner, callback);
                }
                else {
                    result = runner.runByContext(context, runtimeDataMgr, pin.owner, enableDebugPause, () => {
                        if (result === false && cb) {
                            cb();
                        }
                    }, runId, pin, item, true);

                }
                if (result === false) {
                    let promise = new Promise((resolve) => {
                        cb = resolve;
                    })
                    arr.push(promise);
                }
                first = false;
                //item.excute(context);
            }
        }
        if (arr.length > 0) {
            let promise = BlueprintPromise.create();
            Promise.all(arr).then((value) => {
                promise.index = BlueprintConst.MAX_CODELINE;
                promise.listIndex = this.listIndex;
                promise.complete();
                promise.recover();
            })
            return promise as any;
        }
        else {
            return null;
        }
    }

    setFunction(fun: Function) {
        // this.nativeFun = null;
        // this.funcode = fun?.name;
        // this.find=fun as (input:any,outExcutes:BPPinRuntime[])=>BPPinRuntime;
    }
}