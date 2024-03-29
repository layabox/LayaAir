import { IBluePrintSubclass } from "../core/interface/IBluePrintSubclass";
import { IRuntimeDataManger } from "../core/interface/IRuntimeDataManger";
import { ExpressParse } from "../express/ExpressParse";
import { BlueprintFactory } from "./BlueprintFactory";
import { BlueprintPinRuntime } from "./BlueprintPinRuntime";
import { IBPRutime } from "./interface/IBPRutime";
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
    /*
    * @private
    */
    static getTempVar(name: string, runtimeDataMgr: IRuntimeDataManger, runId: number) {
        return runtimeDataMgr.getVar(name, runId);
    }
    /*
    * @private
    */
    static setTempVar(value: any, name: string, runtimeDataMgr: IRuntimeDataManger, runId: number) {
        return runtimeDataMgr.setVar(name, value, runId);
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
    * @param name 
    * @param context 
    * @returns 
    */
    static getSelf(name: string, context: IRunAble): any {
        return context.getSelf();
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
     * 等待
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
    // /**
    //  * 相加
    //  * @param a 
    //  * @param b 
    //  * @returns 和
    //  */
    // static add<T extends string | number>(a: T, b: T): T {
    //     return a as any + b;
    //     //return a+b;
    // }

    // /**
    //  * 
    //  * @param a 
    //  * @param b 
    //  * @returns 是否相同
    //  */
    // static equal(a: any, b: any): any {
    //     return a == b;
    // }

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
    static typeInstanceof<T>(outExcutes: BlueprintPinRuntime[], target: any, type: new () => T) {
        let b;
        if (typeof (type) == 'string') {
            b = typeof (target) == type;
        } else {
            b = target instanceof type;
        }
        return b ? outExcutes[0] : outExcutes[1];
    }
    /**
     * @private
     * @param nextExec 
     * @param outPutParmPins 
     * @param parms 
     * @param context 
     * @param runner 
     * @param runtimeDataMgr 
     */
    private static runBranch(nextExec: BlueprintPinRuntime, outPutParmPins: BlueprintPinRuntime[], parms: any[], context: IRunAble, runner: IBPRutime, runtimeDataMgr: IRuntimeDataManger, prePin: BlueprintPinRuntime,runId:number) {
        let curRunId = runner.getRunID();
        parms.forEach((item, index) => {
            runtimeDataMgr.setPinData(outPutParmPins[index], item, curRunId);
        })
        runtimeDataMgr.saveContextData(runId,curRunId);
        runner.runByContext(context, runtimeDataMgr, nextExec.owner, true, null, curRunId, nextExec, prePin);
    }

    /**
     * @private
     * @param target 
     * @param value 
     * @param name 
     * @param context 
     */
    static forEach(inputExcute: BlueprintPinRuntime, inputExcutes: BlueprintPinRuntime[], outExcutes: BlueprintPinRuntime[], outPutParmPins: BlueprintPinRuntime[], context: IRunAble, runner: IBPRutime, runtimeDataMgr: IRuntimeDataManger, runId: number, array: any[]) {
        let nextPin = (outExcutes[0].linkTo[0] as BlueprintPinRuntime);
        if (nextPin) {
            array.forEach((item, index) => {
                BlueprintStaticFun.runBranch(nextPin, outPutParmPins, [item, index], context, runner, runtimeDataMgr, outExcutes[0],runId);
            })
        }
        return outExcutes[1].excute(context, runtimeDataMgr, runner, runId);
    }


    /**
    * @private
    * @param target 
    * @param value 
    * @param name 
    * @param context 
    */
    static forEachWithBreak(inputExcute: BlueprintPinRuntime, inputExcutes: BlueprintPinRuntime[], outExcutes: BlueprintPinRuntime[], outPutParmPins: BlueprintPinRuntime[], context: IRunAble, runner: IBPRutime, runtimeDataMgr: IRuntimeDataManger, runId: number, array: any[]) {
        let breakNode;
        if (inputExcute == inputExcutes[1]) {
            breakNode = runtimeDataMgr.getRuntimePinById(inputExcute.id);
            if (breakNode.getValue(runId) == ERunStat.running) {
                breakNode.initValue(ERunStat.break);
            }
            return null;
        }
        breakNode = runtimeDataMgr.getRuntimePinById(inputExcutes[1].id);
        breakNode.initValue(ERunStat.running);
        let nextPin = (outExcutes[0].linkTo[0] as BlueprintPinRuntime);
        if (nextPin) {
            for (let i = 0; i < array.length; i++) {
                BlueprintStaticFun.runBranch(nextPin, outPutParmPins, [array[i], i], context, runner, runtimeDataMgr, outExcutes[0],runId);
                if (breakNode.getValue(runId) == ERunStat.break) {
                    break;
                }
            }
        }
        breakNode.initValue(ERunStat.end);
        return outExcutes[1].excute(context, runtimeDataMgr, runner, runId);
    }


    /**
     * @private
     * @param target 
     * @param value 
     * @param name 
     * @param context 
     */
    static forLoop(inputExcute: BlueprintPinRuntime, inputExcutes: BlueprintPinRuntime[], outExcutes: BlueprintPinRuntime[], outPutParmPins: BlueprintPinRuntime[], context: IRunAble, runner: IBPRutime, runtimeDataMgr: IRuntimeDataManger, runId: number, firstIndex: number, lastIndex: number, step: number = 1) {
        if (step <= 0) step = 1;
        let nextPin = (outExcutes[0].linkTo[0] as BlueprintPinRuntime);
        if (nextPin) {
            for (let i = firstIndex; i < lastIndex; i += step) {
                BlueprintStaticFun.runBranch(nextPin, outPutParmPins, [i], context, runner, runtimeDataMgr, outExcutes[0],runId);
            }
        }
        return outExcutes[1].excute(context, runtimeDataMgr, runner, runId);
    }

    /**
    * @private
    * breakNode 1 代表只在执行中，2代表执行中断，0代表执行完毕
    */
    static forLoopWithBreak(inputExcute: BlueprintPinRuntime, inputExcutes: BlueprintPinRuntime[], outExcutes: BlueprintPinRuntime[], outPutParmPins: BlueprintPinRuntime[], context: IRunAble, runner: IBPRutime, runtimeDataMgr: IRuntimeDataManger, runId: number, firstIndex: number, lastIndex: number, step: number = 1) {
        let breakNode;
        if (inputExcute == inputExcutes[1]) {
            breakNode = runtimeDataMgr.getRuntimePinById(inputExcute.id);
            if (breakNode.getValue(runId) == ERunStat.running) {
                breakNode.initValue(ERunStat.break);
            }
            return null;
        }
        else {
            breakNode = runtimeDataMgr.getRuntimePinById(inputExcutes[1].id);
            breakNode.initValue(ERunStat.running);
            if (step <= 0) step = 1;
            let nextPin = (outExcutes[0].linkTo[0] as BlueprintPinRuntime);
            if (nextPin) {
                for (let i = firstIndex; i < lastIndex; i += step) {
                    BlueprintStaticFun.runBranch(nextPin, outPutParmPins, [i], context, runner, runtimeDataMgr, outExcutes[0],runId);
                    if (breakNode.getValue(runId) == ERunStat.break) {
                        break;
                    }
                }
            }
            breakNode.initValue(ERunStat.end);
            return outExcutes[1].excute(context, runtimeDataMgr, runner, runId);
        }
    }
    /**
     * 执行表达式
     * @param express 
     * @param a 
     * @param b 
     * @param c 
     * @returns 
     */
    static runExpress(express: string, a: any, b: any, c: any): any {
        let expressTree = ExpressParse.instance.parse(express);
        let context = { a: a, b: b, c: c, Math: Math };
        return expressTree.call(context);
    }

}

/**
 * 运行状态枚举
 */
enum ERunStat {
    running = 1,
    break = 2,
    end = 0
}