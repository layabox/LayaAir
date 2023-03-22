import { Context } from "../../resource/Context";
import { FontInfo } from "../../utils/FontInfo";
import { Pool } from "../../utils/Pool";
import { WordText } from "../../utils/WordText";
import { ILaya } from "../../../ILaya";
import { HTMLChar } from "../../utils/HTMLChar";
import { Const } from "../../Const";
import { ClassUtils } from "../../utils/ClassUtils";
import { Config } from "../../../Config";

/**
 * 绘制文字
 */
export class FillTextCmd {
    static ID: string = "FillText";

    /**
     * 开始绘制文本的 x 坐标位置（相对于画布）。
     */
    x: number;
    /**
     * 开始绘制文本的 y 坐标位置（相对于画布）。
     */
    y: number;

    private _text: string;
    private _wordText: WordText;
    private _words: HTMLChar[] | null;
    private _font: string;
    private _color: string;
    private _borderColor: string | null;
    private _lineWidth: number;
    private _textAlign: string;
    private _fontObj: FontInfo;
    private _nTexAlign = 0;

    static create(text: string | WordText | null, words: HTMLChar[] | null, x: number, y: number, font: string, color: string | null, textAlign: string, lineWidth: number, borderColor: string | null): FillTextCmd {
        var cmd: FillTextCmd = Pool.getItemByClass("FillTextCmd", FillTextCmd);
        cmd.text = null;
        cmd._wordText = null;
        cmd._words = words;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        cmd.textAlign = textAlign;
        cmd._lineWidth = lineWidth;
        cmd._borderColor = borderColor;

        if (text instanceof WordText) {
            cmd._wordText = text;
            text.cleanCache();
        }
        else
            cmd.text = text;

        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {

        Pool.recover("FillTextCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        if (ILaya.stage.isGlobalRepaint()) {
            this._wordText && this._wordText.cleanCache();
        }
        if (this._words) {
            context.fillWords11(this._words, this.x + gx, this.y + gy, this._fontObj, this._color, this._borderColor, this._lineWidth);
        } else if (this._wordText) {// 快速通道
            context._fast_filltext(this._wordText, this.x + gx, this.y + gy, this._fontObj, this._color, this._borderColor, this._lineWidth, this._nTexAlign, 0);
        } else {
            context.filltext11(this._text!, this.x + gx, this.y + gy, this._fontObj._font, this.color, this._borderColor, this._lineWidth, this._textAlign);
        }
    }

    /**@private */
    get cmdID(): string {
        return FillTextCmd.ID;
    }

    /**
     * 在画布上输出的文本。
     */
    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
        this._wordText = null;
    }

    /**
     * 定义字号和字体，比如"20px Arial"。
     */
    get font(): string {
        return this._font;
    }

    set font(value: string) {
        this._font = value;
        if (!value)
            value = Config.defaultFontSize + "px " + Config.defaultFont;
        this._fontObj = FontInfo.parse(value);
        this._wordText && this._wordText.cleanCache();
    }

    /**
     * 定义文本颜色，比如"#ff0000"。
     */
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        this._wordText && this._wordText.cleanCache();
    }

    /**
     * 文本对齐方式，可选值："left"，"center"，"right"。
     */
    get textAlign(): string {
        return this._textAlign;
    }

    set textAlign(value: string) {
        this._textAlign = value;
        switch (value) {
            case 'center':
                this._nTexAlign = Const.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                this._nTexAlign = Const.ENUM_TEXTALIGN_RIGHT;
                break;
            default:
                this._nTexAlign = Const.ENUM_TEXTALIGN_DEFAULT;
        }
        this._wordText && this._wordText.cleanCache();
    }
}

ClassUtils.regClass("FillTextCmd", FillTextCmd);