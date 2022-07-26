import { Browser } from "./Browser";

/**
* 图片二进制处理类
* @ author:xs
* @ data: 2021-11-03 10:54
*/
export class ImgUtils {

    /**存储数据池*/
    static data: any = {};
    /**是否保存使用的数据*/
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
     * 是否支持数据预处理
     */
    static get isSupport(): boolean {
        if (Browser.onMiniGame) {
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
     * 通过二进制获取URL对象
     * @param url 
     * @param arrayBuffer 
     * @returns 
     */
    static arrayBufferToURL(url: string, arrayBuffer: ArrayBuffer) {
        if (!ImgUtils.isSupport) return null;
        if (ImgUtils.data[url])
            return ImgUtils.data[url];
        var newurl: string = "";
        if (Browser.onMiniGame || Browser.onLayaRuntime) {
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
        if (Browser.onMiniGame || Browser.onLayaRuntime) {
            newurl = Browser.window.wx.createBufferURL(arrayBuffer);//是一个字符串内存地址
        } else if (Browser.window.Blob) {
            let blob = new Blob([arrayBuffer], { type: 'application/octet-binary' });
            newurl = Browser.window.URL.createObjectURL(blob);
        }
        return newurl;
    }

    /**
     * 销毁指定URL的二进制内存数据
     * @param url 
     */
    static destroy(url: string) {
        if (!ImgUtils.isSupport) return;
        var newurl: string = ImgUtils.data[url];
        if (newurl) {
            if (Browser.onMiniGame || Browser.onLayaRuntime)
                Browser.window.wx.revokeBufferURL(newurl);
            else if (Browser.window.Blob)
                Browser.window.URL.revokeObjectURL(newurl);
            delete ImgUtils.data[url];
        }
    }
}