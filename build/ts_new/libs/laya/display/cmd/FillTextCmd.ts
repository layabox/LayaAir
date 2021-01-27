import { Context } from "../../resource/Context"
import { ColorUtils } from "../../utils/ColorUtils"
import { FontInfo } from "../../utils/FontInfo"
import { Pool } from "../../utils/Pool"
import { WordText } from "../../utils/WordText"
import { ILaya } from "../../../ILaya";
import { HTMLChar } from "../../utils/HTMLChar";

/**
 * 绘制文字
 */
export class FillTextCmd {
    static ID: string = "FillText";
    private _text: string | WordText|null;
    /**@internal */
    _textIsWorldText = false;
    _words: HTMLChar[]|null;
    /**
     * 开始绘制文本的 x 坐标位置（相对于画布）。
     */
    x: number;
    /**
     * 开始绘制文本的 y 坐标位置（相对于画布）。
     */
    y: number;
    private _font: string;
    private _color: string;
    private _borderColor: string|null;
    private _lineWidth: number;
    private _textAlign: string;
    private _fontColor = 0xffffffff;
    private _strokeColor = 0;
    private static _defFontObj = new FontInfo(null);
    private _fontObj = FillTextCmd._defFontObj;
    private _nTexAlign = 0;

    /**@private */
    static create(text: string | WordText|null, words: HTMLChar[]|null, x: number, y: number, font: string, color: string|null, textAlign: string, lineWidth: number, borderColor: string|null): FillTextCmd {
        var cmd: FillTextCmd = Pool.getItemByClass("FillTextCmd", FillTextCmd);
        cmd.text = text;
        cmd._textIsWorldText = text instanceof WordText;
        cmd._words = words;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        cmd.textAlign = textAlign;
        cmd._lineWidth = lineWidth;
        cmd._borderColor = borderColor;
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
            this._textIsWorldText && ((<WordText>this._text)).cleanCache();
        }
        if (this._words) {
            Context._textRender!.fillWords(context, this._words, this.x + gx, this.y + gy, this._fontObj, this._color, this._borderColor, this._lineWidth);
        } else {
            if (this._textIsWorldText) {// 快速通道
                context._fast_filltext(((<WordText>this._text)), this.x + gx, this.y + gy, this._fontObj, this._color, this._borderColor, this._lineWidth, this._nTexAlign, 0);
            } else {
                Context._textRender!.filltext(context, this._text!, this.x + gx, this.y + gy, this.font, this.color, this._borderColor, this._lineWidth, this._textAlign);
            }
        }
    }

    /**@private */
    get cmdID(): string {
        return FillTextCmd.ID;
    }

    /**
     * 在画布上输出的文本。
     */
    get text(): string | WordText|null {
        return this._text;
    }

    set text(value: string | WordText|null) {
        //TODO 问题。 怎么通知native
        this._text = value;
        this._textIsWorldText = value instanceof WordText;
        this._textIsWorldText && ((<WordText>this._text)).cleanCache();
    }

    /**
     * 定义字号和字体，比如"20px Arial"。
     */
    get font(): string {
        return this._font;
    }

    set font(value: string) {
        this._font = value;
        this._fontObj = FontInfo.Parse(value);
        this._textIsWorldText && ((<WordText>this._text)).cleanCache();
    }

    /**
     * 定义文本颜色，比如"#ff0000"。
     */
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        this._fontColor = ColorUtils.create(value).numColor;
        this._textIsWorldText && ((<WordText>this._text)).cleanCache();
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
                this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
            default:
                this._nTexAlign = ILaya.Context.ENUM_TEXTALIGN_DEFAULT;
        }
        this._textIsWorldText && ((<WordText>this._text)).cleanCache();
    }
}

