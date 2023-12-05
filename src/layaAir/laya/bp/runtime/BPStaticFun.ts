import { rejects } from "assert";
import { resolve } from "path";
import { IOutParm } from "../core/interface/IOutParm";
import { BPPinRuntime } from "./BPPinRuntime";
import { IRunAble } from "./interface/IRunAble";

/**
 * 
 */
export class BPStaticFun {
    static branch(input: boolean, outExcutes: BPPinRuntime[]): BPPinRuntime {
        return input ? outExcutes[0] : outExcutes[1];
    }

    static switchFun(input: any, outExcutes: BPPinRuntime[]): BPPinRuntime {
        return outExcutes.find((item) => item.name == input) || outExcutes.find((item) => item.name == "default");
    }

    static print(str: string) {
        console.log(str);
    }

    static getVariable(name: string, context: IRunAble): any {
        return context.getVar(name);
    }

    static setVariable(value: any, name: string, context: IRunAble): any {
        return context.setVar(name, value);
    }

    static async waitTime(second:number){
        return new Promise((resolve,rejects)=>{
            // Laya.timer.once(second,this,()=>{
            //     resolve(true);
            // })
        });
    }

    // static add(a: any, b: any, out: IOutParm<number>,out1:IOutParm<string>) {
    //     out.setValue(a + b);
    //     //return a+b
    //     //return a+b;
    // }

    static add(a: any, b: any): any {
        return a + b;
        //return a+b;
    }


    static equal(a: any, b: any): any {
        return a == b;
    }
}