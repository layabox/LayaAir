import { Utils } from "../utils/Utils";
/**
 * @en This class is used to describe resources.
 * @zh 此类用来描述资源
 */
export class AssetDb {
    /**
     * @en Default resource instance.
     * @zh 默认资源实例。
     */
    static inst: AssetDb = new AssetDb();

    /**
     * @en UUID data.
     * @zh UUID 数据。
     */
    uuidMap: Record<string, string> = {};

    /**
     * @en Shader name data.
     * @zh 着色器名称数据。
     */
    shaderNameMap: Record<string, string> = {};

    /**
     * @en Metadata for resources.
     * @zh 资源的元数据。
     */
    metaMap: Record<string, any> = {};

    /**
     * @en Gets the URL from the UUID.
     * @param uuid The UUID.
     * @returns The URL corresponding to the UUID.
     * @zh 根据 UUID 获取 URL。
     * @param uuid UUID
     * @returns UUID 对应的 URL
     */
    UUID_to_URL(uuid: string): string {
        return this.uuidMap[uuid];
    }

    /**
     * @en Asynchronously gets the URL from the UUID.
     * @param uuid The UUID.
     * @returns A promise.
     * @zh 异步根据 uuid 获取 URL。
     * @param uuid UUID
     * @returns 一个promise。
     */
    UUID_to_URL_async(uuid: string): Promise<string> {
        return Promise.resolve(null);
    }

    /**
     * @en Asynchronously gets the UUID from the URL.
     * @param url The URL.
     * @returns A promise.
     * @zh 异步根据 URL 获取 UUID。
     * @param url URL
     * @returns 一个 promise。
     */
    URL_to_UUID_async(url: string): Promise<string> {
        return Promise.resolve(null);
    }

    /**
     * @en Resolves the real URL from a given URL.
     * @param url The original URL.
     * @param onResolve Optional callback when the URL is resolved.
     * @returns A promise that resolves to the real URL.
     * @zh 根据给定的 URL 解析真实的 URL。
     * @param url 原始 URL。
     * @param onResolve 可选的回调函数，当 URL 被解析时调用。
     * @returns 一个promise，解析为真实的 URL。
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
     * @en Finds the URL for a shader name.
     * @param shaderName The shader name.
     * @returns The URL corresponding to the shader name.
     * @zh 根据着色器名称查找 URL。
     * @param shaderName 着色器名称。
     * @returns 着色器名称对应的 URL。
     */
    shaderName_to_URL(shaderName: string): string {
        return this.shaderNameMap[shaderName];
    }

    /**
     * @en Asynchronously finds the URL for a shader name.
     * @param shaderName The shader name.
     * @returns A promise.
     * @zh 异步根据着色器名称查找 URL。
     * @param shaderName 着色器名称。
     * @returns 一个 promise。
     */
    shaderName_to_URL_async(shaderName: string): Promise<string> {
        return Promise.resolve(null);
    }

    /**
     * @en Gets the metadata for a resource.
     * @param url The resource URL.
     * @param uuid The resource UUID.
     * @returns A promise.
     * @zh 获取资源的元数据。
     * @param url 资源的 URL。
     * @param uuid 资源的 UUID。
     * @returns 一个 promise。
     */
    getMeta(url: string, uuid: string): Promise<any> {
        return Promise.resolve(null);
    }

    /**
     * @en Gets the URL for a sub-asset.
     * @param url The base resource URL.
     * @param uuid The UUID of the base resource.
     * @param subAssetName The name of the sub-asset.
     * @param subAssetExt The file extension of the sub-asset.
     * @returns The URL for the sub-asset.
     * @zh 获取子资源的 URL。
     * @param url 基础资源的 URL。
     * @param uuid 基础资源的 UUID。
     * @param subAssetName 子资源的名称。
     * @param subAssetExt 子资源的文件扩展名。
     * @returns 子资源的 URL。
     */
    getSubAssetURL(url: string, uuid: string, subAssetName: string, subAssetExt: string): string {
        if (subAssetName)
            return `${Utils.replaceFileExtension(url, "")}@${subAssetName}.${subAssetExt}`;
        else
            return url;
    }
}