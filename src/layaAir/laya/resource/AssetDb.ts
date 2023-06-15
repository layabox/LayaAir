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
        return Promise.resolve(null);
    }

    /**
     * Url获得uuid值
     * @param url 
     * @returns 
     */
    URL_to_UUID_async(url: string): Promise<string> {
        return Promise.resolve(null);
    }

    /**
     * 获取真实的Url
     * @param url 
     * @param onResolve 
     * @returns 
     */
    resolveURL(url: string, onResolve?: (url: string) => void): Promise<string> {
        if (url.startsWith("res://")) {
            let uuid = url.substring(6);
            return AssetDb.inst.UUID_to_URL_async(uuid).then(url => {
                if (onResolve)
                    onResolve(url);
                return url;
            });
        }
        else {
            if (onResolve)
                onResolve(url);
            return Promise.resolve(url);
        }
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
        return Promise.resolve(null);
    }

    /**
     * 获得元数据
     * @param url 
     * @param uuid 
     * @returns 
     */
    getMeta(url: string, uuid: string): Promise<any> {
        return Promise.resolve(null);
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
        if (subAssetName)
            return `${Utils.replaceFileExtension(url, "")}@${subAssetName}.${subAssetExt}`;
        else
            return url;
    }
}