import { HTMLElement } from "./HTMLElement";
import { Loader } from "../../net/Loader";
import { Graphics } from "../../display/Graphics";
import { Event } from "../../events/Event";
import { HTMLStyle } from "../utils/HTMLStyle";
import { URL } from "../../net/URL";
import { ILaya } from "../../../ILaya";

/**
 * @private
 */
export class HTMLLinkElement extends HTMLElement {

    static _cuttingStyle: RegExp = new RegExp("((@keyframes[\\s\\t]+|)(.+))[\\t\\n\\r\\\s]*{", "g");
    type: string;

    /**
     * @override
     */
    protected _creates(): void {
    }
    /**
     * 
     * @param graphic 
     * @param gX 
     * @param gY 
     * @param recList 
     * @override
     */
    drawToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void {
    }
    /**
     * @override
     */
    reset(): HTMLElement {
        // if (this._loader) this._loader.off(Event.COMPLETE, this, this._onload);
        // this._loader = null;
        return this;
    }

    /**@internal */
    _onload(data: string): void {

    }
    /**
     * @override
     */
    set href(url: string) {
        if (!url) return;
        url = URL.formatURL(url);
        this.URI = new URL(url);
        ILaya.loader.load(url, { type: Loader.TEXT, cache: false }).then(data => {
            switch (this.type) {
                case 'text/css':
                    HTMLStyle.parseCSS(data, this.URI);
                    break;
            }
            this.repaint(true);
        });
    }
    /**
     * @override
     */
    get href() {
        return super.href;
    }
}
