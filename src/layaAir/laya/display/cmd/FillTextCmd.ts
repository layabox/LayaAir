import { Context } from "../../resource/Context";
import { FontInfo } from "../../utils/FontInfo";
import { Pool } from "../../utils/Pool";
import { WordText } from "../../utils/WordText";
import { ILaya } from "../../../ILaya";
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
    x: number = 0;
    /**
     * 开始绘制文本的 y 坐标位置（相对于画布）。
     */
    y: number = 0;

    private _text: string;
    private _wordText: WordText;
    private _font: string;
    private _color: string;
    private _storkColor: string = '#000000';
    private _stork: number;
    private _align: number;
    private _fontObj: FontInfo;

    
    set text(value: string) {
        this._text = value;
    }
    get text() {
        return this._text;
    }
    set storkColor(value: string) {
        this._storkColor = value;
    }
    get storkColor() {
        return this._storkColor;
    }
    set stork(value: number) {
        this._stork = value;
    }
    get stork() {
        return this._stork;
    }
    set align(value: number) {
        this._align = value;
    }
    get align() {
        return this._align;
    }


    static create(text: string | WordText | null, x: number, y: number, font: string, color: string | null, align: string, stork: number, storkColor: string | null): FillTextCmd {
        var cmd: FillTextCmd = Pool.getItemByClass("FillTextCmd", FillTextCmd);
        cmd._text = null;
        cmd._wordText = null;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        cmd._stork = stork;
        cmd._storkColor = storkColor;

        switch (align) {
            case 'center':
                cmd._align = Const.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                cmd._align = Const.ENUM_TEXTALIGN_RIGHT;
                break;
            default:
                cmd._align = Const.ENUM_TEXTALIGN_DEFAULT;
        }

        if (text instanceof WordText) {
            cmd._wordText = text;
            text.cleanCache();
        }
        else
            cmd._text = text;

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
        if (null == this._text) this._text = '';
        if (null == this._fontObj) {
            this.font = null;
        }
        if (null == this._color) {
            this._color = '#ffffff';
        }

        context._fast_filltext(this._wordText || this._text, this.x + gx, this.y + gy, this._fontObj, this._color, this._storkColor, this._stork, this._align);
    }

    /**@private */
    get cmdID(): string {
        return FillTextCmd.ID;
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
}

ClassUtils.regClass("FillTextCmd", FillTextCmd);