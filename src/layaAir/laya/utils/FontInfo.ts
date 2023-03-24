export class FontInfo {

    static EMPTY: FontInfo = new FontInfo(null);

    private static _cache: any = {};
    private static _gfontID: number = 0;
    private static _lastFont: string = '';
    private static _lastFontInfo: FontInfo;

    /**
     * 解析字体模型
     * @param font 
     */
    static parse(font: string): FontInfo {
        if (font === FontInfo._lastFont) {
            return FontInfo._lastFontInfo;
        }
        var r: FontInfo = FontInfo._cache[font];
        if (!r) {
            r = FontInfo._cache[font] = new FontInfo(font);
        }
        FontInfo._lastFont = font;
        FontInfo._lastFontInfo = r;
        return r;
    }

    /**@internal */
    _id: number;
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
        this._id = FontInfo._gfontID++;
        this.setFont(font || "14px Arial");
    }

    /**
     * 设置字体格式
     * @param value 
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
                    console.error('font parse error:' + value);
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

