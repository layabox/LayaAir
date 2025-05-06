import { Mutable } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
import { type BrowserAdapter } from "./BrowserAdapter";
import { type LocalStorageAdapter } from "./LocalStorageAdapter";
import { type MediaAdapter } from "./MediaAdapter";
import { type TextInputAdapter } from "./TextInputAdapter";
import { type DeviceAdapter } from "../device/DeviceAdapter";
import { type FontAdapter } from "./FontAdapter";
import { type FileSystemAdapter } from "./FileSystemAdapter";

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
    static readonly localStorage: LocalStorageAdapter;

    /**
     * @en The Device Adapter.
     * @zh 设备适配器。
     */
    static readonly device: DeviceAdapter;

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
    static global: any;

    /**
     * @internal
     */
    static __init__(): Promise<void> {
        return Promise.resolve().then(() => {
            return PAL.preIntialize?.();
        }).then(() => {
            let p = <Mutable<typeof PAL>>PAL;
            p.browser = PAL.createAdapter("Browser");
            p.fs = PAL.createAdapter("FileSystem");
            p.localStorage = PAL.createAdapter("LocalStorage");
            p.font = PAL.createAdapter("Font");
            p.textInput = PAL.createAdapter("TextInput");
            p.media = PAL.createAdapter("Media");
            p.device = PAL.createAdapter("Device");
        }).then(() => {
            return PAL.postInitialize?.();
        });
    }

    private static createAdapter(name: string) {
        let cls = ClassUtils.getClass("PAL." + name);
        if (cls)
            return new cls();
        else
            return null;
    }
}