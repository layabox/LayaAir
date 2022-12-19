import { Utils } from "../utils/Utils";

export class AssetDb {
    static inst: AssetDb = new AssetDb();

    uuidMap: Record<string, string> = {};
    shaderNameMap: Record<string, string> = {};
    metaMap: Record<string, any> = {};

    /** 是否下载图片的描述信息 */
    enableImageMetaFile: boolean = false;

    UUID_to_URL(uuid: string): string {
        return this.uuidMap[uuid];
    }

    UUID_to_URL_async(uuid: string): Promise<string> {
        return null;
    }

    URL_to_UUID_async(url: string): Promise<string> {
        return null;
    }

    resolveURL(url: string, onResolve: (url: string) => void) {
        if (url.startsWith("res://")) {
            let uuid = url.substring(6);
            url = this.UUID_to_URL(uuid);
            if (url) {
                onResolve(url);
                return;
            }

            let promise = AssetDb.inst.UUID_to_URL_async(uuid);
            if (promise) {
                promise.then(onResolve);
                return;
            }
        }
        onResolve(url);
    }

    shaderName_to_URL(shaderName: string): string {
        return this.shaderNameMap[shaderName];
    }

    shaderName_to_URL_async(shaderName: string): Promise<string> {
        console.warn(`unknown shaderName: ${shaderName}`);
        return null;
    }

    getMeta(url: string, uuid: string): any {
        let meta = this.metaMap[url];
        if (meta)
            return meta;
        else if (this.enableImageMetaFile)
            return url + ".json";
        else
            return null;
    }

    getSubAssetURL(url: string, uuid: string, subAssetName: string, subAssetExt: string): string {
        return `${Utils.replaceFileExtension(url, "")}@${subAssetName}.${subAssetExt}`;
    }
}