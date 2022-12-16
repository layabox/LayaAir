import { Handler } from "../utils/Handler";
import { ILaya } from "./../../ILaya";
import { URL } from "./URL";

/**
 * @private
 */
export class AtlasInfoManager {

    static _fileLoadDic: Record<string, { url: string, baseUrl?: string }> = {};

    static enable(infoFile: string, callback: Handler | null = null): void {
        ILaya.loader.fetch(infoFile, "json").then(data => {
            if (!data)
                return;

            AtlasInfoManager.addToDict(data);
            callback && callback.run();
        });
    }

    static addToDict(data: any) {
        for (let tKey in data) {
            let tArr = data[tKey];
            let tPrefix = URL.formatURL(tArr[0]);
            tArr = tArr[1];
            let len = tArr.length;
            let entry = { url: tKey };
            for (let i = 0; i < len; i++) {
                AtlasInfoManager._fileLoadDic[tPrefix + tArr[i]] = entry;
            }
        }
    }

    static getFileLoadPath(file: string): { url: string, baseUrl?: string } {
        return AtlasInfoManager._fileLoadDic[file];
    }
}


