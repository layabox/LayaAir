import { IBluePrintSubclass } from "../core/interface/IBluePrintSubclass";
import { BlueprintFactory } from "./BlueprintFactory";
import { BlueprintPinRuntime } from "./BlueprintPinRuntime";
import { IRunAble } from "./interface/IRunAble";

/**
 * 
 */
export class BlueprintStaticFun {
    /**
     * @internal
     * @param outExcutes 
     * @param input 
     * @returns 
     */
    static branch(outExcutes: BlueprintPinRuntime[], input: boolean): BlueprintPinRuntime {
        return input ? outExcutes[0] : outExcutes[1];
    }
    /**
     * @private
     * @param outExcutes 
     * @param input 
     * @returns 
     */
    static switchFun(outExcutes: BlueprintPinRuntime[], input: any): BlueprintPinRuntime {
        return outExcutes.find((item) => item.nid == input) || outExcutes.find((item) => item.nid == "default");
    }
    /**
     * 打印
     * @param str 
     */
    static print(str: string) {
        console.log(str);
    }
    /**
     * @private
     * @param target 
     * @param name 
     * @param context 
     * @returns 
     */
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
    /**
     * @private
     * @param target 
     * @param value 
     * @param name 
     * @param context 
     */
    static setVariable(target: IBluePrintSubclass, value: any, name: string, context: IRunAble): any {
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
        return value;
    }
    /**
     * 
     * @param second 
     * @returns 
     */
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
    /**
     * 相加
     * @param a 
     * @param b 
     * @returns 和
     */
    static add<T extends string|number>(a: T, b: T): T {
        return a as any + b;
        //return a+b;
    }

    /**
     * 
     * @param a 
     * @param b 
     * @returns 是否相同
     */
    static equal(a: any, b: any): any {
        return a == b;
    }

    /**
     * @private
     * @returns 
     */
    static expression() {
        return true;
    }
    /**
     * @private
     * @param target 
     * @param value 
     * @param name 
     * @param context 
     */
    static typeInstanceof<T>(outExcutes: BlueprintPinRuntime[], target: any, type:new()=>T ) {
        let b;
        if (typeof (type) == 'string') {
            b = typeof (target) == type;
        } else {
            b = target instanceof type;
        }
        return b ? outExcutes[0] : outExcutes[1];
    }
}