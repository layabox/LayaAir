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
    private _strokeColor: string = '#000000';
    private _stroke: number;
    private _align: number;
    private _fontObj: FontInfo;

    
    set text(value: string) {
        this._text = value;
    }
    get text() {
        return this._text;
    }
    set strokeColor(value: string) {
        this._strokeColor = value;
    }
    get strokeColor() {
        return this._strokeColor;
    }
    set stroke(value: number) {
        this._stroke = value;
    }
    get stroke() {
        return this._stroke;
    }
    set align(value: number) {
        this._align = value;
    }
    get align() {
        return this._align;
    }


    static create(text: string | WordText | null, x: number, y: number, font: string, color: string | null, align: string, stroke: number, strokeColor: string | null): FillTextCmd {
        var cmd: FillTextCmd = Pool.getItemByClass("FillTextCmd", FillTextCmd);
        cmd._text = null;
        cmd._wordText = null;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        cmd._stroke = stroke;
        cmd._strokeColor = strokeColor;

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

        context._fast_filltext(this._wordText || this._text, this.x + gx, this.y + gy, this._fontObj, this._color, this._strokeColor, this._stroke, this._align);
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