import { Resource } from "../resource/Resource";
import { i18n, TFunction } from "i18next";

export type I18nTextInfo = { sid?: string, key?: string, text: string };
let _tmpInfo: I18nTextInfo = { text: "" };

export class I18nManager {
    static provider: i18n;
    static language: string;
}

export class Translations extends Resource {
    private _id2: string;
    private _t: TFunction;
    private _lngs: Array<string>;
    private _fallbackLng: string;

    static _allInsts: Map<string, Translations> = new Map();

    static getById(id: string): Translations {
        return Translations._allInsts.get(id) || null;
    }

    static create(id: string, fallbackLng?: string): Translations {
        return new Translations(id, fallbackLng);
    }

    static translate(text: string, options?: Record<string, any>): string {
        this.decodeI18nText(text, _tmpInfo);
        let i18n: { t: (name: string, arg0: any, arg1?: any) => any };
        if (_tmpInfo.sid)
            i18n = Translations.getById(_tmpInfo.sid);
        else if (_tmpInfo.key)
            i18n = I18nManager.provider;
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
        let i18n = I18nManager.provider;
        if (!i18n || !i18n.isInitialized) {
            console.error("no i18n provider or i18 is not initialized");
            return this;
        }

        if (!lng)
            lng = I18nManager.language;

        I18nManager.provider.addResourceBundle(lng, this._id2, content, true, true);
        if (this._lngs.indexOf(lng) == -1)
            this._lngs.push(lng);

        if (lng == I18nManager.language)
            this._t = i18n.getFixedT(I18nManager.language, this._id2);
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
            I18nManager.provider.removeResourceBundle(lng, this._id2);
    }
}