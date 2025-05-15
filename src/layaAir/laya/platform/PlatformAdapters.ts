import { Mutable } from "../../ILaya";
import { type BrowserAdapter } from "./BrowserAdapter";
import { type StorageAdapter } from "./StorageAdapter";
import { type MediaAdapter } from "./MediaAdapter";
import { type TextInputAdapter } from "./TextInputAdapter";
import { type WebDeviceAdapter } from "../device/WebDeviceAdapter";
import { type FontAdapter } from "./FontAdapter";
import { type FileSystemAdapter } from "./FileSystemAdapter";
import { Browser } from "../utils/Browser";

const AdapterNames = ["browser", "fs", "storage", "font", "textInput", "media", "device"] as const;

/**
 * @en Platform Adapter Libraries.
 * @zh 平台适配器库。
 */
export class PAL {
    /**
     * @en The Browser Adapter.
     * @zh 浏览器适配器。
     */
    static readonly browser: BrowserAdapter;

    /**
     * @en The TextInput Adapter.
     * @zh 文本输入适配器。
     */
    static readonly textInput: TextInputAdapter;

    /**
     * @en The Media Adapter.
     * @zh 媒体适配器。
     */
    static readonly media: MediaAdapter;

    /**
     * @en The LocalStorage Adapter.
     * @zh 本地存储适配器。
     */
    static readonly storage: StorageAdapter;

    /**
     * @en The Device Adapter.
     * @zh 设备适配器。
     */
    static readonly device: WebDeviceAdapter;

    /**
     * @en The Font Adapter.
     * @zh 字体适配器。
     */
    static readonly font: FontAdapter;

    /**
     * @en The FileSystem Adapter.
     * @zh 文件系统适配器。
     */
    static readonly fs: FileSystemAdapter;

    /**
     * @en Pre-initialization function, called before the platform adapter is initialized.
     * @zh 预初始化函数，在平台适配器初始化之前调用。
     */
    static preIntialize: () => void;

    /**
     * @en Post-initialization function, called after the platform adapter is initialized.
     * @zh 后初始化函数，在平台适配器初始化之后调用。
     */
    static postInitialize: () => void;

    /**
     * @en The global object built into the platform. For example, wx in WeChat.
     * @zh 平台内置的全局对象。例如微信中的wx。
     */
    static global: any = null;

    private static _classes: Record<string, any> = {};

    /**
     * @internal
     */
    static __init__(): Promise<void> {
        if (!console.time) { //有些平台，例如taobao没有这个
            console.time = function (name: string) {
            };
            console.timeEnd = function (name: string) {
                console.log(name);
            };
        }

        return Promise.resolve().then(() => {
            return PAL.preIntialize?.();
        }).then(() => {
            for (let key of AdapterNames) {
                let cls = PAL._classes[key];
                if (cls)
                    (<Mutable<typeof PAL>>PAL)[key] = new cls();
            }
        }).then(() => {
            return PAL.postInitialize?.();
        });
    }

    /**
     * @en Register a platform adapter.
     * @param name The name of the adapter.
     * @param cls The class of the adapter.
     * @zh 注册一个平台适配器。
     * @param name 适配器的名称。
     * @param cls 适配器的类。
     */
    static register(name: typeof AdapterNames[number], cls: any) {
        PAL._classes[name] = cls;
    }

    /**
     * @en Print a warning message if the specified feature is not supported on the current platform.
     * @param name The name of the feature.
     * @zh 打印一条警告消息，说明当前平台不支持指定的功能。
     * @param name 功能的名称。
     */
    static warnIncompatibility(name: string) {
        if (!warned.has(name)) {
            warned.add(name);

            console.warn(`${name} is not supported in ${Browser.platformName}.`);
        }
    }

    /**
     * @en The error return information format is different on each platform. Here is a common way to get the error message.
     * @param err The error object.
     * @return The error message.
     * @zh 在各个平台上，错误的返回信息格式不一样，这里提供一个通用的方式获取错误信息。
     * @param err 错误对象。
     * @return 错误信息。
     */
    static getErrorMsg(err: any): string {
        if (err != null && typeof err === "object") {
            let str: any;
            for (let k in errorFields) {
                str = err[errorFields[k]];
                if (str != null)
                    return parseError(str);
            }
        }
        return parseError(err);
    }
}

function parseError(err: any): string {
    if (typeof (err) === "number")
        return `error code=${err}`;
    else if (typeof (err) !== "string")
        return "error! " + err;
    else
        return err;
}

const errorFields = ["errMsg", "errorMessage", "message", "reason", "error", "errCode", "statusCode"];

const warned: Set<string> = new Set();