import { Laya } from "../../../Laya";
import { JsonBinRead } from "../../net/util/JsonBinRead";
import { BlueprintConst } from "../core/BlueprintConst";
import { BlueprintUtil } from "../core/BlueprintUtil";
import { extendsData } from "../datas/BlueprintExtends";
import { BlueprintFactory } from "../runtime/BlueprintFactory";
import { ClassUtils } from "../../utils/ClassUtils";
import { Browser } from "../../utils/Browser";
import { URL } from "../../net/URL";
import { AssetDb } from "../../resource/AssetDb";

export class BlueprintCreateUtil {

    static __init__(): Promise<void> {
        let strs = BlueprintConst.configPath.split(".");
        let ext = strs[strs.length - 1];
        let isJson = ext == "json";
        //注册函数
        BlueprintUtil.getClass = function (ext: any) {
            return ClassUtils.getClass(ext) || Browser.window.Laya[ext];
        }
        BlueprintUtil.regClass = ClassUtils.regClass;

        BlueprintUtil.getResByUUID = function (uuid: string) {
            return Laya.loader.getRes(URL.getResURLByUUID(uuid)).create();
        }

        BlueprintUtil.getNameByUUID = function (uuid: string) {
            return AssetDb.inst.uuidMap[uuid];
        }

        return Laya.loader.fetch(BlueprintConst.configPath, isJson ? "json" : "arraybuffer").then((result) => {
            if (!result) {
                console.error("Blueprint init fail");
                return Promise.resolve();
            }
            let json: any = result;
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

Laya.addAfterInitCallback(BlueprintCreateUtil.__init__);