import { Resource } from "../resource/Resource";
import { i18n, TFunction } from "i18next";
import { Utils } from "../utils/Utils";

export type I18nTextInfo = { sid?: string, key?: string, text: string };
let _tmpInfo: I18nTextInfo = { text: "" };

function myT(resources: any, name: string, defaultValue?: string | Record<string, any>, options?: Record<string, any>): string {
    if (typeof (defaultValue) === "object") {
        options = defaultValue;
        defaultValue = "";
    }

    let ent = resources[name];
    if (!ent)
        return defaultValue;

    if (options)
        return Utils.parseTemplate(ent, options);
    else
        return ent;
}

class SimpleProvider {
    language: string;
    _content: Record<string, any>;
    _t: Function;

    constructor() {
        this.language = window?.navigator?.language || "en";
        this._content = {};
        this._t = myT.bind(null, {});
    }

    t(name: string, defaultValue?: string | Record<string, any>, options?: Record<string, any>): string {
        return this._t(name, defaultValue, options);
    }

    addResourceBundle(lng: string, ns: string, resources: any, deep: boolean, overwrite: boolean) {
        let col = this._content[lng];
        if (!col)
            col = this._content[lng] = {};
        let func = myT.bind(null, resources);
        if (lng === this.language)
            this._t = func;
        col[ns] = { resources, t: func };
    }

    removeResourceBundle(lng: string, ns: string) {
        let col = this._content[lng];
        if (col)
            delete col[ns];
    }

    getFixedT(lng: string, ns: string) {
        let col = this._content[lng]?.[ns];
        if (col)
            return col.t;
        else
            return this._t;
    }

    isInitialized = true;
}

/**
 * @en Translations is a class that provides internationalization (i18n) support for applications.
 * @zh Translations 是一个为应用程序提供国际化 (i18n) 支持的类。
 */
export class Translations extends Resource {
    private _id2: string;
    private _t: TFunction;
    private _lngs: Array<string>;
    private _fallbackLng: string;

    /**
     * @zh 获取或设置当前的国际化提供者。默认是一个简单的实现，如果需要高级功能，可以安装i18next，并设置到此属性。
     * @en Gets or sets the current i18n provider. The default is a simple implementation. If you need advanced features, you can install i18next and set it to this property.
     * @example
     * ```typescript
     * import i18next from "i18next";
     * 
     * await i18next.init({...});
     * 
     * Laya.Translations.provider = i18next;
     * ```
     */
    static provider: i18n = <any>new SimpleProvider();

    /** @internal */
    static _allInsts: Map<string, Translations> = new Map();

    /**
     * @en Gets the Translations instance by its ID.
     * @param id The ID of the Translations instance.
     * @returns The Translations instance associated with the given ID, or null if not found.
     * @zh 通过 ID 获取 Translations 实例。
     * @param id The ID of the Translations instance.
     * @returns 与给定 ID 关联的 Translations 实例，如果未找到则返回 null。
     */
    static getById(id: string): Translations | null {
        return Translations._allInsts.get(id) || null;
    }

    /**
     * @en Creates a new Translations instance with the specified ID and optional fallback language.
     * @param id The ID for the new Translations instance. 
     * @param fallbackLng The fallback language to use if the specified language is not available. 
     * @returns A new Translations instance.
     * @zh 创建一个新的 Translations 实例，指定 ID 和可选的回退语言。
     * @param id 新 Translations 实例的 ID。
     * @param fallbackLng 如果指定的语言不可用，则使用的回退语言。
     * @returns 一个新的 Translations 实例。
     */
    static create(id: string, fallbackLng?: string): Translations {
        return new Translations(id, fallbackLng);
    }

    /**
     * @en Translates the given text.
     * @param text The text to translate, which can be in the format "i18n:sid:key|text" or "i18n:key|text". 
     * @param options Optional parameters for translation, such as variables to replace in the text.
     * @returns The translated text.
     * @zh 翻译给定的文本。
     * @param text 要翻译的文本，可以是 "i18n:sid:key|text" 或 "i18n:key|text" 格式。
     * @param options 可选的翻译参数，例如要替换文本中的变量。 
     * @returns 翻译后的文本。
     */
    static translate(text: string, options?: Record<string, any>): string {
        Translations.decodeI18nText(text, _tmpInfo);
        let i18n: { t: (name: string, arg0: any, arg1?: any) => any };
        if (_tmpInfo.sid)
            i18n = Translations.getById(_tmpInfo.sid);
        else if (_tmpInfo.key)
            i18n = Translations.provider;
        if (i18n)
            text = i18n.t(_tmpInfo.key, _tmpInfo.text, options ?? undefined);

        return text;
    }

    /**
     * @en Decodes an i18n text string into its components.
     * @param text The i18n text string to decode, which should be in the format "i18n:sid:key|text" or "i18n:key|text". 
     * @param out Optional output object to store the decoded information. If not provided, a new object will be created. 
     * @returns An object containing the decoded information, with properties `sid`, `key`, and `text`.
     * @zh 将 i18n 文本字符串解码为其组件。
     * @param text 要解码的 i18n 文本字符串，应该是 "i18n:sid:key|text" 或 "i18n:key|text" 格式。
     * @param out 可选的输出对象，用于存储解码的信息。如果未提供，将创建一个新对象。
     * @returns 包含解码信息的对象，具有 `sid`、`key` 和 `text` 属性。 
     */
    static decodeI18nText(text: string, out?: I18nTextInfo): I18nTextInfo {
        out = out || <any>{};
        if (!text || !text.startsWith("i18n:")) {
            out.sid = null;
            out.key = null;
            out.text = text;
            return out;
        }

        let i = text.indexOf(":", 5);
        let j = text.indexOf("|", 5);
        if (i != -1) {
            out.sid = text.substring(5, i);
            if (j != -1) {
                out.key = text.substring(i + 1, j);
                out.text = text.substring(j + 1);
            }
            else {
                out.key = text.substring(i + 1);
                out.text = null;
            }
        }
        else if (j != -1) {
            out.sid = null;
            out.key = text.substring(5, j);
            out.text = text.substring(j + 1);
        }
        else {
            out.sid = null;
            out.key = text.substring(5);
            out.text = null;
        }

        return out;
    }

    /**
     * @en Encodes an i18n text object into a string.
     * @param info The i18n text information object containing `sid`, `key`, and `text` properties.
     * @param newText Optional new text to replace the existing text in the i18n text object. If not provided, the existing text will be used.
     * @returns A string in the format "i18n:sid:key|text" or "i18n:key|text", depending on whether `sid` is present.
     * @zh 将 i18n 文本对象编码为字符串。
     * @param info 包含 `sid`、`key` 和 `text` 属性的 i18n 文本信息对象。
     * @param newText 可选的新文本，用于替换 i18n 文本对象中的现有文本。如果未提供，将使用现有文本。
     * @returns 格式为 "i18n:sid:key|text" 或 "i18n:key|text" 的字符串，具体取决于是否存在 `sid`。
     */
    static encodeI18nText(info: I18nTextInfo, newText?: string): string {
        if (newText == null)
            newText = info.text ?? "";
        if (!info.key)
            return newText;
        if (info.sid)
            return "i18n:" + info.sid + ":" + info.key + "|" + newText;
        else
            return "i18n:" + info.key + "|" + newText;
    }

    protected constructor(id: string, fallbackLng?: string) {
        super(false);

        this._id2 = id;
        Translations._allInsts.set(id, this);
        this._lngs = [];
        this._fallbackLng = fallbackLng || "en";
    }

    /**
     * @en Gets the ID of this Translations instance.
     * @zh 获取此 Translations 实例的 ID。
     */
    get id() {
        return this._id;
    }

    /**
     * @en Sets the content for a specific language in this Translations instance.
     * @param lng The language code for which the content is being set. If not provided, the current language of the i18n provider will be used. 
     * @param content The content to set for the specified language, which should be an object containing key-value pairs for translations. 
     * @returns The Translations instance itself for method chaining.
     * @zh 为此 Translations 实例设置特定语言的内容。
     * @param lng 要设置内容的语言代码。如果未提供，将使用 i18n 提供者的当前语言。
     * @param content 要为指定语言设置的内容，应该是一个包含翻译键值对的对象。
     * @returns Translations 实例本身，以便进行方法链调用。 
     */
    setContent(lng: string, content: any): this {
        let i18n = Translations.provider;
        if (!i18n || !i18n.isInitialized) {
            console.error("no i18n provider or i18 is not initialized");
            return this;
        }

        if (!lng)
            lng = i18n.language;

        Translations.provider.addResourceBundle(lng, this._id2, content, true, true);
        if (this._lngs.indexOf(lng) == -1)
            this._lngs.push(lng);

        if (lng == i18n.language)
            this._t = i18n.getFixedT(i18n.language, this._id2);
        else if (!this._t && lng == this._fallbackLng)
            this._t = i18n.getFixedT(this._fallbackLng, this._id2);

        return this;
    }

    /**
     * @en Translates the given name using the current language and options.
     * @param name The name of the translation key to look up. It can be a simple key or a namespaced key in the format "namespace:key". 
     * @param defaultValue Optional default value to return if the translation key is not found. If provided, it will be returned as a fallback.
     * @returns The translated string. If the translation key is not found, the default value will be returned if provided, otherwise the key itself will be returned.
     * @zh 使用当前语言和选项翻译给定的名称。
     * @param name 要查找的翻译键的名称。可以是简单键或格式为 "namespace:key" 的命名空间键。
     * @param defaultValue 可选的默认值，如果未找到翻译键，将返回该默认值。如果提供，将作为后备返回。
     * @returns 翻译后的字符串。如果未找到翻译键，将返回默认值（如果提供），否则返回键本身 
     */
    t(name: string, defaultValue?: string): string;

    /**
     * @en Translates the given name using the current language and options.
     * @param name The name of the translation key to look up. It can be a simple key or a namespaced key in the format "namespace:key".
     * @param options Optional parameters for translation, such as variables to replace in the text.
     * @returns The translated string. If the translation key is not found, the default value will be returned if provided, otherwise the key itself will be returned.
     * @zh 使用当前语言和选项翻译给定的名称。
     * @param name 要查找的翻译键的名称。可以是简单键或格式为 "namespace:key" 的命名空间键。
     * @param options 可选的翻译参数，例如要替换文本中的变量。
     * @returns 翻译后的字符串。如果未找到翻译键，将返回默认值（如果提供），否则返回键本身。 
     */
    t(name: string, options: Record<string, any>): string;

    /**
     * @en Translates the given name using the current language and options.
     * @param name The name of the translation key to look up. It can be a simple key or a namespaced key in the format "namespace:key". 
     * @param defaultValue Optional default value to return if the translation key is not found. If provided, it will be returned as a fallback. 
     * @param options Optional parameters for translation, such as variables to replace in the text.
     * @returns The translated string. If the translation key is not found, the default value will be returned if provided, otherwise the key itself will be returned.
     * @zh 使用当前语言和选项翻译给定的名称。
     * @param name 要查找的翻译键的名称。可以是简单键或格式为 "namespace:key" 的命名空间键。
     * @param defaultValue 可选的默认值，如果未找到翻译键，将返回该默认值。如果提供，将作为后备返回。
     * @param options 可选的翻译参数，例如要替换文本中的变量。
     * @returns 翻译后的字符串。如果未找到翻译键，将返回默认值（如果提供），否则返回键本身。 
     */
    t(name: string, defaultValue: string, options: Record<string, any>): string;

    t(name: string, arg0: any, arg1?: any) {
        if (this._t)
            return this._t(name, arg0, arg1);
        else if (typeof (arg0) === "string")
            return arg0;
        else
            return name;
    }

    protected _disposeResource(): void {
        super._disposeResource();

        Translations._allInsts.delete(this._id2);
        for (let lng of this._lngs)
            Translations.provider.removeResourceBundle(lng, this._id2);
    }
}