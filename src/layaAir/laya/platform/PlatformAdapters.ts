import { Mutable } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { type BrowserAdapter } from "./BrowserAdapter";
import { type StorageAdapter } from "./StorageAdapter";
import { type MediaAdapter } from "./MediaAdapter";
import { type TextInputAdapter } from "./TextInputAdapter";
import { type WebDeviceAdapter } from "../device/WebDeviceAdapter";
import { type FontAdapter } from "./FontAdapter";
import { type FileSystemAdapter } from "./FileSystemAdapter";

const PlatformAdapterNames = ["browser", "fs", "storage", "font", "textInput", "media", "device"] as const;
export interface IPlatformGlobalType { [key: string]: any };

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
     * @en The global object built into the platform. For example, wx in WeChat.
     * @zh 平台内置的全局对象。例如微信中的wx。
     */
    static g: IPlatformGlobalType = null;

    private static _classes: Record<string, any> = {};

    /** @internal */
    static __init__(): void {
        for (let key of PlatformAdapterNames) {
            let cls = PAL._classes[key];
            if (cls)
                (<Mutable<typeof PAL>>PAL)[key] = new cls();
        }
    }

    /**
     * @en Register a platform adapter.
     * @param name The name of the adapter.
     * @param cls The class of the adapter.
     * @zh 注册一个平台适配器。
     * @param name 适配器的名称。
     * @param cls 适配器的类。
     */
    static register(name: typeof PlatformAdapterNames[number], cls: any) {
        if (LayaEnv.isPlaying)
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

            console.warn(`${name} is not supported in this platform.`);
        }
    }

    /**
     * @en Check if the specified API is available in the global object.
     * @param name The name of the API to check. 
     * @param obj The object to check against, defaults to the global object. 
     * @returns `true` if the API is available, otherwise `false`.
     * @zh 检查指定的API是否在全局对象中可用。
     * @param name 要检查的API名称。
     * @param obj 要检查的对象，默认为全局对象。
     * @returns 如果API可用则返回`true`，否则返回`false`
     */
    static hasAPI(name: string): boolean;
    static hasAPI(obj: any, name: string): boolean;
    static hasAPI(arg0: any, arg1?: string): boolean {
        if (arg1)
            return Object.getOwnPropertyDescriptor(arg0 || PAL.g, arg1) != null;
        else
            return Object.getOwnPropertyDescriptor(PAL.g, arg0) != null;
    }
}

const warned: Set<string> = new Set();