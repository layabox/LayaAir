import { Utils } from "../utils/Utils";
/**
 * 此类用来描述资源
 */
export class AssetDb {
    /**
     * 默认资源实例
     */
    static inst: AssetDb = new AssetDb();
    
    /**
     * uuid 数据
     */
    uuidMap: Record<string, string> = {};
    
    /**
     * shaderName 数据
     */
    shaderNameMap: Record<string, string> = {};
    
    /**
     * 元资源 数据
     */
    metaMap: Record<string, any> = {};

    /** 是否下载图片的描述信息 */
    enableImageMetaFile: boolean = false;

    /**
     * uuid获得url
     * @param uuid uuid
     * @returns 
     */
    UUID_to_URL(uuid: string): string {
        return this.uuidMap[uuid];
    }

    /**
     * 异步uuid获得Url
     * @param uuid 
     * @returns 
     */
    UUID_to_URL_async(uuid: string): Promise<string> {
        return null;
    }

    /**
     * Url获得uuid值
     * @param url 
     * @returns 
     */
    URL_to_UUID_async(url: string): Promise<string> {
        return null;
    }

    /**
     * TODO
     * @param url 
     * @param onResolve 
     * @returns 
     */
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

    /**
     * 查找shadername的地址
     * @param shaderName 
     * @returns 
     */
    shaderName_to_URL(shaderName: string): string {
        return this.shaderNameMap[shaderName];
    }

    shaderName_to_URL_async(shaderName: string): Promise<string> {
        console.warn(`unknown shaderName: ${shaderName}`);
        return null;
    }

    /**
     * 获得元数据
     * @param url 
     * @param uuid 
     * @returns 
     */
    getMeta(url: string, uuid: string): any {
        let meta = this.metaMap[url];
        if (meta)
            return meta;
        else if (this.enableImageMetaFile)
            return url + ".json";
        else
            return null;
    }

    /**
     * 获得子资源路径
     * @param url 
     * @param uuid 
     * @param subAssetName 
     * @param subAssetExt 
     * @returns 
     */
    getSubAssetURL(url: string, uuid: string, subAssetName: string, subAssetExt: string): string {
        return `${Utils.replaceFileExtension(url, "")}@${subAssetName}.${subAssetExt}`;
    }
}