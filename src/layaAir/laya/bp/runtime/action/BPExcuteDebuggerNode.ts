import { IRunAble } from "../interface/IRunAble";
import { BPPinRuntime } from "../BPPinRuntime";
import { BPRuntimeBaseNode } from "../node/BPRuntimeBaseNode";
import { BPExcuteNode } from "./BPExcuteNode";
import { IBPRutime } from "../interface/IBPRutime";

export class BPExcuteDebuggerNode extends BPExcuteNode implements IRunAble {
    private _indexList:number[]=[];
    
    pushBack(index: number): void {
        this._indexList.push(index);
    }
    debuggerPause:boolean;
    private _doNext: any;

    next() {
        let fun=this._doNext
        if(fun){
            this._doNext=null;
            fun(false);
        }
    }

    beginExcute(runtimeNode: BPRuntimeBaseNode,runner:IBPRutime,enableDebugPause:boolean): boolean{
    //throw new Error("Method not implemented.");
        if(enableDebugPause){
            this.debuggerPause=true;
            this._doNext=()=>{
                this.debuggerPause=false;
                runner.runByContext(this,runtimeNode.index,false);
                if(!this.debuggerPause){
                    if(this._indexList.length>0){
                        let a= this._indexList.pop();
                        runner.runByContext(this,a,true);
                    }
                }
            }
            console.log(this);
            console.log(runtimeNode.name+"断住了");
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

    excuteFun(nativeFun: Function, outPutParmPins: BPPinRuntime[],caller:any, parmsArray: any[]): void {
    
        super.excuteFun(nativeFun, outPutParmPins,caller, parmsArray);

    }

}