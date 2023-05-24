import { Handler } from "../utils/Handler";
import { ILaya } from "./../../ILaya";
import { URL } from "./URL";

/**
 * 自动图集管理类
 * @private
 */
export class AtlasInfoManager {

    static _fileLoadDic: Record<string, { url: string, baseUrl?: string }> = {};

    static enable(infoFile: string, callback: Handler | null = null): void {
        ILaya.loader.fetch(infoFile, "json").then(data => {
            if (!data)
                return;

            AtlasInfoManager.addAtlases(data);
            callback && callback.run();
        });
    }

    static addAtlases(data: Record<string, [string, string[]]>) {
        let dic = AtlasInfoManager._fileLoadDic;
        for (let key in data) {
            let arr = data[key];
            let prefix = URL.formatURL(arr[0]);
            let frames = arr[1];
            let len = frames.length;
            let entry = { url: key };
            for (let i = 0; i < len; i++) {
                dic[prefix + frames[i]] = entry;
            }
        }
    }

    static addAtlas(atlasUrl: string, prefix: string, frames: Array<string>) {
        prefix = URL.formatURL(prefix);
        let dic = AtlasInfoManager._fileLoadDic;
        let entry = { url: atlasUrl };
        for (let i of frames) {
            dic[prefix + i] = entry;
        }
    }

    static getFileLoadPath(file: string): { url: string, baseUrl?: string } {
        return AtlasInfoManager._fileLoadDic[file];
    }
}


