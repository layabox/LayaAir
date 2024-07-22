import { Browser } from "./Browser";

/**
 * @en Image binary processing class
 * @zh 图片二进制处理类
 */
export class ImgUtils {

    /**
     * @en Storage data pool
     * @zh 存储数据池
     */
    static data: any = {};
    /**
     * @en Whether to save the used data
     * @zh 是否保存使用的数据
     */
    static isSavaData: boolean = false;

    /**
     * 比较版本内容
     * @param curVersion 当前版本
     * @param needVersion 要求的版本
     * @returns 
     */
    private static compareVersion(curVersion: string, needVersion: string) {
        let curVersionArr = curVersion.split('.');
        let needVersionArr = needVersion.split('.');
        const len = Math.max(curVersionArr.length, needVersionArr.length);
        while (curVersionArr.length < len) {
            curVersionArr.push('0');
        }
        while (needVersionArr.length < len) {
            needVersionArr.push('0');
        }
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(curVersionArr[i]);
            const num2 = parseInt(needVersionArr[i]);
            if (num1 > num2) {
                return true;
            } else if (num1 < num2) {
                return false;
            }
        }
        return true;
    }

    /**
     * @en Checks if data preprocessing is supported.
     * @zh 检查是否支持数据预处理。
     */
    static get isSupport(): boolean {
        if (Browser._isMiniGame) {
            var version: string = Browser.window.wx.getSystemInfoSync().SDKVersion;
            return ImgUtils.compareVersion(version, '2.14.0');
        }
        else if (Browser.onLayaRuntime) {
            return true;
        } else if (Browser.window.Blob)
            return Browser.window.Blob ? true : false;
        return false;
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
    static arrayBufferToURL(url: string, arrayBuffer: ArrayBuffer) {
        if (!ImgUtils.isSupport) return url;
        if (ImgUtils.data[url])
            return ImgUtils.data[url];
        var newurl: string = "";
        if (Browser._isMiniGame || Browser.onLayaRuntime) {
            newurl = Browser.window.wx.createBufferURL(arrayBuffer);//是一个字符串内存地址
        } else if (Browser.window.Blob) {
            let blob = new Blob([arrayBuffer], { type: 'application/octet-binary' });
            newurl = Browser.window.URL.createObjectURL(blob);
        }
        if (ImgUtils.isSavaData)
            ImgUtils.data[url] = newurl;
        return newurl;
    }

    static _arrayBufferToURL(arrayBuffer: ArrayBuffer) {
        if (!ImgUtils.isSupport) return null;
        var newurl: string = "";
        if (Browser._isMiniGame || Browser.onLayaRuntime) {
            newurl = Browser.window.wx.createBufferURL(arrayBuffer);//是一个字符串内存地址
        } else if (Browser.window.Blob) {
            let blob = new Blob([arrayBuffer], { type: 'application/octet-binary' });
            newurl = Browser.window.URL.createObjectURL(blob);
        }
        return newurl;
    }

    /**
     * @en Destroys the binary memory data associated with a specified URL.
     * @param url The URL to destroy the binary data for.
     * @zh 销毁与指定 URL 相关联的二进制内存数据。
     * @param url 要销毁二进制数据的 URL。
     */
    static destroy(url: string) {
        if (!ImgUtils.isSupport) return;
        var newurl: string = ImgUtils.data[url];
        if (newurl) {
            if (Browser._isMiniGame || Browser.onLayaRuntime)
                Browser.window.wx.revokeBufferURL(newurl);
            else if (Browser.window.Blob)
                Browser.window.URL.revokeObjectURL(newurl);
            delete ImgUtils.data[url];
        }
    }
}