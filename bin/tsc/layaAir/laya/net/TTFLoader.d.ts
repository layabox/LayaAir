import { Handler } from "../utils/Handler";
/**
 * @private
 */
export declare class TTFLoader {
    private static _testString;
    fontName: string;
    complete: Handler;
    err: Handler;
    private _fontTxt;
    private _url;
    private _div;
    private _txtWidth;
    private _http;
    load(fontPath: string): void;
    private _loadConch;
    private _onHttpLoaded;
    private _clearHttp;
    private _onErr;
    private _complete;
    private _checkComplete;
    private _loadWithFontFace;
    private _createDiv;
    private _loadWithCSS;
}
