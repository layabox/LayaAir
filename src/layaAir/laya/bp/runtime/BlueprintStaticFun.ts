import { rejects } from "assert";
import { resolve } from "path";
import { IOutParm } from "../core/interface/IOutParm";
import { BlueprintPinRuntime } from "./BlueprintPinRuntime";
import { IRunAble } from "./interface/IRunAble";

/**
 * 
 */
export class BlueprintStaticFun {
    static branch(input: boolean, outExcutes: BlueprintPinRuntime[]): BlueprintPinRuntime {
        return input ? outExcutes[0] : outExcutes[1];
    }

    static switchFun(input: any, outExcutes: BlueprintPinRuntime[]): BlueprintPinRuntime {
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

    static waitTime(second:number):Promise<boolean>{
        return new Promise((resolve,rejects)=>{
            setTimeout(() => {
                console.log(">>>>>>>>before");
                resolve(true);
                console.log(">>>>>>>>after");
            }, second);
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