import { IRunAble } from "../interface/IRunAble";
import { BlueprintPinRuntime } from "../BlueprintPinRuntime";
import { BlueprintRuntimeBaseNode } from "../node/BlueprintRuntimeBaseNode";
import { BlueprintExcuteNode } from "./BlueprintExcuteNode";
import { IBPRutime } from "../interface/IBPRutime";
import { IExcuteListInfo } from "../../core/interface/IExcuteListInfo";
import { IRuntimeDataManger } from "../../core/interface/IRuntimeDataManger";
import { BlueprintDebuggerManager, BpDebuggerRunType } from "../debugger/BlueprintDebuggerManager";

export class BlueprintExcuteDebuggerNode extends BlueprintExcuteNode implements IRunAble {
    debuggerPause: boolean;
    debuggerManager: BlueprintDebuggerManager;

    private _doNext: any;
    private _nodeList: IExcuteListInfo[] = [];

    constructor(data: any) {
        super(data);
    }

    pushBack(excuteNode: IExcuteListInfo): void {
        this._nodeList.push(excuteNode);
    }

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
            let b = runtimeNode.hasDebugger || this.debuggerManager.debugging;
            if(!b){
                const runtimeDataMgr = this.getDataMangerByID(runtimeNode.listIndex);
                b = runtimeDataMgr.debuggerPause == BpDebuggerRunType.stepOver;
                if(b) runtimeDataMgr.debuggerPause = BpDebuggerRunType.none;
            }
            if (b) {
                this.debuggerPause = true;
                /* this._doNext = () => {
                    this.debuggerPause = false;
                    let runtimeDataMgr = this.getDataMangerByID(runtimeNode.listIndex);
                    runner.runByContext(this, runtimeDataMgr, runtimeNode, false, null, -1);
                    if (!this.debuggerPause) {
                        if (this._nodeList.length > 0) {
                            runner.runByContext(this, runtimeDataMgr, this._nodeList.pop(), true, null, -1);
                        }
                    }
                } */
                console.log(this);
                console.log(runtimeNode.name + "断住了");
                this.debuggerManager.pause(this, runtimeNode);
                return true;
            } else {
                return false;
            }
        }

        if (this.listNode.indexOf(runtimeNode) == -1) {
            this.listNode.push(runtimeNode);
            //super.beginExcute(runtimeNode);
            // this.currentFun=[];
            return false;
        }
        else {
            return false;
        }
    }

    excuteFun(nativeFun: Function, outPutParmPins: BlueprintPinRuntime[], runtimeDataMgr: IRuntimeDataManger, caller: any, parmsArray: any[], runId: number) {

        return super.excuteFun(nativeFun, outPutParmPins, runtimeDataMgr, caller, parmsArray, runId);

    }

}