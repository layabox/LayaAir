import { ILaya } from "../../ILaya";
import { Utils } from "../utils/Utils";

export const AssetDb_URLPrefix = "res://";
const AssetDb_URLPrefix_len = AssetDb_URLPrefix.length;
let isUUID = false;

/**
 * <p><code>URL</code> 提供URL格式化，URL版本管理的类。</p>
 * <p>引擎加载资源的时候，会自动调用formatURL函数格式化URL路径</p>
 * <p>通过basePath属性可以设置网络基础路径</p>
 * <p>通过设置customFormat函数，可以自定义URL格式化的方式</p>
 * <p>除了默认的通过增加后缀的格式化外，通过VersionManager类，可以开启IDE提供的，基于目录的管理方式来替代 "?v=" 的管理方式</p>
 * @see laya.net.VersionManager
 */
export class URL {
    /**URL地址版本映射表，比如{"aaa/bb.png":99,"aaa/bb.png":12}，默认情况下，通过formatURL格式化后，会自动生成为"aaa/bb.png?v=99"的一个地址*/
    static version: any = {};
    static uuidMap: Record<string, string> = {};

    /**@private */
    private _url: string;
    /**@private */
    private _path: string;
    /**@private */

    private static overrideFileExts: Record<string, string> = {};
    private static hasExtOverrides: boolean;

    /**创建一个新的 <code>URL</code> 实例。*/
    constructor(url: string) {
        this._url = URL.formatURL(url);
        this._path = URL.getPath(url);
    }

    /**格式化后的地址。*/
    get url(): string {
        return this._url;
    }

    /**地址的文件夹路径（不包括文件名）。*/
    get path(): string {
        return this._path;
    }

    /**@internal 基础路径。如果不设置，默认为当前网页的路径。最终地址将被格式化为 basePath+相对URL地址，*/
    static _basePath: string = "";
    /**root路径。只针对'~'类型的url路径有效*/
    static rootPath: string = "";

    static set basePath(value: string) {
        URL._basePath = ILaya.Laya._getUrlPath();//还原BaseURL为Index目录
        URL._basePath = URL.formatURL(value);
    }

    /**基础路径。如果不设置，默认为当前网页的路径。最终地址将被格式化为 basePath+相对URL地址，*/
    static get basePath(): string {
        return URL._basePath;
    }

    /** 自定义URL格式化的方式。例如： customFormat = function(url:String):String{} */
    static customFormat: Function = function (url: string): string {
        var ver: string = URL.version[url];
        if (!((<any>window)).conch && ver) {
            if (url.indexOf("?") != -1)
                url += "&v=" + ver;
            else
                url += "?v=" + ver;
        }
        return url;
    }

    /**
     * 标准化URL，转换res://uuid这样的格式为路径。
     * @param url
     */
    static normalizedURL(url: string) {
        if (url == null)
            return null;

        if (url.startsWith(AssetDb_URLPrefix)) {
            isUUID = true;
            let uuid = url.substring(AssetDb_URLPrefix_len);
            let url2 = this.uuidMap[uuid];
            if (!url2)
                return url;

            url = url2;
        }

        return url;
    }

    /**
     * 包含normalizedURL功能，并且合并base，如果base没有提供，则使用URL.basePath或者URL.rootPath。
     * @param url 地址。
     * @param base 基础路径，如果没有，则使用URL.basePath或者URL.rootPath。
     * @return 格式化处理后的地址。
     */
    static formatURL(url: string, base?: string): string {
        if (!url) return "null path";

        isUUID = false;
        url = URL.normalizedURL(url);

        //如果是全路径，直接返回，提高性能
        if (url.indexOf(":") > 0)
            return url;

        if (!isUUID) {
            let char1 = url.charCodeAt(0);
            if (char1 === 126) // ~
                url = joinPath(URL.rootPath, url.substring(1));
            else if (char1 !== 47) // /
                url = joinPath(base != null ? base : URL._basePath, url);
        }

        return url;
    }

    /**
     * 处理扩展名的自动转换，调用URL.customFormat(通常作用是添加上版本号）。
     * @param url 地址。
     * @return 格式化处理后的地址。
     */
    static postFormatURL(url: string): string {
        if (URL.hasExtOverrides) {
            let extold = Utils.getFileExtension(url);
            let ext = URL.overrideFileExts[extold];
            if (ext != null)
                url = url.substring(0, url.length - extold.length) + ext;
        }

        //自定义路径格式化
        if (URL.customFormat != null)
            url = URL.customFormat(url);

        return url;
    }

    /**
    * 格式化相对路径。
    * @param base
    * @param path
    */
    static join(base: string, path: string): string {
        if (!path) return "";

        isUUID = false;
        path = URL.normalizedURL(path);

        //如果是全路径，直接返回，提高性能
        if (path.indexOf(":") > 0)
            return path;

        if (!isUUID && base) {
            let char1 = path.charCodeAt(0);
            if (char1 !== 126) // ~
                path = joinPath(base, path);
        }

        return path;
    }

    /**
     * 获取指定 URL 的文件夹路径（不包括文件名）。
     * <p><b>注意：</b>末尾有斜杠（/）。</p>
     * @param url url地址。
     * @return 返回文件夹路径。
     */
    static getPath(url: string): string {
        var ofs: number = url.lastIndexOf('/');
        return ofs > 0 ? url.substring(0, ofs + 1) : "";
    }

    /**
     * 获取指定 URL 的文件名。
     * @param url 地址。
     * @return 返回文件名。
     */
    static getFileName(url: string): string {
        var ofs: number = url.lastIndexOf('/');
        return ofs > 0 ? url.substring(ofs + 1) : url;
    }

    /**
     * 获取URL版本字符。
     * @param url
     * @return
     */
    static getURLVerion(url: string): string {
        var index: number = url.indexOf("?");
        return index >= 0 ? url.substring(index) : null;
    }

    /**
     * 下载时，转换URL的扩展名。
     * @originalExts 原始扩展名。例如["scene"]。
     * @targetExt 要转换为的扩展名。例如"json"。
     */
    static overrideExtension(originalExts: Array<string>, targetExt: string) {
        for (let ext of originalExts)
            this.overrideFileExts[ext] = targetExt;
        this.hasExtOverrides = true;
    }

    /*
     * 兼容微信不支持加载scene后缀场景，设置为true，则会把scene加载替换为json
    */
    static set exportSceneToJson(value: boolean) {
        if (value)
            URL.overrideExtension(["scene3d", "scene", "taa", "prefab"], "json");
    }
}

function joinPath(base: string, value: string): string {
    let path: string;

    if (value.startsWith("./"))
        value = value.substring(2);

    if (base != null)
        path = base + value;

    let char1 = value.charCodeAt(0);
    if (char1 === 46) { // .
        let parts: any[] = path.split("/");
        for (let i: number = 0, len: number = parts.length; i < len; i++) {
            if (parts[i] == '..') {
                let index: number = i - 1;
                if (index > 0 && parts[index] !== '..') {
                    parts.splice(index, 2);
                    i -= 2;
                }
            }
        }
        path = parts.join('/');
    }
    return path;
}