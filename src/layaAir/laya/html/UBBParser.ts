export interface ITagHandler {
    (tagName: string, end: boolean, attr: string): string;
}

export class UBBParser {
    static defaultParser: UBBParser = new UBBParser();

    private _text: string;
    private _readPos: number = 0;

    protected _handlers: Record<string, ITagHandler>;

    public defaultImgWidth: number = 0;
    public defaultImgHeight: number = 0;
    public lastColor: string;
    public lastSize: string;

    constructor() {
        this._handlers = {};
        this._handlers["url"] = this.onTag_URL;
        this._handlers["img"] = this.onTag_IMG;
        this._handlers["b"] = this.onTag_B;
        this._handlers["i"] = this.onTag_I;
        this._handlers["u"] = this.onTag_U;
        this._handlers["sup"] = this.onTag_Simple;
        this._handlers["sub"] = this.onTag_Simple;
        this._handlers["color"] = this.onTag_COLOR;
        this._handlers["font"] = this.onTag_FONT;
        this._handlers["size"] = this.onTag_SIZE;
    }

    protected onTag_URL(tagName: string, end: boolean, attr: string): string {
        if (!end) {
            if (attr != null)
                return "<a href=\"" + attr + "\">";
            else {
                var href: string = this.getTagText();
                return "<a href=\"" + href + "\">";
            }
        }
        else
            return "</a>";
    }

    protected onTag_IMG(tagName: string, end: boolean, attr: string): string {
        if (!end) {
            var src: string = this.getTagText(true);
            if (!src)
                return null;

            if (this.defaultImgWidth)
                return "<img src=\"" + src + "\" width=\"" + this.defaultImgWidth + "\" height=\"" + this.defaultImgHeight + "\"/>";
            else
                return "<img src=\"" + src + "\"/>";
        }
        else
            return null;
    }

    protected onTag_B(tagName: string, end: boolean, attr: string): string {
        return end ? ("</b>") : ("<b>");
    }

    protected onTag_I(tagName: string, end: boolean, attr: string): string {
        return end ? ("</i>") : ("<i>");
    }

    protected onTag_U(tagName: string, end: boolean, attr: string): string {
        return end ? ("</u>") : ("<u>");
    }

    protected onTag_Simple(tagName: string, end: boolean, attr: string): string {
        return end ? ("</" + tagName + ">") : ("<" + tagName + ">");
    }

    protected onTag_COLOR(tagName: string, end: boolean, attr: string): string {
        if (!end) {
            this.lastColor = attr;
            return "<font color=\"" + attr + "\">";
        }
        else
            return "</font>";
    }

    protected onTag_FONT(tagName: string, end: boolean, attr: string): string {
        if (!end)
            return "<font face=\"" + attr + "\">";
        else
            return "</font>";
    }

    protected onTag_SIZE(tagName: string, end: boolean, attr: string): string {
        if (!end) {
            this.lastSize = attr;
            return "<font size=\"" + attr + "\">";
        }
        else
            return "</font>";
    }

    protected getTagText(remove?: boolean): string {
        var pos1: number = this._readPos;
        var pos2: number;
        var result: string = "";
        while ((pos2 = this._text.indexOf("[", pos1)) != -1) {
            if (this._text.charCodeAt(pos2 - 1) == 92)//\
            {
                result += this._text.substring(pos1, pos2 - 1);
                result += "[";
                pos1 = pos2 + 1;
            }
            else {
                result += this._text.substring(pos1, pos2);
                break;
            }
        }
        if (pos2 == -1)
            return null;

        if (remove)
            this._readPos = pos2;

        return result;
    }

    public parse(text: string, remove?: boolean): string {
        this._text = text;
        this.lastColor = null;
        this.lastSize = null;

        var pos1: number = 0, pos2: number, pos3: number;
        var end: boolean;
        var tag: string, attr: string;
        var repl: string;
        var func: Function;
        var result: string = "";
        while ((pos2 = text.indexOf("[", pos1)) != -1) {
            if (pos2 > 0 && text.charCodeAt(pos2 - 1) == 92)//\
            {
                result += text.substring(pos1, pos2 - 1);
                result += "[";
                pos1 = pos2 + 1;
                continue;
            }

            result += text.substring(pos1, pos2);
            pos1 = pos2;
            pos2 = text.indexOf("]", pos1);
            if (pos2 == -1)
                break;

            end = text.charAt(pos1 + 1) == '/';
            tag = text.substring(end ? pos1 + 2 : pos1 + 1, pos2);
            this._readPos = pos2 + 1;
            attr = null;
            repl = null;
            pos3 = tag.indexOf("=");
            if (pos3 != -1) {
                attr = tag.substring(pos3 + 1);
                tag = tag.substring(0, pos3);
            }
            tag = tag.toLowerCase();
            func = this._handlers[tag];
            if (func != null) {
                if (!remove) {
                    repl = func.call(this, tag, end, attr);
                    if (repl != null)
                        result += repl;
                }
            }
            else
                result += text.substring(pos1, this._readPos);
            pos1 = this._readPos;
        }

        if (pos1 < text.length)
            result += text.substring(pos1);

        this._text = null;

        return result;
    }
}