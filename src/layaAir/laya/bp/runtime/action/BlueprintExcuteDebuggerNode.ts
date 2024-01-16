import { IRunAble } from "../interface/IRunAble";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { BlueprintExcuteNode } from "./BlueprintExcuteNode";
import { IBPRutime } from "../interface/IBPRutime";
import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";

export class BlueprintExcuteDebuggerNode extends BlueprintExcuteNode implements IRunAble {
    private _nodeList: IExcuteListInfo[] = [];

    pushBack(excuteNode: IExcuteListInfo): void {
        this._nodeList.push(excuteNode);
    }
    debuggerPause: boolean;
    private _doNext: any;

    next() {
        let fun = this._doNext
        if (fun) {
            this._doNext = null;
            fun(false);
        }
    }

    beginExcute(runtimeNode: BlueprintRuntimeBaseNode, runner: IBPRutime, enableDebugPause: boolean): boolean {
        //throw new Error("Method not implemented.");
        if (enableDebugPause) {
            this.debuggerPause = true;
            this._doNext = () => {
                this.debuggerPause = false;
                runner.runByContext(this, runtimeNode, false, null, -1);
                if (!this.debuggerPause) {
                    if (this._nodeList.length > 0) {
                        runner.runByContext(this, this._nodeList.pop(), true, null, -1);
                    }
                }
            }
            console.log(this);
            console.log(runtimeNode.name + "断住了");
            return true;
        }

        if (this.listNode.indexOf(runtimeNode) == -1) {
            this.listNode.push(runtimeNode);
            //super.beginExcute(runtimeNode);
            // this.currentFun=[];
            return false;
        }
        else {
            return false;
            console.error("检测到有死循环");
            return true;
        }
    }

    excuteFun(nativeFun: Function, outPutParmPins: BlueprintPinRuntime[], caller: any, parmsArray: any[],runId:number): void {

        super.excuteFun(nativeFun, outPutParmPins, caller, parmsArray,runId);

    }

}