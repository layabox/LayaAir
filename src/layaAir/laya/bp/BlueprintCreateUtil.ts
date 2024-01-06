import { Laya } from "../../Laya";
import { JsonBinRead } from "../net/util/JsonBinRead";
import { BlueprintConst } from "./core/BlueprintConst";
import { extendsData } from "./datas/BlueprintExtends";
import { BlueprintFactory } from "./runtime/BlueprintFactory";

export class BlueprintCreateUtil{

    static __init__():Promise<void>{
        let strs = BlueprintConst.configPath.split(".");
        let ext = strs[strs.length - 1];
        let isJson = ext == "json";

        return Laya.loader.fetch(BlueprintConst.configPath , isJson ? "json" : "arraybuffer").then((result)=>{
            if (!result) {
                console.error("Blueprint init fail");
                return Promise.resolve();
            }
            let json:any = result;
            if (!isJson) {
                json = JsonBinRead.instance.read(result);
            }
            for (const key in json) {
                extendsData[key] = json[key];
            }
            BlueprintFactory.__init__();
            return Promise.resolve();
        })
    }
}

Laya.addBeforeInitCallback(BlueprintCreateUtil.__init__);