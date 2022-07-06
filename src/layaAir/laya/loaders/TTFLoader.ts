import { ILaya } from "../../ILaya";
import { Browser } from "../utils/Browser";
import { Handler } from "../utils/Handler";

/**
 * @private
 */
export class TTFLoader {
    private static _testString: string = "LayaTTFFont";
    fontName: string;
    complete: Handler | null;
    err: Handler | null;
    private _fontTxt: string;
    private _url: string;
    private _div: any;
    private _txtWidth: number;

    //TODO:coverage
    load(fontPath: string): void {
        this._url = fontPath;
        var tArr: any[] = fontPath.toLowerCase().split(".ttf")[0].split("/");
        this.fontName = tArr[tArr.length - 1];
        if (ILaya.Render.isConchApp) {
            ILaya.loader.fetch(this._url, "arraybuffer").then(data => {
                if (data)
                    (window as any)["conchTextCanvas"].setFontFaceFromBuffer(this.fontName, data);
                this._complete();
            });
        } else
            if ((window as any).FontFace) {
                this._loadWithFontFace()
            }
            else {
                this._loadWithCSS();
            }
    }

    //TODO:coverage
    private _complete(): void {
        ILaya.systemTimer.clear(this, this._complete);
        ILaya.systemTimer.clear(this, this._checkComplete);
        if (this._div && this._div.parentNode) {

            this._div.parentNode.removeChild(this._div);
            this._div = null;
        }
        if (this.complete) {
            this.complete.runWith(this);
            this.complete = null;
        }
    }

    //TODO:coverage
    private _checkComplete(): void {
        if (ILaya.Browser.measureText(TTFLoader._testString, this._fontTxt).width != this._txtWidth) {
            this._complete();
        }
    }

    //TODO:coverage
    private _loadWithFontFace(): void {

        var fontFace: any = new (window as any).FontFace(this.fontName, "url('" + this._url + "')");
        (document as any).fonts.add(fontFace);
        var self: TTFLoader = this;
        fontFace.loaded.then((function (): void {
            self._complete()
        }));
        //_createDiv();
        fontFace.load();

    }

    //TODO:coverage
    private _createDiv(): void {
        this._div = Browser.createElement("div");
        this._div.innerHTML = "laya";
        var _style: any = this._div.style;
        _style.fontFamily = this.fontName;
        _style.position = "absolute";
        _style.left = "-100px";
        _style.top = "-100px";
        document.body.appendChild(this._div);
    }

    //TODO:coverage
    private _loadWithCSS(): void {

        var fontStyle: any = Browser.createElement("style");
        fontStyle.type = "text/css";
        document.body.appendChild(fontStyle);
        fontStyle.textContent = "@font-face { font-family:'" + this.fontName + "'; src:url('" + this._url + "');}";
        this._fontTxt = "40px " + this.fontName;
        this._txtWidth = Browser.measureText(TTFLoader._testString, this._fontTxt).width;

        var self: TTFLoader = this;
        fontStyle.onload = function (): void {
            ILaya.systemTimer.once(10000, self, self._complete);
        };
        ILaya.systemTimer.loop(20, this, this._checkComplete);

        this._createDiv();

    }

}


