import { IBluePrintSubclass } from "../core/interface/IBluePrintSubclass";
import { BlueprintFactory } from "./BlueprintFactory";
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

    static getVariable(target: IBluePrintSubclass, name: string, context: IRunAble): any {
        if (!target) {
            return context.getVar(name);
        }
        else {
            let realContext = target[BlueprintFactory.contextSymbol];
            if (realContext) {
                return realContext.getVar(name);
            }
            else {
                return target[name];
            }
        }
    }

    static setVariable(target: IBluePrintSubclass, value: any, name: string, context: IRunAble): void {
        if (!target) {
            context.setVar(name, value);
        }
        else {
            let realContext = target[BlueprintFactory.contextSymbol];
            if (realContext) {
                realContext.setVar(name, value);
            }
            else {
                target[name] = value;
            }
        }
    }

    static waitTime(second: number): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            setTimeout(() => {
                resolve(true);
            }, second * 1000);
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