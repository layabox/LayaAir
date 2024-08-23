import { LayaEnv } from "../../LayaEnv";
import { AssetDb } from "../resource/AssetDb";
import { Utils } from "../utils/Utils";

/**
 * <p><code>URL</code> 提供URL格式化，URL版本管理的类。</p>
 * <p>引擎加载资源的时候，会自动调用formatURL函数格式化URL路径</p>
 * <p>通过basePath属性可以设置网络基础路径</p>
 * <p>通过设置customFormat函数，可以自定义URL格式化的方式</p>
 */
export class URL {
    /**URL地址版本映射表，比如{"aaa/bb.png":"edcba","aaa/bb.png":"1342a"}，默认情况下，通过formatURL格式化后，会自动生成为"aaa/bb-1342a.png"的一个地址*/
    static version: Record<string, string> = {};

    /**基础路径。如果不设置，默认为当前网页的路径。最终地址将被格式化为 basePath+相对URL地址，*/
    static basePath: string = "";
    /**扩展的基础路径映射表，比如{"aa/":"http://abc.com/"},则把路径以aa/开头的资源映射到http://abc.com/下*/
    static basePaths: Record<string, string> = {};

    /**root路径。只针对'~'类型的url路径有效*/
    static rootPath: string = "";

    /**@private */
    private _url: string;
    /**@private */
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
        URL.rootPath = URL.basePath = (location && location.protocol != undefined && location.protocol != "") ? URL.getPath(location.protocol + "//" + location.host + location.pathname) : "";
    }

    static initMiniGameExtensionOverrides() {
        if (LayaEnv.isPreview)
            return;

        Object.assign(this.overrideFileExts, this.safeFileExtConversionMap);
        this.hasExtOverrides = true;
        this.usingSafeFileExts = true;
    }

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

    /** 自定义URL格式化的方式。例如： customFormat = function(url:String):String{} */
    static customFormat: Function = function (url: string): string {
        return url;
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

        let char1 = url.charCodeAt(0);
        if (url.indexOf(":") == -1 && char1 !== 47) { //已经format过
            //自定义路径格式化
            if (URL.customFormat != null)
                url = URL.customFormat(url);

            let ver = URL.version[url];
            if (ver != null) {
                let i = url.lastIndexOf(".");
                url = url.substring(0, i) + "-" + ver + url.substring(i);
            }

            if (char1 === 126) // ~
                url = URL.join(URL.rootPath, url.substring(2));
            else {
                if (base == null) {
                    base = URL.basePath;
                    for (let k in URL.basePaths) {
                        if (url.startsWith(k)) {
                            base = URL.basePaths[k];
                            break;
                        }
                    }
                }
                url = URL.join(base, url);
            }
        }

        return url;
    }

    /**
     * 处理扩展名的自动转换
     * @param url 地址。
     * @return 格式化处理后的地址。
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
     * 格式化相对路径。主要是处理.和..这些情况。
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

    static getResURLByUUID(url: string): string {
        if (Utils.isUUID(url))
            return "res://" + url;
        else
            return url;
    }

    /**
    * 组合相对路径并格式化
    * @param base
    * @param path
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