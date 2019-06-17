import { HTMLElement, HTMLElementType } from "./HTMLElement";
import { Event } from "../../events/Event";
import { Loader } from "../../net/Loader";
import { Texture } from "../../resource/Texture";
import { IHtml } from "../utils/IHtml";
import { ILaya } from "../../../ILaya";
/**
 * @private
 */
export class HTMLImageElement extends HTMLElement {
    constructor() {
        super();
        this.eletype = HTMLElementType.IMAGE;
    }
    /*override*/ reset() {
        super.reset();
        if (this._tex) {
            this._tex.off(Event.LOADED, this, this.onloaded);
        }
        this._tex = null;
        this._url = null;
        return this;
    }
    set src(url) {
        url = this.formatURL(url);
        if (this._url === url)
            return;
        this._url = url;
        var tex = this._tex = Loader.getRes(url);
        if (!tex) {
            this._tex = tex = new Texture();
            tex.load(url);
            Loader.cacheRes(url, tex);
        }
        tex.getIsReady() ? this.onloaded() : tex.once(Event.READY, this, this.onloaded);
    }
    //TODO:coverage
    onloaded() {
        if (!this._style)
            return;
        var style = this._style;
        var w = style.widthed(this) ? -1 : this._tex.width;
        var h = style.heighted(this) ? -1 : this._tex.height;
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
    //TODO:coverage
    /*override*/ _addToLayout(out) {
        var style = this._style;
        !style.absolute && out.push(this);
    }
    //TODO:coverage
    /*override*/ renderSelfToGraphic(graphic, gX, gY, recList) {
        if (!this._tex)
            return;
        graphic.drawImage(this._tex, gX, gY, this.width || this._tex.width, this.height || this._tex.height);
    }
}
IHtml.HTMLImageElement = HTMLImageElement;
ILaya.regClass(HTMLImageElement);
