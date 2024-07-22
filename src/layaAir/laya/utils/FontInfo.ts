/**
 * @en Set the font format and parse the fontInfo.
 * @zh 设置字体格式与解析字体模型。
 */
export class FontInfo {

    private static _cache: Record<string, FontInfo> = {};

    /**
     * @en Parses a font string into a FontInfo object.
     * @param font The font string to parse.
     * @zh 解析字体字符串为 FontInfo 对象。
     * @param font 要解析的字体字符串
     */
    static parse(font: string): FontInfo {
        if (font === _lastFont) {
            return _lastFontInfo;
        }
        let r = FontInfo._cache[font];
        if (!r) {
            r = FontInfo._cache[font] = new FontInfo(font);
        }
        _lastFont = font;
        _lastFontInfo = r;
        return r;
    }

    /**@internal */
    _font: string;
    /**@internal */
    _family: string = "Arial";
    /**@internal */
    _size: number = 14;
    /**@internal */
    _italic: boolean = false;
    /**@internal */
    _bold: boolean = false;

    constructor(font: string | null) {
        this.setFont(font || "14px Arial");
    }

    /**
     * @en Sets the font format based on the given value string.
     * @param value The font value string to set.
     * @zh 根据给定的值字符串设置字体格式。
     * @param value 要设置的字体值字符串。
     */
    setFont(value: string): void {
        this._font = value;
        var words: any[] = value.split(' ');
        var l: number = words.length;
        if (l < 2) {
            if (l == 1) {
                if (words[0].indexOf('px') > 0) {
                    this._size = parseInt(words[0]);
                }
            }
            return;
        }
        var szpos: number = -1;
        //由于字体可能有空格，例如Microsoft YaHei 所以不能直接取倒数第二个，要先找到px
        for (let i = 0; i < l; i++) {
            if (words[i].indexOf('px') > 0 || words[i].indexOf('pt') > 0) {
                szpos = i;
                this._size = parseInt(words[i]);
                if (this._size <= 0) {
                    console.debug('font parse error:' + value);
                    this._size = 14;
                }
                break;
            }
        }

        //最后一个是用逗号分开的family
        var fpos: number = szpos + 1;
        var familys: string = words[fpos];
        fpos++;//下一个
        for (; fpos < l; fpos++) {
            familys += ' ' + words[fpos];
        }
        this._family = (familys.split(','))[0];
        this._italic = words.indexOf('italic') >= 0;
        this._bold = words.indexOf('bold') >= 0;
    }
}

var _lastFont: string = '';
var _lastFontInfo: FontInfo;