import { Pool } from "../../utils/Pool";
import { ClassUtils } from "../../utils/ClassUtils";
import { Config } from "../../../Config";
import { Rectangle } from "../../maths/Rectangle";
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { Browser } from "../../utils/Browser";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";
import { Render2DProcessor } from "../Render2DProcessor";

const className = "FillTextCmd";
const ITALIC_SKEW_RATIO = 0.231; // Math.tan(13 * Math.PI / 180)
const FONT_OVERHANG_RATIO = 0.08;

/**
 * @en Draw text command
 * @zh 绘制文字命令
 */
export class FillTextCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the FillTextCmd
     * @zh 绘制文字命令的标识符
     */
    static readonly ID: string = className;

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
    /**
     * @en Text content
     * @zh 文本内容
     */
    text: string;
    /**
     * @en Text color, e.g., "#ff0000".
     * @zh 文本颜色，比如"#ff0000"。
     */
    color: string = '#ffffff';
    /**
     * @en Stroke color
     * @zh 描边颜色
     */
    strokeColor: string = '#000000';
    /**
     * @en Stroke width
     * @zh 描边宽度
     */
    stroke: number = 0;
    /**
     * @en Text alignment
     * @zh 对齐方式
     */
    align: string = 'left';
    /**
     * @en Font family
     * @zh 字体名称
     */
    fontFamily: string;
    /**
     * @en Font size
     * @zh 字号
     */
    fontSize: number = 20;
    /**
     * @en Whether the text is italic
     * @zh 是否为斜体
     */
    italic: boolean;
    /**
     * @en Whether the text is bold
     * @zh 是否为粗体
     */
    bold: boolean;
    /**
     * @en Whether to render single characters separately
     * @zh 是否单字分开渲染
     */
    singleCharRender: boolean;

    /** 
     * @internal 
     * Text组件已经将宽度计算好了，这里传入可以减少重复测量
     */
    _preMeasuredWidth: number;

    private _font: string;
    private _renderInfo: any;

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
    static create(text: string, x: number, y: number, font: string,
        color?: string, align?: string, stroke?: number, strokeColor?: string): FillTextCmd {
        let cmd = Pool.getItemByClass(className, FillTextCmd);
        cmd.text = null;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color ?? '#ffffff';
        cmd.stroke = stroke ?? 0;
        cmd.strokeColor = strokeColor ?? '#000000';
        cmd.text = text;
        cmd.align = align ?? 'left';
        cmd.singleCharRender = false;
        cmd._preMeasuredWidth = null;

        return cmd;
    }

    /**
     * @deprecated
     * @en Define the font size and font, e.g., "20px Arial".
     * @zh 定义字号和字体，比如"20px Arial"。
     */
    get font(): string {
        if (!this._font)
            this._font = (this.bold ? "bold " : "") + this.fontSize + "px " + (this.fontFamily ? this.fontFamily : Config.defaultFont);
        return this._font;
    }

    set font(value: string) {
        this._font = value;
        if (!value) {
            this.fontFamily = null;
            this.fontSize = Config.defaultFontSize;
            return;
        }

        let words: any[] = value.split(' ');
        let l: number = words.length;
        if (l < 2) {
            if (l == 1) {
                if (words[0].indexOf('px') > 0) {
                    this.fontSize = parseInt(words[0]);
                }
            }
            this.fontFamily = null;
            return;
        }
        let szpos: number = -1;
        //由于字体可能有空格，例如Microsoft YaHei 所以不能直接取倒数第二个，要先找到px
        for (let i = 0; i < l; i++) {
            if (words[i].indexOf('px') > 0 || words[i].indexOf('pt') > 0) {
                szpos = i;
                this.fontSize = parseInt(words[i]);
                if (this.fontSize <= 0) {
                    console.debug('font parse error:' + value);
                    this.fontSize = 20;
                }
                break;
            }
        }

        //最后一个是用逗号分开的family
        let fpos: number = szpos + 1;
        let familys: string = words[fpos];
        fpos++;//下一个
        for (; fpos < l; fpos++) {
            familys += ' ' + words[fpos];
        }
        this.fontFamily = (familys.split(','))[0];
        this.italic = words.indexOf('italic') >= 0;
        this.bold = words.indexOf('bold') >= 0;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        Pool.recover(className, this);
        this._preMeasuredWidth = null;
        if (this._renderInfo)
            Render2DProcessor.runner._textRender.freeRenderInfo(this._renderInfo);
    }

    /**
    * @en The identifier for the FillTextCmd
    * @zh 绘制文字命令的标识符
    */
    get cmdID(): string {
        return FillTextCmd.ID;
    }

    /**
     * @en Execute the drawing text command
     * @param runner The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制文本命令
     * @param runner 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(runner: GraphicsRunner, gx: number, gy: number): void {
        if (!this.text) {
            if (this._renderInfo)
                runner._textRender.freeRenderInfo(this._renderInfo);
            return;
        }

        let tw = this.getTextWidth();
        switch (this.align) {
            case "center":
                gx -= tw / 2;
                break;
            case "right":
                gx -= tw;
                break;
        }

        this._renderInfo = runner._textRender.draw(this.text, this.x + gx, this.y + gy,
            this.fontFamily ? this.fontFamily : Config.defaultFont,
            this.fontSize, this.bold, this.italic,
            this.color, this.stroke, this.strokeColor, this.singleCharRender,
            tw, this._renderInfo
        );
    }

    private getTextWidth(): number {
        if (this._preMeasuredWidth != null) //Text会设置这个，改善性能
            return this._preMeasuredWidth;

        let ctx = Browser.context;
        ctx.font = this.font;
        return ctx.measureText(this.text).width;
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        let tw = this.getTextWidth();
        let x = this.x;
        let y = this.y;
        switch (this.align) {
            case "center":
                x -= tw / 2;
                break;
            case "right":
                x -= tw;
                break;
        }
        //留一些余量
        x -= 4;
        y -= this.fontSize / 2;
        let correctionW = this.fontSize * (FONT_OVERHANG_RATIO + (this.italic ? ITALIC_SKEW_RATIO : 0));
        Rectangle.TEMP.setTo(x, y, tw + 8 + correctionW, this.fontSize * 2).getBoundPoints(assembler.points);
    }

}

ClassUtils.regClass(className, FillTextCmd);
