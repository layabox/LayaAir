import { Handler } from "../utils/Handler";
import { ILaya } from "./../../ILaya";
import { Loader } from "./Loader";

/**
 * @private
 */
export class AtlasInfoManager {

	private static _fileLoadDic: any = {};

	static enable(infoFile: string, callback: Handler|null = null): void {
		ILaya.loader.load(infoFile, Handler.create(null, AtlasInfoManager._onInfoLoaded, [callback]), null, Loader.JSON);
	}

	/**@private */
	private static _onInfoLoaded(callback: Handler, data: any): void {
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
	}

	static getFileLoadPath(file: string): string {
		return AtlasInfoManager._fileLoadDic[file] || file;
	}
}


