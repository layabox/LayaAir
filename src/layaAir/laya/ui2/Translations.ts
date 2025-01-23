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

export class Translations extends Resource {
    private _id2: string;
    private _t: TFunction;
    private _lngs: Array<string>;
    private _fallbackLng: string;

    static provider: i18n = <any>new SimpleProvider();

    static _allInsts: Map<string, Translations> = new Map();

    static getById(id: string): Translations {
        return Translations._allInsts.get(id) || null;
    }

    static create(id: string, fallbackLng?: string): Translations {
        return new Translations(id, fallbackLng);
    }

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

    get id() {
        return this._id;
    }

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

    t(name: string, defaultValue?: string): string;
    t(name: string, options: Record<string, any>): string;
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