import { Laya } from "../../../Laya";
import { JsonBinRead } from "../../net/util/JsonBinRead";
import { BehaviorTreeFactory } from "../BehaviorTreeFactory";
import { BTConst } from "../core/BTConst";
import { extendsBTData } from "../datas/BehaviorTreeExtends";

/**
 * 
 * @ brief: BehaviorTreeCreateUtil
 * @ author: zyh
 * @ data: 2024-03-04 16:28
 */
export class BehaviorTreeCreateUtil {
    static __init__(): Promise<void> {
        let strs = BTConst.configPath.split(".");
        let ext = strs[strs.length - 1];
        let isJson = ext == "json";

        return Laya.loader.fetch(BTConst.configPath , isJson ? "json" : "arraybuffer").then((result)=>{
            if (!result) {
                console.error("Blueprint init fail");
                return Promise.resolve();
            }
            let json:any = result;
            if (!isJson) {
                json = JsonBinRead.instance.read(result);
            }
            for (const key in json) {
                extendsBTData[key] = json[key];
            }
            BehaviorTreeFactory.__init__();
            return Promise.resolve();
        })
    }
}

Laya.addBeforeInitCallback(BehaviorTreeCreateUtil.__init__);
