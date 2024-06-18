import { customBTData, extendsBTData } from "../datas/BehaviorTreeExtends";

/**
 * 
 * @ brief: BehaviorTreeUtil
 * @ author: zyh
 * @ data: 2024-03-21 10:49
 */
export class BehaviorTreeUtil {
    /**
    * hook
    * @param name 
    * @param data 
    */
    static addCustomData(name: string, data: any) {
        customBTData[name] = data;
    }

    static getDeclaration(name: string): any {
        return extendsBTData[name] ? extendsBTData[name] : customBTData[name];
    }
}