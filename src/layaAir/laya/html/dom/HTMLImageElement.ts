import { HTMLElement, HTMLElementType } from "./HTMLElement";
import { Graphics } from "../../display/Graphics"
import { Event } from "../../events/Event"
import { HTMLStyle } from "../utils/HTMLStyle"
import { ILayout } from "../utils/ILayout"
import { Loader } from "../../net/Loader"
import { Texture } from "../../resource/Texture"
import { IHtml } from "../utils/IHtml";
import { URL } from "../../net/URL";
import { ILaya } from "../../../ILaya";

/**
 * @private
 */
export class HTMLImageElement extends HTMLElement {

    private _tex: Texture;
    private _url: string;
    constructor() {
        super();
        this.eletype = HTMLElementType.IMAGE;
    }
    /**
     * @override
     */
    reset(): HTMLElement {
        super.reset();
        this._tex = null;
        this._url = null;
        return this;
    }

    set src(url: string) {
        url = URL.formatURL(url, this.URI ? this.URI.path : null);
        if (this._url === url) return;
        this._url = url;

        ILaya.loader.load(url).then((tex: Texture) => {
            this._tex = tex;
            this.onloaded();
        });
    }

    //TODO:coverage
    private onloaded(): void {
        if (!this._style) return;
        var style: HTMLStyle = (<HTMLStyle>this._style);
        var w: number = style.widthed(this) ? -1 : this._tex.width;
        var h: number = style.heighted(this) ? -1 : this._tex.height;

        if (!style.widthed(this) && this._width != this._tex.width) {
            this.width = this._tex.width;
            this.parent && this.parent._layoutLater();
        }

        if (!style.heighted(this) && this._height != this._tex.height) {
            this.height = this._tex.height;
            this.parent && this.parent._layoutLater();
        }
        this.repaint();
    }

    /**@internal 
     * @override
    */
    _addToLayout(out: ILayout[]): void {
        var style: HTMLStyle = (<HTMLStyle>this._style);
        !style.absolute && out.push(this);
    }

    /**
     * 
     * @param graphic 
     * @param gX 
     * @param gY 
     * @param recList 
     * @override
     */
    renderSelfToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void {
        if (!this._tex) return;
        graphic.drawImage(this._tex, gX, gY, this.width || this._tex.width, this.height || this._tex.height);
    }
}

IHtml.HTMLImageElement = HTMLImageElement;
