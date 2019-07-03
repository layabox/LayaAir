import { HTMLElement } from "./HTMLElement";
import { HTMLStyle } from "../utils/HTMLStyle";
import { Pool } from "../../utils/Pool";
import { IHtml } from "../utils/IHtml";
import { ILaya } from "../../../ILaya";
/**
 * @internal
 */
export class HTMLBrElement {
    /**@internal */
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
    /**@internal */
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
