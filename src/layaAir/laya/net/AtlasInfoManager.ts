import { Handler } from "../utils/Handler";
import { ILaya } from "./../../ILaya";

/**
 * @private
 */
export class AtlasInfoManager {

    static _fileLoadDic: Record<string, { url: string, baseUrl?: string }> = {};

    static enable(infoFile: string, callback: Handler | null = null): void {
        ILaya.loader.fetch(infoFile, "json").then(data => {
            if (!data)
                return;

            for (let tKey in data) {
                let tArr = data[tKey];
                let tPrefix = tArr[0];
                tArr = tArr[1];
                let len = tArr.length;
                let entry = { url: tKey };
                for (let i = 0; i < len; i++) {
                    AtlasInfoManager._fileLoadDic[tPrefix + tArr[i]] = entry;
                }
            }
            callback && callback.run();
        });
    }

    static getFileLoadPath(file: string): { url: string, baseUrl?: string } {
        return AtlasInfoManager._fileLoadDic[file];
    }
}


