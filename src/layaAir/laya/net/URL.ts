import { LayaEnv } from "../../LayaEnv";
import { AssetDb } from "../resource/AssetDb";
import { Utils } from "../utils/Utils";

/**
 * @en The `URL` class provides URL formatting and version management.
 * - The engine automatically calls the formatURL function to format URL paths when loading resources.
 * - You can set the network base path through the basePath property.
 * - By setting the customFormat function, you can customize the way URLs are formatted.
 * @zh `URL` 类提供URL格式化和版本管理功能。
 * - 引擎加载资源时，会自动调用formatURL函数格式化URL路径。
 * - 通过basePath属性可以设置网络基础路径。
 * - 通过设置customFormat函数，可以自定义URL格式化的方式。
 */
export class URL {
    /**
     * @en URL address version mapping table. For example, {"aaa/bb.png":"edcba","aaa/bb.png":"1342a"}. By default, after formatting through formatURL, it will automatically generate an address like "aaa/bb-1342a.png".
     * @zh URL地址版本映射表。例如，{"aaa/bb.png":"edcba","aaa/bb.png":"1342a"}。默认情况下，通过formatURL格式化后，会自动生成为"aaa/bb-1342a.png"的地址。
     */
    static version: Record<string, string> = {};

    /**
     * @en Base path. If not set, it defaults to the path of the current web page. The final address will be formatted as basePath + relative URL address.
     * @zh 基础路径。如果不设置，默认为当前网页的路径。最终地址将被格式化为 basePath + 相对URL地址。
     */
    static basePath: string = "";
    /**
     * @en Extended base path mapping table. For example, {"aa/":"http://abc.com/"}, then resources with paths starting with aa/ will be mapped to http://abc.com/.
     * @zh 扩展的基础路径映射表。例如，{"aa/":"http://abc.com/"}，则把路径以aa/开头的资源映射到http://abc.com/下。
     */
    static basePaths: Record<string, string> = {};

    private _url: string;
    private _path: string;

    private static overrideFileExts: Record<string, string> = {};
    private static hasExtOverrides: boolean = false;
    private static usingSafeFileExts: boolean = false;

    private static readonly safeFileExtConversionMap: Record<string, string> = {
        "rendertexture": "rt.json",
        "videotexture": "rt.json",
        "controller": "controller.json",
        "mc": "mc.bin",
        "mcc": "mcc.json",
        "shader": "shader.json",
        "fui": "fui.json",
        "glsl": "glsl.txt",
        "skel": "skel.bin",
        "lavm": "lavm.json",
    };

    static __init__() {
        //xiaomi 没有location
        //Vivo location.protocol是""
        //微信真机 location.protocol是undefined
        if (URL.basePath == null)
            URL.basePath = (location && location.protocol != undefined && location.protocol != "") ? URL.getPath(location.protocol + "//" + location.host + location.pathname) : "";
    }

    /**
     * @en Initialize file extension overrides for mini-game.
     * @zh 初始化小游戏的文件扩展名覆盖。
     */
    static initMiniGameExtensionOverrides() {
        if (LayaEnv.isPreview)
            return;

        Object.assign(this.overrideFileExts, this.safeFileExtConversionMap);
        this.hasExtOverrides = true;
        this.usingSafeFileExts = true;
    }

    /**
     * @en Create a new `URL` instance.
     * @param url The URL to be formatted.
     * @zh 创建一个新的 `URL` 实例。
     * @param url 要格式化的URL地址。
     */
    constructor(url: string) {
        this._url = URL.formatURL(url);
        this._path = URL.getPath(url);
    }

    /**
     * @en The formatted address.
     * @zh 格式化后的地址。
     */
    get url(): string {
        return this._url;
    }

    /**
     * @en The folder path of the address (excluding the file name).
     * @zh 地址的文件夹路径（不包括文件名）。
     */
    get path(): string {
        return this._path;
    }

    /**
     * @en Custom URL formatting function. For example: customFormat = function(url:String):String{}
     * @zh 自定义URL格式化的方式。例如：customFormat = function(url:String):String{}
     */
    static customFormat: Function = function (url: string): string {
        return url;
    }

    /**
     * 指以'~/'开头的的url路径的映射。
     * 不推荐使用，应该使用basePaths。
    */
    static get rootPath() {
        return URL.basePaths["~/"];
    }

    static set rootPath(value: string) {
        URL.basePaths["~/"] = value;
    }

    /**
     * 包含normalizedURL功能，并且合并base，如果base没有提供，则使用URL.basePath或者URL.rootPath。
     * @param url 地址。
     * @param base 基础路径，如果没有，则使用URL.basePath或者URL.rootPath。
     * @return 格式化处理后的地址。
     */
    static formatURL(url: string, base?: string): string {
        if (!url)
            return base || URL.basePath || "";

        if (url.startsWith("res://")) {
            let uuid = url.substring(6);
            let url2 = AssetDb.inst.UUID_to_URL(uuid);
            if (!url2)
                return url;

            url = url2;
        }

        if (url.indexOf(":") == -1 && url.charCodeAt(0) !== 47) { //已经format过
            //自定义路径格式化
            if (URL.customFormat != null)
                url = URL.customFormat(url);

            let ver = URL.version[url];
            if (ver != null) {
                let i = url.lastIndexOf(".");
                url = url.substring(0, i) + "-" + ver + url.substring(i);
            }

                if (base == null) {
                    base = URL.basePath;
                    for (let k in URL.basePaths) {
                        if (url.startsWith(k)) {
                        if (k.charCodeAt(0) === 126)
                            url = url.substring(k.length);
                            base = URL.basePaths[k];
                            break;
                        }
                    }
                }
                url = URL.join(base, url);
        }

        return url;
    }

    /**
     * @en Process automatic conversion of file extensions.
     * @param url The address to be processed.
     * @returns The processed address.
     * @zh 处理扩展名的自动转换。
     * @param url 要处理的地址。
     * @return 处理后的地址。
     */
    static postFormatURL(url: string): string {
        if (URL.hasExtOverrides) {
            let extold = Utils.getFileExtension(url);
            let ext = URL.overrideFileExts[extold];
            if (ext != null)
                url = Utils.replaceFileExtension(url, ext);
        }

        return url;
    }

    /**
     * @en Normalize a relative path. Mainly handles cases with '.' and '..'.
     * @param url The URL to normalize.
     * @returns The normalized URL.
     * @zh 格式化相对路径。主要是处理 '.' 和 '..' 这些情况。
     * @param url 要格式化的路径。
     * @return 格式化后的路径。
     */
    static normalize(url: string): string {
        if (url.indexOf("./") == -1)
            return url;

        let parts = url.split("/");
        let len = parts.length;
        let i = 0;
        while (i < len) {
            if (parts[i] == ".") {
                parts.splice(i, 1);
                len--;
                continue;
            }
            else if (parts[i] == '..') {
                let index: number = i - 1;
                if (index >= 0 && parts[index] !== '..') {
                    parts.splice(index, 2);
                    len -= 2;
                    i--;
                    continue;
                }
            }

            i++;
        }
        parts.length = len;
        return parts.join('/');
    }

    /**
     * @en Get the resource URL by UUID.
     * @param url The input URL or UUID.
     * @returns The resource URL.
     * @zh 通过 UUID 获取资源 URL。
     * @param url 输入的 URL 或 UUID。
     * @return 资源 URL。
     */
    static getResURLByUUID(url: string): string {
        if (Utils.isUUID(url))
            return "res://" + url;
        else
            return url;
    }

    /**
     * @en Combine and normalize relative paths.
     * @param base The base path.
     * @param path The path to join.
     * @returns The combined and normalized path.
     * @zh 组合相对路径并格式化。
     * @param base 基础路径。
     * @param path 要合并的路径。
     * @return 合并并格式化后的路径。
     */
    static join(base: string, path: string): string {
        if (!path) return "";

        //如果是全路径，直接返回，提高性能
        if (path.indexOf(":") > 0)
            return path;

        if (base) {
            let char1 = path.charCodeAt(0);
            if (char1 !== 126 && char1 !== 47) { // ~或者 /
                if (base.charCodeAt(base.length - 1) !== 47)
                    path = base + "/" + path;
                else
                    path = base + path;
            }
        }

        return URL.normalize(path);
    }

    /**
     * @en Get the folder path of the specified URL (excluding the file name). Note: the returned path has a trailing slash (/).
     * @param url The URL address.
     * @returns The folder path with a trailing slash (/).
     * @zh 获取指定 URL 的文件夹路径（不包括文件名）。注意：末尾有斜杠（/）。
     * @param url 地址。
     * @return 文件夹路径。
     */
    static getPath(url: string): string {
        var ofs: number = url.lastIndexOf('/');
        return ofs > 0 ? url.substring(0, ofs + 1) : "";
    }

    /**
     * @en Get the file name of the specified URL.
     * @param url The URL address.
     * @returns The file name.
     * @zh 获取指定 URL 的文件名。
     * @param url 地址。
     * @return 文件名。
     */
    static getFileName(url: string): string {
        var ofs: number = url.lastIndexOf('/');
        return ofs > 0 ? url.substring(ofs + 1) : url;
    }

    /**
     * @en Get the version string of the URL.
     * @param url The URL to check.
     * @returns The version string or null if not found.
     * @zh 获取 URL 版本字符。
     * @param url 要检查的 URL。
     * @return 版本字符串或 null（如果未找到）。
     */
    static getURLVerion(url: string): string {
        var index: number = url.indexOf("?");
        return index >= 0 ? url.substring(index) : null;
    }

    /**
     * @en Override the file extension for downloading.
     * @param originalExts The original extensions. For example, ["scene"].
     * @param targetExt The target extension to convert to. For example, "json".
     * @zh 下载时，转换 URL 的扩展名。
     * @param originalExts 原始扩展名。例如["scene"]。
     * @param targetExt 要转换为的扩展名。例如"json"。
     */
    static overrideExtension(originalExts: Array<string>, targetExt: string, miniGameOnly?: boolean) {
        if (miniGameOnly) {
            if (!URL.usingSafeFileExts) {
                for (let ext of originalExts)
                    URL.safeFileExtConversionMap[ext] = targetExt;
                return;
            }
        }

        for (let ext of originalExts)
            URL.overrideFileExts[ext] = targetExt;
        URL.hasExtOverrides = true;
    }
}