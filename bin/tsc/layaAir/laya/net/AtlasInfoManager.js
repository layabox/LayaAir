import { ILaya } from "./../../ILaya";
import { Loader } from "././Loader";
import { Handler } from "../utils/Handler";
/**
 * @private
 */
export class AtlasInfoManager {
    static enable(infoFile, callback = null) {
        ILaya.loader.load(infoFile, Handler.create(null, AtlasInfoManager._onInfoLoaded, [callback]), null, Loader.JSON);
    }
    /**@private */
    static _onInfoLoaded(callback, data) {
        var tKey;
        var tPrefix;
        var tArr;
        var i, len;
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
    }
    static getFileLoadPath(file) {
        return AtlasInfoManager._fileLoadDic[file] || file;
    }
}
AtlasInfoManager._fileLoadDic = {};
