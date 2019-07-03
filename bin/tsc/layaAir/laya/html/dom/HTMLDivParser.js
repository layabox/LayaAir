import { HTMLElement } from "./HTMLElement";
import { HTMLStyleElement } from "./HTMLStyleElement";
import { HTMLLinkElement } from "./HTMLLinkElement";
import { HTMLStyle } from "../utils/HTMLStyle";
import { Layout } from "../utils/Layout";
import { Rectangle } from "../../maths/Rectangle";
import { IHtml } from "../utils/IHtml";
import { ILaya } from "../../../ILaya";
/**
 * @private
 */
export class HTMLDivParser extends HTMLElement {
    constructor() {
        super(...arguments);
        /** 重绘回调 */
        this.repaintHandler = null;
    }
    /*override*/ reset() {
        HTMLStyleElement;
        HTMLLinkElement;
        super.reset();
        this._style.block = true;
        this._style.setLineElement(true);
        this._style.width = 200;
        this._style.height = 200;
        this.repaintHandler = null;
        this.contextHeight = 0;
        this.contextWidth = 0;
        return this;
    }
    /**
     * 设置标签内容
     */
    set innerHTML(text) {
        this.destroyChildren();
        this.appendHTML(text);
    }
    /*override*/ set width(value) {
        var changed;
        if (value === 0) {
            changed = value != this._width;
        }
        else {
            changed = value != this.width;
        }
        super.width = value;
        if (changed)
            this.layout();
    }
    /**
     * 追加内容，解析并对显示对象排版
     * @param	text
     */
    appendHTML(text) {
        IHtml.HTMLParse.parse(this, text, this.URI);
        this.layout();
    }
    /**
     * @internal
     * @param	out
     * @return
     */
    /*override*/ _addChildsToLayout(out) {
        var words = this._getWords();
        if (words == null && (!this._children || this._children.length == 0))
            return false;
        words && words.forEach(function (o) {
            out.push(o);
        });
        var tFirstKey = true;
        for (var i = 0, len = this._children.length; i < len; i++) {
            var o = this._children[i];
            if (tFirstKey) {
                tFirstKey = false;
            }
            else {
                out.push(null);
            }
            //o._style._enableLayout() && o._addToLayout(out);
            o._addToLayout(out);
        }
        return true;
    }
    /**
     * @internal
     * @param	out
     */
    //TODO:coverage
    /*override*/ _addToLayout(out) {
        this.layout();
        !this.style.absolute && out.push(this);
    }
    /**
     * 获取bounds
     * @return
     */
    getBounds() {
        if (!this._htmlBounds)
            return null;
        if (!this._boundsRec)
            this._boundsRec = Rectangle.create();
        return this._boundsRec.copyFrom(this._htmlBounds);
    }
    /*override*/ parentRepaint(recreate = false) {
        super.parentRepaint();
        if (this.repaintHandler)
            this.repaintHandler.runWith(recreate);
    }
    /**
     * @private
     * 对显示内容进行排版
     */
    layout() {
        this.style._type |= HTMLStyle.ADDLAYOUTED;
        var tArray = Layout.layout(this);
        if (tArray) {
            if (!this._htmlBounds)
                this._htmlBounds = Rectangle.create();
            var tRectangle = this._htmlBounds;
            tRectangle.x = tRectangle.y = 0;
            tRectangle.width = this.contextWidth = tArray[0];
            tRectangle.height = this.contextHeight = tArray[1];
        }
    }
    /**
     * 获取对象的高
     */
    /*override*/ get height() {
        if (this._height)
            return this._height;
        return this.contextHeight;
    }
    set height(value) {
        super.height = value;
    }
    /**
     * 获取对象的宽
     */
    /*override*/ get width() {
        if (this._width)
            return this._width;
        return this.contextWidth;
    }
}
IHtml.HTMLDivParser = HTMLDivParser;
ILaya.regClass(HTMLDivParser);
