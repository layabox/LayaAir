import { Context } from "../../renders/Context";
import { FontInfo } from "../../utils/FontInfo";
import { Pool } from "../../utils/Pool";
import { WordText } from "../../utils/WordText";
import { ILaya } from "../../../ILaya";
import { Const } from "../../Const";
import { ClassUtils } from "../../utils/ClassUtils";
import { Config } from "../../../Config";

/**
 * @en Draw text command
 * @zh 绘制文字命令
 */
export class FillTextCmd {
    /**
     * @en Identifier for the FillTextCmd
     * @zh 绘制文字命令的标识符
     */
    static ID: string = "FillText";

    /**
     * @en The x position of the start of the text (relative to the canvas).
     * @zh 开始绘制文本的 x 坐标位置（相对于画布）。
     */
    x: number = 0;
    /**
     * @en The y position of the start of the text (relative to the canvas).    
     * @zh 开始绘制文本的 y 坐标位置（相对于画布）。
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

    /**
     * @en Text content
     * @zh 文本内容
     */
    get text() {
        return this._text;
    }
    set text(value: string) {
        this._text = value;
    }

    /**
     * @en Stroke color
     * @zh 描边颜色
     */
    get strokeColor() {
        return this._strokeColor;
    }
    set strokeColor(value: string) {
        this._strokeColor = value;
    }

    /**
     * @en Stroke width
     * @zh 描边宽度
     */
    get stroke() {
        return this._stroke;
    }
    set stroke(value: number) {
        this._stroke = value;
    }

    /**
     * @en Text alignment
     * @zh 对齐方式
     */
    get align() {
        return this._align;
    }
    set align(value: number) {
        this._align = value;
    }

    /**
     * @en Create a FillTextCmd instance
     * @param text Text content
     * @param x X position
     * @param y Y position
     * @param font Font
     * @param color Text color
     * @param align Alignment
     * @param stroke Stroke width
     * @param strokeColor Stroke color
     * @returns FillTextCmd instance
     * @zh 创建绘制文本的命令的实例
     * @param text 文本内容
     * @param x x位置
     * @param y y位置
     * @param font 字体
     * @param color 文本颜色
     * @param align 对齐方式
     * @param stroke 描边宽度
     * @param strokeColor 描边颜色
     * @returns 绘制文本的命令实例
     */
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
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        Pool.recover("FillTextCmd", this);
    }

    /**
     * @private
     * @en Execute the drawing text command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制文本命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
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

    /**
     * @private
     * @en The identifier for the FillTextCmd
     * @zh 绘制文字命令的标识符
     */
    get cmdID(): string {
        return FillTextCmd.ID;
    }

    /**
     * @en Define the font size and font, e.g., "20px Arial".
     * @zh 定义字号和字体，比如"20px Arial"。
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
     * @en Define the text color, e.g., "#ff0000".
     * @zh 定义文本颜色，比如"#ff0000"。
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