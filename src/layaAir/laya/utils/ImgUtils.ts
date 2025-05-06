import { PAL } from "../platform/PlatformAdapters";

/**
 * @en Image binary processing class
 * @zh 图片二进制处理类
 */
export class ImgUtils {

    /**
     * @en Storage data pool
     * @zh 存储数据池
     */
    static readonly data: Record<string, string> = {};
    /**
     * @en Whether to save the used data
     * @zh 是否保存使用的数据
     */
    static isSavaData: boolean = false;

    /**
     * @en Checks if data preprocessing is supported.
     * @zh 检查是否支持数据预处理。
     */
    static get isSupport(): boolean {
        return PAL.browser.supportArrayBufferURL;
    }

    /**
     * @en Gets a URL object from an ArrayBuffer.
     * @param url The base URL string.
     * @param arrayBuffer The ArrayBuffer to convert.
     * @returns A new URL string representing the binary data.
     * @zh 从 ArrayBuffer 获取 URL 对象。
     * @param url 基础 URL 字符串。
     * @param arrayBuffer 要转换的 ArrayBuffer。
     * @returns 表示二进制数据的新 URL 字符串。
     */
    static arrayBufferToURL(url: string, arrayBuffer: ArrayBuffer): string {
        if (!ImgUtils.isSupport) return url;
        if (ImgUtils.data[url])
            return ImgUtils.data[url];

        let newurl = PAL.browser.createBufferURL(arrayBuffer);

        if (ImgUtils.isSavaData)
            ImgUtils.data[url] = newurl;

        return newurl;
    }

    static _arrayBufferToURL(arrayBuffer: ArrayBuffer): string {
        if (ImgUtils.isSupport)
            return PAL.browser.createBufferURL(arrayBuffer);
        else
            return null;
    }

    /**
     * @en Destroys the binary memory data associated with a specified URL.
     * @param url The URL to destroy the binary data for.
     * @zh 销毁与指定 URL 相关联的二进制内存数据。
     * @param url 要销毁二进制数据的 URL。
     */
    static destroy(url: string) {
        if (!ImgUtils.isSupport) return;
        let newurl: string = ImgUtils.data[url];
        if (newurl) {
            PAL.browser.revokeBufferURL(newurl);
            delete ImgUtils.data[url];
        }
    }
}