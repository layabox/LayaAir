import { HTMLElement } from "./HTMLElement";
import { HTMLStyle } from "../utils/HTMLStyle";
import { Pool } from "laya/utils/Pool";
import { IHtml } from "../utils/IHtml";
import { ILaya } from "ILaya";
/**
 * @private
 */
export class HTMLBrElement {
    /**@private */
    _addToLayout(out) {
        out.push(this);
    }
    //TODO:coverage
    reset() {
        return this;
    }
    destroy() {
        Pool.recover(HTMLElement.getClassName(this), this.reset());
    }
    _setParent(value) {
    }
    set parent(value) {
    }
    set URI(value) {
    }
    set href(value) {
    }
    /**@private */
    //TODO:coverage
    _getCSSStyle() {
        if (!HTMLBrElement.brStyle) {
            HTMLBrElement.brStyle = new HTMLStyle();
            HTMLBrElement.brStyle.setLineElement(true);
            HTMLBrElement.brStyle.block = true;
        }
        return HTMLBrElement.brStyle;
    }
    renderSelfToGraphic(graphic, gX, gY, recList) {
    }
}
IHtml.HTMLBrElement = HTMLBrElement;
ILaya.regClass(HTMLBrElement);
