import { Laya } from "../../Laya";
import { JsonBinRead } from "../net/util/JsonBinRead";
import { BlueprintConst } from "../bp/core/BlueprintConst";
import { BlueprintUtil } from "../bp/core/BlueprintUtil";
import { extendsData } from "../bp/datas/BlueprintExtends";
import { BlueprintFactory } from "../bp/runtime/BlueprintFactory";
import { ClassUtils } from "../utils/ClassUtils";
import { Browser } from "../utils/Browser";

export class BlueprintCreateUtil{

    static __init__():Promise<void>{
        let strs = BlueprintConst.configPath.split(".");
        let ext = strs[strs.length - 1];
        let isJson = ext == "json";
        //注册函数
        BlueprintUtil.getClass=function(ext: any) {
            return ClassUtils.getClass(ext) || Browser.window.Laya[ext];
        }
        BlueprintUtil.regClass=ClassUtils.regClass;

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
            BlueprintUtil.initConstNode();
            return Promise.resolve();
        })
    }
}

Laya.addBeforeInitCallback(BlueprintCreateUtil.__init__);