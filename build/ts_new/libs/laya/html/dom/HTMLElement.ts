import { HTMLDocument } from "./HTMLDocument";
import { HTMLHitRect } from "./HTMLHitRect";
import { Graphics } from "../../display/Graphics"
import { HTMLStyle } from "../utils/HTMLStyle"
import { ILayout } from "../utils/ILayout"
import { Layout } from "../utils/Layout"
import { URL } from "../../net/URL"
import { HTMLChar } from "../../utils/HTMLChar"
import { Pool } from "../../utils/Pool"
import { ILaya } from "../../../ILaya";
import { IHtml } from "../utils/IHtml";
import { ClassUtils } from "../../utils/ClassUtils";

/**HTML元素类型 */
export enum HTMLElementType {
    /**基础类型 */
    BASE = 0,
    /**图片类型 */
    IMAGE = 1
}
/**
 * @private
 */
export class HTMLElement {

    private static _EMPTYTEXT: any = { text: null, words: null };
    eletype: HTMLElementType = HTMLElementType.BASE;      // 用type来避免 instance判断引起的import问题
    URI: URL;
    parent: HTMLElement;
    _style: HTMLStyle;

    protected _text: any;
    protected _children: any[];
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;

    /**
     * 格式化指定的地址并返回。
     * @param	url 地址。
     * @param	base 基础路径，如果没有，则使用basePath。
     * @return	格式化处理后的地址。
     */
    static formatURL1(url: string, basePath: string = null): string {
        if (!url) return "null path";
        if (!basePath) basePath = URL.basePath;
        //如果是全路径，直接返回，提高性能
        if (url.indexOf(":") > 0) return url;
        //自定义路径格式化
        if (URL.customFormat != null) url = URL.customFormat(url);
        //如果是全路径，直接返回，提高性能
        if (url.indexOf(":") > 0) return url;

        var char1: string = url.charAt(0);
        if (char1 === ".") {
            return URL._formatRelativePath(basePath + url);
        } else if (char1 === '~') {
            return URL.rootPath + url.substring(1);
        } else if (char1 === "d") {
            if (url.indexOf("data:image") === 0) return url;
        } else if (char1 === "/") {
            return url;
        }
        return basePath + url;
    }

    constructor() {
        this._creates();
        this.reset();
    }

    protected _creates(): void {
        this._style = HTMLStyle.create();
    }

    /**
     * 重置
     */
    reset(): HTMLElement {
        this.URI = null;
        this.parent = null;
        this._style.reset();
        this._style.ower = this;
        this._style.valign = "middle";
        if (this._text && this._text.words) {
            var words: any[] = this._text.words;
            var i: number, len: number;
            len = words.length;
            var tChar: HTMLChar;
            for (i = 0; i < len; i++) {
                tChar = words[i];
                if (tChar) tChar.recover();
            }
        }
        this._text = HTMLElement._EMPTYTEXT;
        if (this._children) this._children.length = 0;
        this._x = this._y = this._width = this._height = 0;
        return this;
    }

    /**@internal */
    _getCSSStyle(): HTMLStyle {
        return (<HTMLStyle>this._style);
    }

    /**@internal */
    _addChildsToLayout(out: ILayout[]): boolean {
        var words: HTMLChar[] = this._getWords();
        if (words == null && (!this._children || this._children.length == 0))
            return false;
        if (words) {
            for (var i: number = 0, n: number = words.length; i < n; i++) {
                out.push(words[i]);
            }
        }
        if (this._children)
            this._children.forEach(function (o: HTMLElement, index: number, array: any[]): void {
                var _style: HTMLStyle = (<HTMLStyle>o._style);
                _style._enableLayout && _style._enableLayout() && o._addToLayout(out);
            });
        return true;
    }

    /**@internal */
    _addToLayout(out: ILayout[]): void {
        if (!this._style) return;
        var style: HTMLStyle = (<HTMLStyle>this._style);
        if (style.absolute) return;
        style.block ? out.push(this) : (this._addChildsToLayout(out) && (this.x = this.y = 0));
    }

    set id(value: string) {
        HTMLDocument.document.setElementById(value, this);
    }

    repaint(recreate: boolean = false): void {
        this.parentRepaint(recreate);
    }

    parentRepaint(recreate: boolean = false): void {
        if (this.parent) this.parent.repaint(recreate);
    }

    set innerTEXT(value: string) {
        if (this._text === HTMLElement._EMPTYTEXT) {
            this._text = { text: value, words: null };
        } else {
            this._text.text = value;
            this._text.words && (this._text.words.length = 0);
        }
        this.repaint();
    }

    get innerTEXT(): string {
        return this._text.text;
    }

    protected _setParent(value: HTMLElement): void {
        if (value instanceof HTMLElement) {
            var p: HTMLElement = (<HTMLElement>value);
            this.URI || (this.URI = p.URI);
            if (this.style)
                this.style.inherit(p.style);
        }
    }

    appendChild(c: HTMLElement): HTMLElement {
        return (<HTMLElement>this.addChild(c));
    }

    addChild(c: HTMLElement): HTMLElement {
        if (c.parent) c.parent.removeChild(c);
        if (!this._children) this._children = [];
        this._children.push(c);
        c.parent = this;
        c._setParent(this);
        this.repaint();
        return c;
    }

    removeChild(c: HTMLElement): HTMLElement {
        if (!this._children) return null;
        var i: number, len: number;
        len = this._children.length;
        for (i = 0; i < len; i++) {
            if (this._children[i] == c) {
                this._children.splice(i, 1);
                return c;
            }
        }
        return null;
    }

    static getClassName(tar: any): string {
        if (tar instanceof Function) return tar.name;
        return tar["constructor"].name;
    }

    /**
     * <p>销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。</p>
     * <p>destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。</p>
     * @param destroyChild	（可选）是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    destroy(): void {
        //销毁子节点
        if (this._children) {
            this.destroyChildren();
            this._children.length = 0;
        }
        Pool.recover(HTMLElement.getClassName(this), this.reset());
    }

    /**
     * 销毁所有子对象，不销毁自己本身。
     */
    destroyChildren(): void {
        //销毁子节点
        if (this._children) {
            for (var i: number = this._children.length - 1; i > -1; i--) {
                this._children[i].destroy();
            }
            this._children.length = 0;
        }
    }

    get style() {
        return this._style;
    }
    /**@internal */
    _getWords(): HTMLChar[] {
        if (!this._text) return null;
        var txt: string = this._text.text;
        if (!txt || txt.length === 0)
            return null;

        var words: HTMLChar[] = this._text.words;
        if (words && words.length === txt.length)
            return words as HTMLChar[];
        words === null && (this._text.words = words = []);
        words.length = txt.length;
        var size: any;
        var style: HTMLStyle = this.style;
        var fontStr: string = style.font;
        for (var i: number = 0, n: number = txt.length; i < n; i++) {
            size = ILaya.Browser.measureText(txt.charAt(i), fontStr);
            words[i] = HTMLChar.create().setData(txt.charAt(i), size.width, size.height || style.fontSize, style);
        }
        return words;
    }

    /**@internal */
    //TODO:coverage
    _isChar(): boolean {
        return false;
    }

    /**@internal */
    _layoutLater(): void {
        var style: HTMLStyle = this.style;

        if ((style._type & HTMLStyle.ADDLAYOUTED))
            return;

        if (style.widthed(this) && ((this._children && this._children.length > 0) || this._getWords() != null) && style.block) {
            Layout.later(this);
            style._type |= HTMLStyle.ADDLAYOUTED;
        } else {
            this.parent && this.parent._layoutLater();
        }
    }

    set x(v: number) {
        if (this._x != v) {
            this._x = v;
            this.parentRepaint();
        }
    }

    get x(): number {
        return this._x;
    }

    set y(v: number) {
        if (this._y != v) {
            this._y = v;
            this.parentRepaint();
        }
    }

    get y(): number {
        return this._y;
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.repaint();
        }
    }

    get height(): number {
        return this._height;

    }

    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.repaint();
        }
    }
    /**@internal */
    _setAttributes(name: string, value: string): void {
        switch (name) {
            case 'style':
                this.style.cssText(value);
                break;
            case 'class':
                this.className = value;
                break;
            case 'x':
                this.x = parseFloat(value);
                break;
            case 'y':
                this.y = parseFloat(value);
                break;
            case 'width':
                this.width = parseFloat(value);
                break;
            case 'height':
                this.height = parseFloat(value);
                break;
            default:
                (this as any)[name] = value;
        }
    }

    set href(url: string) {
        if (!this._style) return;
        if (url != this._style.href) {
            this._style.href = url;
            this.repaint();
        }
    }

    get href(): string {
        if (!this._style) return null;
        return this._style.href;
    }

    formatURL(url: string): string {
        if (!this.URI) return url;
        return HTMLElement.formatURL1(url, this.URI ? this.URI.path : null);
    }

    set color(value: string) {
        this.style.color = value;
    }

    set className(value: string) {
        this.style.attrs(HTMLDocument.document.styleSheets['.' + value]);
    }

    drawToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void {
        gX += this.x;
        gY += this.y;
        var cssStyle: HTMLStyle = this.style;
        if (cssStyle.paddingLeft) {
            gX += cssStyle.paddingLeft;
        }
        if (cssStyle.paddingTop) {
            gY += cssStyle.paddingTop;
        }
        if (cssStyle.bgColor != null || cssStyle.borderColor) {
            graphic.drawRect(gX, gY, this.width, this.height, cssStyle.bgColor, cssStyle.borderColor, 1);
        }

        this.renderSelfToGraphic(graphic, gX, gY, recList);
        var i: number, len: number;
        var tChild: HTMLElement;
        if (this._children && this._children.length > 0) {
            len = this._children.length;
            for (i = 0; i < len; i++) {
                tChild = this._children[i];
                if (tChild.drawToGraphic != null)
                    tChild.drawToGraphic(graphic, gX, gY, recList);
            }
        }
    }

    renderSelfToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void {
        var cssStyle: HTMLStyle = this.style;
        var words: HTMLChar[] = this._getWords();
        var i: number, len: number;

        if (words) {
            len = words.length;
            var a: HTMLChar;
            if (cssStyle) {
                var font: string = cssStyle.font;
                var color: string = cssStyle.color;
                if (cssStyle.stroke) {
                    var stroke: any = cssStyle.stroke;
                    stroke = parseInt(stroke);
                    var strokeColor: string = cssStyle.strokeColor;
                    //for (i = 0; i < len; i++) {
                    //a = words[i];
                    //graphic.strokeText(a.char, a.x + gX, a.y + gY, font, strokeColor, stroke, 'left');
                    //graphic.fillText(a.char, a.x + gX, a.y + gY, font, color, 'left');
                    //}
                    graphic.fillBorderWords((<any[]>words), gX, gY, font, color, strokeColor, stroke);
                } else {
                    //for (i = 0; i < len; i++) {
                    //a = words[i];
                    //graphic.fillText(a.char, a.x + gX, a.y + gY, font, color, 'left');
                    //}
                    graphic.fillWords((<any[]>words), gX, gY, font, color);
                }
                if (this.href) {
                    var lastIndex: number = words.length - 1;
                    var lastWords: HTMLChar = words[lastIndex];
                    var lineY: number = lastWords.y + lastWords.height;

                    if (lastWords.y == words[0].y) {
                        if (cssStyle.textDecoration != "none")
                            graphic.drawLine(words[0].x, lineY, lastWords.x + lastWords.width, lineY, color, 1);
                        var hitRec: HTMLHitRect = HTMLHitRect.create();
                        hitRec.rec.setTo(words[0].x, lastWords.y, lastWords.x + lastWords.width - words[0].x, lastWords.height);
                        hitRec.href = this.href;
                        recList.push(hitRec);
                    } else {
                        this.workLines((<any[]>words), graphic, recList);
                    }


                }
            }

        }
    }

    private workLines(wordList: any[], g: Graphics, recList: any[]): void {
        var cssStyle: HTMLStyle = this.style;
        var hasLine: boolean;
        hasLine = cssStyle.textDecoration != "none";
        var i: number = 0, len: number;
        len = wordList.length;
        var tStartWord: HTMLChar;
        tStartWord = wordList[i];
        var tEndWord: HTMLChar;
        tEndWord = tStartWord;
        if (!tStartWord) return;
        var tword: HTMLChar;
        for (i = 1; i < len; i++) {
            tword = wordList[i];
            if (tword.y != tStartWord.y) {
                this.createOneLine(tStartWord, tEndWord, hasLine, g, recList);
                tStartWord = tword;
                tEndWord = tword;
            } else {
                tEndWord = tword;
            }
        }
        this.createOneLine(tStartWord, tEndWord, hasLine, g, recList);
    }
    private createOneLine(startWord: HTMLChar, lastWords: HTMLChar, hasLine: boolean, graphic: Graphics, recList: any[]): void {
        var lineY: number = lastWords.y + lastWords.height;
        if (hasLine)
            graphic.drawLine(startWord.x, lineY, lastWords.x + lastWords.width, lineY, this.style.color, 1);
        var hitRec: HTMLHitRect = HTMLHitRect.create();
        hitRec.rec.setTo(startWord.x, lastWords.y, lastWords.x + lastWords.width - startWord.x, lastWords.height);
        hitRec.href = this.href;
        recList.push(hitRec);
    }
}


ILaya.regClass(HTMLElement);
IHtml.HTMLElementType = HTMLElementType;

ClassUtils.regClass("laya.html.dom.HTMLElement", HTMLElement);
ClassUtils.regClass("Laya.HTMLElement", HTMLElement);
