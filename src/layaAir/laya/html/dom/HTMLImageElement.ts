import { HTMLElement, HTMLElementType } from "./HTMLElement";
import { Graphics } from "../../display/Graphics"
import { Event } from "../../events/Event"
import { HTMLStyle } from "../utils/HTMLStyle"
import { ILayout } from "../utils/ILayout"
import { Loader } from "../../net/Loader"
import { Texture } from "../../resource/Texture"
import { IHtml } from "../utils/IHtml";
import { ILaya } from "../../../ILaya";
import { ClassUtils } from "../../utils/ClassUtils";

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
        if (this._tex) {
            this._tex.off(Event.LOADED, this, this.onloaded);
        }
        this._tex = null;
        this._url = null;
        return this;
    }

    set src(url: string) {
        url = this.formatURL(url);
        if (this._url === url) return;
        this._url = url;

        var tex: Texture = this._tex = Loader.getRes(url);
        if (!tex) {
            this._tex = tex = new Texture();
            tex.load(url);
            Loader.cacheTexture(url, tex);
        }

        tex.getIsReady() ? this.onloaded() : tex.once(Event.READY, this, this.onloaded);
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
ILaya.regClass(HTMLImageElement);

ClassUtils.regClass("laya.html.dom.HTMLImageElement", HTMLImageElement);
ClassUtils.regClass("Laya.HTMLImageElement", HTMLImageElement);
