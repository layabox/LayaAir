import { TextStyle } from "../display/css/TextStyle";
import { HtmlElement, HtmlElementType } from "./HtmlElement";
import { HtmlImage } from "./HtmlImage";
import { HtmlLink } from "./HtmlLink";
import { HtmlParseOptions } from "./HtmlParseOptions";
import { IHtmlObject } from "./IHtmlObject";
import { XMLIterator, XMLTagType } from "./XMLIterator";
import { XMLUtils } from "./XMLUtils";

const s_list1 = new Array<string>();
const s_list2 = new Array<string>();

/**
 * @en The `HtmlParser` class is responsible for parsing HTML content and converting it into a series of HTML elements with styles.
 * @zh `HtmlParser` 类负责解析 HTML 内容，将其转换为一系列具有样式的 HTML 元素。
 */
export class HtmlParser {
    /**
     * @en The default instance of the HtmlParser class.
     * @zh HtmlParser 类的默认实例。
     */
    static defaultParser: HtmlParser = new HtmlParser();

    /**
     * @en A mapping of HTML element types to their corresponding classes.
     * @zh 将 HTML 元素类型映射到它们对应的类。
     */
    static classMap: Record<number, new () => IHtmlObject> = {
        [HtmlElementType.Image]: HtmlImage,
        [HtmlElementType.Link]: HtmlLink
    };

    protected _styleStack: Array<TextStyle>;
    protected _styleStackTop: number;
    protected _style: TextStyle;
    protected _elements: Array<HtmlElement>;
    protected _options: HtmlParseOptions;

    /** @ignore */
    public constructor() {
        this._styleStack = new Array<TextStyle>();
        this._style = new TextStyle();
        this._options = new HtmlParseOptions();
    }

    /**
     * @en Parses the given HTML source and populates the output array with HTML elements.
     * @param aSource The HTML source to parse.
     * @param style The default text style to apply.
     * @param out The array to populate with parsed HTML elements.
     * @param options The options for parsing the HTML.
     * @zh 解析给定的 HTML 源代码，并将输出数组填充为 HTML 元素。
     * @param aSource 要解析的 HTML 源代码。
     * @param style 要应用的默认文本样式。
     * @param out 要填充解析后的 HTML 元素的数组。
     * @param options 解析 HTML 的选项。
     */
    public parse(aSource: string, style: TextStyle, out: Array<HtmlElement>, options?: HtmlParseOptions): void {
        if (options == null)
            options = this._options;

        this._elements = out;
        this._styleStackTop = 0;
        Object.assign(this._style, style);
        (<any>this._style).colorChanged = false;
        let skipText: number = 0;
        let ignoreWhiteSpace: boolean = options.ignoreWhiteSpace;
        let skipNextCR: boolean = false;
        let text: string

        XMLIterator.begin(aSource, true);
        while (XMLIterator.nextTag()) {
            if (skipText == 0) {
                text = XMLIterator.getText(ignoreWhiteSpace);
                if (text.length > 0) {
                    if (skipNextCR && text[0] == '\n')
                        text = text.substring(1);
                    this.appendText(text);
                }
            }

            skipNextCR = false;
            switch (XMLIterator.tagName) {
                case "b":
                    if (XMLIterator.tagType == XMLTagType.Start) {
                        this.pushStyle();
                        this._style.bold = true;
                    }
                    else
                        this.popStyle();
                    break;

                case "i":
                    if (XMLIterator.tagType == XMLTagType.Start) {
                        this.pushStyle();
                        this._style.italic = true;
                    }
                    else
                        this.popStyle();
                    break;

                case "u":
                    if (XMLIterator.tagType == XMLTagType.Start) {
                        this.pushStyle();
                        this._style.underline = true;
                    }
                    else
                        this.popStyle();
                    break;

                case "strike":
                    if (XMLIterator.tagType == XMLTagType.Start) {
                        this.pushStyle();
                        this._style.strikethrough = true;
                    }
                    else
                        this.popStyle();
                    break;

                // case "sub":
                //     {
                //         if (XMLIterator.tagType == XMLTagType.Start) {
                //             this.pushTextFormat();
                //             this._format.specialStyle = TextFormat.SpecialStyle.Subscript;
                //         }
                //         else
                //             this.popTextFormat();
                //     }
                //     break;

                // case "sup":
                //     {
                //         if (XMLIterator.tagType == XMLTagType.Start) {
                //             this.pushTextFormat();
                //             this._format.specialStyle = TextFormat.SpecialStyle.Superscript;
                //         }
                //         else
                //             this.popTextFormat();
                //     }
                //     break;

                case "font":
                    if (XMLIterator.tagType == XMLTagType.Start) {
                        this.pushStyle();

                        this._style.fontSize = XMLUtils.getInt(XMLIterator.attributes, "size", this._style.fontSize);
                        let color: string = XMLIterator.getAttribute("color");
                        if (color != null) {
                            this._style.color = color;
                            (<any>this._style).colorChanged = true;
                        }
                    }
                    else if (XMLIterator.tagType == XMLTagType.End)
                        this.popStyle();
                    break;

                case "br":
                    this.appendText("\n");
                    break;

                case "img":
                    if (XMLIterator.tagType == XMLTagType.Start || XMLIterator.tagType == XMLTagType.Void) {
                        let element: HtmlElement = HtmlElement.getFromPool(HtmlElementType.Image);
                        element.fetchAttributes();
                        element.name = element.getAttrString("name");
                        element.style.align = this._style.align;
                        element.style.underline = this._style.underline;
                        element.style.underlineColor = this._style.underlineColor;
                        this._elements.push(element);
                    }
                    break;

                case "a":
                    if (XMLIterator.tagType == XMLTagType.Start) {
                        this.pushStyle();

                        this._style.underline = this._style.underline || options.linkUnderline;
                        if (!(<any>this._style).colorChanged && options.linkColor != null)
                            this._style.color = options.linkColor;

                        let element = HtmlElement.getFromPool(HtmlElementType.Link);
                        element.fetchAttributes();
                        element.name = element.getAttrString("name");
                        element.style.align = this._style.align;
                        this._elements.push(element);
                    }
                    else if (XMLIterator.tagType == XMLTagType.End) {
                        this.popStyle();

                        let element = HtmlElement.getFromPool(HtmlElementType.LinkEnd);
                        this._elements.push(element);
                    }
                    break;

                case "input":
                    {
                        let element = HtmlElement.getFromPool(HtmlElementType.Input);
                        element.fetchAttributes();
                        element.name = element.getAttrString("name");
                        Object.assign(element.style, this._style);
                        this._elements.push(element);
                    }
                    break;

                case "select":
                    {
                        if (XMLIterator.tagType == XMLTagType.Start || XMLIterator.tagType == XMLTagType.Void) {
                            let element = HtmlElement.getFromPool(HtmlElementType.Select);
                            element.fetchAttributes();
                            if (XMLIterator.tagType == XMLTagType.Start) {
                                s_list1.length = 0;
                                s_list2.length = 0;
                                while (XMLIterator.nextTag()) {
                                    if (XMLIterator.tagName == "select")
                                        break;

                                    if (XMLIterator.tagName == "option") {
                                        if (XMLIterator.tagType == XMLTagType.Start || XMLIterator.tagType == XMLTagType.Void)
                                            s_list2.push(XMLUtils.getString(XMLIterator.attributes, "value", ""));
                                        else
                                            s_list1.push(XMLIterator.getText());
                                    }
                                }
                                element.setAttr("items", s_list1.slice());
                                element.setAttr("values", s_list2.slice());
                            }
                            element.name = element.getAttrString("name");
                            Object.assign(element.style, this._style);
                            this._elements.push(element);
                        }
                    }
                    break;

                case "p":
                    if (XMLIterator.tagType == XMLTagType.Start) {
                        this.pushStyle();
                        this._style.align = XMLIterator.getAttribute("align");
                        if (!this.isNewLine())
                            this.appendText("\n");
                    }
                    else if (XMLIterator.tagType == XMLTagType.End) {
                        this.appendText("\n");
                        skipNextCR = true;

                        this.popStyle();
                    }
                    break;

                case "ui":
                case "div":
                case "li":
                    if (XMLIterator.tagType == XMLTagType.Start) {
                        if (!this.isNewLine())
                            this.appendText("\n");
                    }
                    else {
                        this.appendText("\n");
                        skipNextCR = true;
                    }
                    break;

                case "html":
                case "body":
                    //full html
                    ignoreWhiteSpace = true;
                    break;

                case "head":
                case "style":
                case "script":
                case "form":
                    if (XMLIterator.tagType == XMLTagType.Start)
                        skipText++;
                    else if (XMLIterator.tagType == XMLTagType.End)
                        skipText--;
                    break;
            }
        }

        if (skipText == 0) {
            text = XMLIterator.getText(ignoreWhiteSpace);
            if (text.length > 0) {
                if (skipNextCR && text[0] == '\n')
                    text = text.substring(1);
                this.appendText(text);
            }
        }

        this._elements = null;
    }

    protected pushStyle() {
        let tf: TextStyle;
        if (this._styleStack.length <= this._styleStackTop) {
            tf = new TextStyle();
            this._styleStack.push(tf);
        }
        else
            tf = this._styleStack[this._styleStackTop];
        Object.assign(tf, this._style);
        this._styleStackTop++;
    }

    protected popStyle() {
        if (this._styleStackTop > 0) {
            let tf = this._styleStack[this._styleStackTop - 1];
            Object.assign(this._style, tf);
            this._styleStackTop--;
        }
    }

    protected isNewLine(): boolean {
        if (this._elements.length > 0) {
            let element: HtmlElement = this._elements[this._elements.length - 1];
            if (element && element.type == HtmlElementType.Text)
                return element.text.endsWith("\n");
            else
                return false;
        }

        return true;
    }

    protected appendText(text: string) {
        let element: HtmlElement;
        if (this._elements.length > 0) {
            element = this._elements[this._elements.length - 1];
            if (element.type == HtmlElementType.Text && equalStyle(element.style, this._style)) {
                element.text += text;
                return;
            }
        }

        element = HtmlElement.getFromPool(HtmlElementType.Text);
        element.text = text;
        Object.assign(element.style, this._style);
        this._elements.push(element);
    }
}

/**
 * @en Compares two `TextStyle` objects to determine if they have the same style properties, ignoring private properties.
 * @param s1 The first text style object to compare.
 * @param s2 The second text style object to compare.
 * @returns `true` if the style properties of both objects are the same, otherwise `false`.
 * @zh 比较两个 `TextStyle` 对象，确定它们是否具有相同的样式属性，忽略私有属性。
 * @param s1 要比较的第一个文本样式对象。
 * @param s2 要比较的第二个文本样式对象。
 * @returns 如果两个对象的样式属性相同，则返回 `true`，否则返回 `false`。
 */
function equalStyle(s1: TextStyle, s2: TextStyle) {
    for (let k in s1) {
        if (!k.startsWith("_") && (<any>s1)[k] != (<any>s2)[k])
            return false;
    }
    return true;
}
