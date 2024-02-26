import { customData, extendsData } from "../datas/BlueprintExtends";
import { TBPDeclaration } from "../datas/types/BlueprintDeclaration";
import { TBPNode } from "../datas/types/BlueprintTypes";
import { BlueprintData } from "./BlueprintData";
export class BlueprintUtil {
    static classMap: any = {};

    static bpData: BlueprintData;

    static onfinishCallbacks: Record<number, [Function,any,any[]]> = {};

    static CustomClassFinish: string = "CustomClassFinish";

    static customModify = false;

    static clone<T>(obj: T): T {
        if (null == obj) return obj;
        return JSON.parse(JSON.stringify(obj));
    }
    static getConstNode(node?: TBPNode) {
        this.initConstNode();
        return this.bpData.getConstNode(node);
    }
    static getConstDataById(target: string, dataId: string) {
        return this.bpData.getConstDataById(target, dataId);
    }

    /**
     * hook
     * @param name 
     * @param data 
     */
    static addCustomData(name: string, data: TBPDeclaration) {
        customData[name] = data;
        BlueprintUtil.customModify = true;
        for (let key in this.onfinishCallbacks) {
            let [fun,caller, args] = this.onfinishCallbacks[key];
            let realArgs = args ? [name, ...args] : [name];
            fun.apply(caller, realArgs);
        }
    }

    static getDeclaration(name: string): TBPDeclaration {
        return extendsData[name] ? extendsData[name] : customData[name];
    }
    static initConstNode() {
        if (null == this.bpData) {
            this.bpData = new BlueprintData();
        }
        if (this.customModify) {
            this.bpData.initData(customData);
            this.customModify = false;
        }
    }
    static getClass(ext: any) {
        return this.classMap[ext];
    }

    static regClass(name: string, cls: any) {
        this.classMap[name] = cls;
    }

}