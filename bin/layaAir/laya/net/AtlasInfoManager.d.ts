import { Handler } from "../utils/Handler";
/**
 * @private
 */
export declare class AtlasInfoManager {
    private static _fileLoadDic;
    static enable(infoFile: string, callback?: Handler): void;
    /**@private */
    private static _onInfoLoaded;
    static getFileLoadPath(file: string): string;
}
