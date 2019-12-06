import { HTMLElement } from "./HTMLElement";
import { HTMLStyleElement } from "./HTMLStyleElement";
import { HTMLLinkElement } from "./HTMLLinkElement";
import { HTMLStyle } from "../utils/HTMLStyle"
import { ILayout } from "../utils/ILayout"
import { Layout } from "../utils/Layout"
import { Rectangle } from "../../maths/Rectangle";
import { Handler } from "../../utils/Handler";
import { HTMLChar } from "../../utils/HTMLChar";
import { IHtml } from "../utils/IHtml";
import { ILaya } from "../../../ILaya";
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * @private
 */
export class HTMLDivParser extends HTMLElement {
    /** 实际内容的高 */
    contextHeight: number;
    /** 实际内容的宽 */
    contextWidth: number;
    /** @private */
    private _htmlBounds: Rectangle;
    /** @private */
    private _boundsRec: Rectangle;
    /** 重绘回调 */
    repaintHandler: Handler = null;
    /**
     * @override
     */
    reset(): HTMLElement {
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
    set innerHTML(text: string) {
        this.destroyChildren();
        this.appendHTML(text);
    }
    /**
     * @override
     */
    set width(value: number) {
        var changed: boolean;
        if (value === 0) {
            changed = value != this._width;
        } else {
            changed = value != this.width;
        }
        super.width = value;
        if (changed) this.layout();
    }

    /**
     * 追加内容，解析并对显示对象排版
     * @param	text
     */
    appendHTML(text: string): void {
        IHtml.HTMLParse.parse(this, text, this.URI);
        this.layout();
    }

    /**
     * @internal
     * @param	out
     * @return
     * @override
     */
    _addChildsToLayout(out: ILayout[]): boolean {
        var words: HTMLChar[] = this._getWords();
        if (words == null && (!this._children || this._children.length == 0)) return false;
        words && words.forEach(function (o: any): void {
            out.push(o);
        });
        var tFirstKey: boolean = true;

        for (var i: number = 0, len: number = this._children.length; i < len; i++) {
            var o: HTMLElement = this._children[i];
            if (tFirstKey) {
                tFirstKey = false;
            } else {
                out.push(null);
            }
            //o._style._enableLayout() && o._addToLayout(out);
            o._addToLayout(out)
        }
        return true;
    }

    /**
     * @internal
     * @param	out
     * @override
     */
    //TODO:coverage
    _addToLayout(out: ILayout[]): void {
        this.layout();
        !this.style.absolute && out.push(this);
    }

    /**
     * 获取bounds
     * @return
     */
    getBounds(): Rectangle {
        if (!this._htmlBounds) return null;
        if (!this._boundsRec) this._boundsRec = Rectangle.create();
        return this._boundsRec.copyFrom(this._htmlBounds);
    }
    /**
     * @override
     */
    parentRepaint(recreate: boolean = false): void {
        super.parentRepaint();
        if (this.repaintHandler) this.repaintHandler.runWith(recreate);
    }

    /**
     * @private
     * 对显示内容进行排版
     */
    layout(): void {
        this.style._type |= HTMLStyle.ADDLAYOUTED;
        var tArray: any[] = Layout.layout(this);
        if (tArray) {
            if (!this._htmlBounds) this._htmlBounds = Rectangle.create();
            var tRectangle: Rectangle = this._htmlBounds;
            tRectangle.x = tRectangle.y = 0;
            tRectangle.width = this.contextWidth = tArray[0];
            tRectangle.height = this.contextHeight = tArray[1];
        }
    }

    /**
     * 获取对象的高
     * @override
     */
    get height(): number {
        if (this._height) return this._height;
        return this.contextHeight;
    }
    /**
     * @override
     */
    set height(value: number) {
        super.height = value;
    }

    /**
     * 获取对象的宽
     * @override
     */
    get width(): number {
        if (this._width) return this._width;
        return this.contextWidth;
    }
}

IHtml.HTMLDivParser = HTMLDivParser;
ILaya.regClass(HTMLDivParser);

ClassUtils.regClass("laya.html.dom.HTMLDivParser", HTMLDivParser);
ClassUtils.regClass("Laya.HTMLDivParser", HTMLDivParser);