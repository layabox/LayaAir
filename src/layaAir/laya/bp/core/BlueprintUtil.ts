import { EventDispatcher } from "../../events/EventDispatcher";
import { Browser } from "../../utils/Browser";
import { ClassUtils } from "../../utils/ClassUtils";
import { customData, extendsData } from "../datas/BlueprintExtends";
import { TBPDeclaration } from "../datas/types/BlueprintDeclaration";
import { BPType, TBPCNode, TBPNode, TBPSaveData, TBPStageData, TBPVarProperty } from "../datas/types/BlueprintTypes";
import { BlueprintData } from "./BlueprintData";
export class BlueprintUtil {

    static bpData: BlueprintData;

    static eventManger: EventDispatcher = new EventDispatcher();

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
        BlueprintUtil.eventManger.event(BlueprintUtil.CustomClassFinish, name);
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
        return ClassUtils.getClass(ext) || Browser.window.Laya[ext];
    }

}