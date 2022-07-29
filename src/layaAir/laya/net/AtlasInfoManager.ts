import { Handler } from "../utils/Handler";
import { ILaya } from "./../../ILaya";

/**
 * @private
 */
export class AtlasInfoManager {

    private static _fileLoadDic: any = {};

    static enable(infoFile: string, callback: Handler | null = null): void {
        ILaya.loader.fetch(infoFile, "json").then(data => {
            if (!data)
                return;

            var tKey: string;
            var tPrefix: string;
            var tArr: any[];
            var i: number, len: number;

            for (tKey in data) {
                tArr = data[tKey];
                tPrefix = tArr[0];
                tArr = tArr[1];
                len = tArr.length;
                for (i = 0; i < len; i++) {
                    AtlasInfoManager._fileLoadDic[tPrefix + tArr[i]] = tKey;
                }
            }
            callback && callback.run();
        });
    }

    static getFileLoadPath(file: string): string {
        return AtlasInfoManager._fileLoadDic[file];
    }
}


