import { XMLUtils } from "./XMLUtils";

export enum XMLTagType {
    Start,
    End,
    Void,
    CDATA,
    Comment,
    Instruction
};

const CDATA_START = "<![CDATA[";
const CDATA_END = "]]>";
const COMMENT_START = "<!--";
const COMMENT_END = "-->";

export class XMLIterator {
    public static tagName: string;
    public static tagType: XMLTagType;
    public static lastTagName: string;

    static source: string;
    static sourceLen: number;
    static parsePos: number;
    static tagPos: number;
    static tagLength: number;
    static lastTagEnd: number;
    static attrParsed: boolean;
    static lowerCaseName: boolean;

    private static _attrs: any = {};

    public static begin(source: string, lowerCaseName?: boolean) {
        XMLIterator.source = source;
        XMLIterator.lowerCaseName = lowerCaseName;
        this.sourceLen = source.length;
        this.parsePos = 0;
        this.lastTagEnd = 0;
        this.tagPos = 0;
        this.tagLength = 0;
        this.tagName = null;
    }

    public static nextTag(): boolean {
        let pos: number;
        let c: string;
        let buffer = "";

        this.tagType = XMLTagType.Start;
        this.lastTagEnd = this.parsePos;
        this.attrParsed = false;
        this.lastTagName = this.tagName;

        while ((pos = this.source.indexOf('<', this.parsePos)) != -1) {
            this.parsePos = pos;
            pos++;

            if (pos == this.sourceLen)
                break;

            c = this.source[pos];
            if (c == '!') {
                if (this.sourceLen > pos + 7 && this.source.substring(pos - 1, pos + 8) == CDATA_START) {
                    pos = this.source.indexOf(CDATA_END, pos);
                    this.tagType = XMLTagType.CDATA;
                    this.tagName = "";
                    this.tagPos = this.parsePos;
                    if (pos == -1)
                        this.tagLength = this.sourceLen - this.parsePos;
                    else
                        this.tagLength = pos + 3 - this.parsePos;
                    this.parsePos += this.tagLength;
                    return true;
                }
                else if (this.sourceLen > pos + 2 && this.source.substring(pos - 1, pos + 3) == COMMENT_START) {
                    pos = this.source.indexOf(COMMENT_END, pos);
                    this.tagType = XMLTagType.Comment;
                    this.tagName = "";
                    this.tagPos = this.parsePos;
                    if (pos == -1)
                        this.tagLength = this.sourceLen - this.parsePos;
                    else
                        this.tagLength = pos + 3 - this.parsePos;
                    this.parsePos += this.tagLength;
                    return true;
                }
                else {
                    pos++;
                    this.tagType = XMLTagType.Instruction;
                }
            }
            else if (c == '/') {
                pos++;
                this.tagType = XMLTagType.End;
            }
            else if (c == '?') {
                pos++;
                this.tagType = XMLTagType.Instruction;
            }

            for (; pos < this.sourceLen; pos++) {
                c = this.source[pos];
                if (' \t\n\r\v'.indexOf(c) != -1 || c == '>' || c == '/')
                    break;
            }
            if (pos == this.sourceLen)
                break;

            buffer += this.source.substring(this.parsePos + 1, pos);
            if (buffer.length > 0 && buffer[0] == '/')
                buffer = buffer.substring(1);

            let singleQuoted: boolean = false, doubleQuoted: boolean = false;
            let possibleEnd: number = -1;
            for (; pos < this.sourceLen; pos++) {
                c = this.source[pos];
                if (c == '"') {
                    if (!singleQuoted)
                        doubleQuoted = !doubleQuoted;
                }
                else if (c == '\'') {
                    if (!doubleQuoted)
                        singleQuoted = !singleQuoted;
                }

                if (c == '>') {
                    if (!(singleQuoted || doubleQuoted)) {
                        possibleEnd = -1;
                        break;
                    }

                    possibleEnd = pos;
                }
                else if (c == '<')
                    break;
            }
            if (possibleEnd != -1)
                pos = possibleEnd;

            if (pos == this.sourceLen)
                break;

            if (this.source[pos - 1] == '/')
                this.tagType = XMLTagType.Void;

            this.tagName = buffer;
            if (this.lowerCaseName)
                this.tagName = this.tagName.toLowerCase();
            this.tagPos = this.parsePos;
            this.tagLength = pos + 1 - this.parsePos;
            this.parsePos += this.tagLength;

            return true;
        }

        this.tagPos = this.sourceLen;
        this.tagLength = 0;
        this.tagName = null;
        return false;
    }

    public static getTagSource(): string {
        return this.source.substring(this.tagPos, this.tagPos + this.tagLength);
    }

    public static getRawText(trim?: boolean) {
        if (this.lastTagEnd == this.tagPos)
            return "";
        else if (trim) {
            let i = this.lastTagEnd;
            for (; i < this.tagPos; i++) {
                let c = this.source[i];
                if (' \t\n\r\v'.indexOf(c) == -1)
                    break;
            }

            if (i == this.tagPos)
                return "";
            else
                return this.source.substring(i, this.tagPos).trim();
        }
        else
            return this.source.substring(this.lastTagEnd, this.tagPos);
    }

    public static getText(trim?: boolean): string {
        if (this.lastTagEnd == this.tagPos)
            return "";
        else if (trim) {
            let i = this.lastTagEnd;
            for (; i < this.tagPos; i++) {
                let c = this.source[i];
                if (' \t\n\r\v'.indexOf(c) == -1)
                    break;
            }

            if (i == this.tagPos)
                return "";
            else
                return XMLUtils.decodeString(this.source.substring(i, this.tagPos)).trimEnd();
        }
        else
            return XMLUtils.decodeString(this.source.substring(this.lastTagEnd, this.tagPos));
    }

    public static get attributes() {
        if (!this.attrParsed) {
            for (let key in this._attrs) {
                delete this._attrs[key];
            }
            this.parseAttributes(this._attrs);
            this.attrParsed = true;
        }

        return this._attrs;
    }

    public static getAttribute(attrName: string): string {
        return this.attributes[attrName];
    }

    static parseAttributes(attrs: any) {
        let attrName: string;
        let valueStart: number = 0;
        let valueEnd: number = 0;
        let waitValue: boolean = false;
        let quoted: number = 0;
        let buffer: string = "";
        let i = this.tagPos;
        let attrEnd = this.tagPos + this.tagLength;

        if (i < attrEnd && this.source[i] == '<') {
            for (; i < attrEnd; i++) {
                let c = this.source[i];
                if (' \t\n\r\v'.indexOf(c) != -1 || c == '>' || c == '/')
                    break;
            }
        }

        for (; i < attrEnd; i++) {
            let c: string = this.source[i];
            if (c == '=') {
                valueStart = -1;
                valueEnd = -1;
                quoted = 0;
                for (let j = i + 1; j < attrEnd; j++) {
                    let c2 = this.source[j];
                    if (' \t\n\r\v'.indexOf(c2) != -1) {
                        if (valueStart != -1 && quoted == 0) {
                            valueEnd = j - 1;
                            break;
                        }
                    }
                    else if (c2 == '>') {
                        if (quoted == 0) {
                            valueEnd = j - 1;
                            break;
                        }
                    }
                    else if (c2 == '"') {
                        if (valueStart != -1) {
                            if (quoted != 1) {
                                valueEnd = j - 1;
                                break;
                            }
                        }
                        else {
                            quoted = 2;
                            valueStart = j + 1;
                        }
                    }
                    else if (c2 == '\'') {
                        if (valueStart != -1) {
                            if (quoted != 2) {
                                valueEnd = j - 1;
                                break;
                            }
                        }
                        else {
                            quoted = 1;
                            valueStart = j + 1;
                        }
                    }
                    else if (valueStart == -1) {
                        valueStart = j;
                    }
                }

                if (valueStart != -1 && valueEnd != -1) {
                    attrName = buffer;
                    if (this.lowerCaseName)
                        attrName = attrName.toLowerCase();
                    buffer = "";
                    attrs[attrName] = XMLUtils.decodeString(this.source.substring(valueStart, valueEnd + 1));
                    i = valueEnd + 1;
                }
                else
                    break;
            }
            else if (' \t\n\r\v'.indexOf(c) == -1) {
                if (waitValue || c == '/' || c == '>') {
                    if (buffer.length > 0) {
                        attrName = buffer;
                        if (this.lowerCaseName)
                            attrName = attrName.toLowerCase();
                        attrs[attrName] = "";
                        buffer = "";
                    }

                    waitValue = false;
                }

                if (c != '/' && c != '>')
                    buffer += c;
            }
            else {
                if (buffer.length > 0)
                    waitValue = true;
            }
        }
    }
}