import { XMLUtils } from "./XMLUtils";

/**
 * @en The tag type of XML.　　
 * @zh XML 的标签类型
 */
export enum XMLTagType {
    /**
     * @en Represents the start of an XML element.
     * @zh 表示XML元素的开始。
     */
    Start,
    /**
     * @en Represents the end of an XML element.
     * @zh 表示XML元素的结束。
     */
    End,
    /**
     * @en Represents a void XML element (self-closing tag).
     * @zh 表示空的XML元素（自闭合标签）。
     */
    Void,
    /**
     * @en Represents a CDATA section in XML.
     * @zh 表示XML中的CDATA部分。
     */
    CDATA,
    /**
     * @en Represents an XML comment.
     * @zh 表示XML注释。
     */
    Comment,
    /**
     * @en Represents an XML processing instruction.
     * @zh 表示XML处理指令。
     */
    Instruction
};

const CDATA_START = "<![CDATA[";
const CDATA_END = "]]>";
const COMMENT_START = "<!--";
const COMMENT_END = "-->";

/**
 * @en XMLIterator class for parsing XML strings.
 * @zh XML迭代器类，用于解析XML字符串。
 */
export class XMLIterator {
    /**
     * @en The name of the current XML tag.
     * @zh 当前XML标签的名称。
     */
    public static tagName: string;
    /**
     * @en The type of the current XML tag.
     * @zh 当前XML标签的类型。
     */
    public static tagType: XMLTagType;
    /**
     * @en The name of the last processed XML tag.
     * @zh 上一个处理的XML标签的名称。
     */
    public static lastTagName: string;

    /**
     * @en The source XML string being parsed.
     * @zh 正在解析的源XML字符串。
     */
    static source: string;
    /**
     * @en The length of the source XML string.
     * @zh 源XML字符串的长度。
     */
    static sourceLen: number;
    /**
     * @en The current parsing position in the source string.
     * @zh 源字符串中的当前解析位置。
     */
    static parsePos: number;
    /**
     * @en The starting position of the current tag in the source string.
     * @zh 当前标签在源字符串中的起始位置。
     */
    static tagPos: number;
    /**
     * @en The length of the current tag.
     * @zh 当前标签的长度。
     */
    static tagLength: number;
    /**
     * @en The ending position of the last processed tag.
     * @zh 上一个处理的标签的结束位置。
     */
    static lastTagEnd: number;
    /**
     * @en Indicates whether attributes have been parsed.
     * @zh 指示是否已解析属性。
     */
    static attrParsed: boolean;
    /**
     * @en Indicates whether tag names should be converted to lowercase.
     * @zh 指示是否应将标签名称转换为小写。
     */
    static lowerCaseName: boolean;

    private static _attrs: any = {};

    /**
     * @en Initialize the XMLIterator with a source string.
     * @param source The XML string to parse.
     * @param lowerCaseName Optional. Whether to convert tag names to lowercase.
     * @zh 使用源字符串初始化XMLIterator。
     * @param source 要解析的XML字符串。
     * @param lowerCaseName 可选。是否将标签名称转换为小写。
     */
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

    /**
     * @en Parses through the XML source to find the next tag and updates the iterator's state accordingly.
     * @returns Returns true if a new tag is found; otherwise, false if the end of the source is reached.
     * @zh 解析XML源，查找下一个标签并相应地更新迭代器的状态。
     * @returns 如果找到新标签则返回true；如果到达源的末尾则返回false。
     */
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

    /**
     * @en Get the source of the current XML tag.
     * @returns The source of the current XML tag.
     * @zh 获取当前XML标签的源代码。
     * @returns 当前XML标签的源代码。
     */
    public static getTagSource(): string {
        return this.source.substring(this.tagPos, this.tagPos + this.tagLength);
    }

    /**
     * @en Gets the raw text between the last tag end and the current tag position.
     * @param trim Whether to trim the whitespace characters at the beginning and end of the text.
     * @returns The raw text, trimmed if specified.
     * @zh 获取上一个标签结束和当前标签位置之间的原始文本。
     * @param trim 是否去除文本首尾的空白字符。
     * @returns 返回的原始文本，如果指定则去除首尾空白。
     */
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

    /**
     * @en Get the decoded text between XML tags, optionally trimmed.
     * @param trim Whether to trim the whitespace at the beginning and end of the text. Default is false.
     * @returns The decoded text between XML tags.
     * @zh 获取XML标签之间的解码文本，可选择是否去除首尾空白字符。
     * @param trim 是否去除文本开头和结尾的空白字符。默认为false。
     * @returns XML标签之间的解码文本。
     */
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

    /**
     * @en The parsed attributes of the current tag.
     * @zh 当前标签解析后的属性。
     */
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

    /**
     * @en Gets the value of the specified attribute from the current tag.
     * @param attrName The name of the attribute to get.
     * @returns The value of the attribute.
     * @zh 从当前标签获取指定属性的值。
     * @param attrName 要获取的属性名称。
     * @returns 返回属性的值。
     */
    public static getAttribute(attrName: string): string {
        return this.attributes[attrName];
    }

    /**
     * @en Parses the attributes from the source text.
     * @param attrs The object to store the parsed attributes.
     * @zh 从源文本解析属性。
     * @param attrs 存储解析后属性的对象。
     */
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

if (!String.prototype.trimEnd) {
    String.prototype.trimEnd = function (this: string) {
        return this.replace(/\s+$/g, "");
    }
}