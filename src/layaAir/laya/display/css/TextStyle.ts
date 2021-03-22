import { SpriteStyle } from "./SpriteStyle";
import { BitmapFont } from "../BitmapFont"
import { Sprite } from "../Sprite"
import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 文本的样式类
 */
export class TextStyle extends SpriteStyle {
    /**
    * 一个已初始化的 <code>TextStyle</code> 实例。
    */
    static EMPTY: TextStyle = new TextStyle();
    /**
     * 表示使用此文本格式的文本是否为斜体。
     * @default false
     */
    italic: boolean = false;
    /**
     * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
     * @default  "left"
     */
    align: string;
    /**
     * <p>表示使用此文本格式的文本字段是否自动换行。</p>
     * 如果 wordWrap 的值为 true，则该文本字段自动换行；如果值为 false，则该文本字段不自动换行。
     * @default false。
     */
    wordWrap: boolean;
    /**
     * <p>垂直行间距（以像素为单位）</p>
     */
    leading: number;
    /**
     * <p>默认边距信息</p>
     * <p>[左边距，上边距，右边距，下边距]（边距以像素为单位）</p>
     */
    padding: any[];
    /**
     * 文本背景颜色，以字符串表示。
     */
    bgColor: string|null;
    /**
     * 文本边框背景颜色，以字符串表示。
     */
    borderColor: string|null;
    /**
     * <p>指定文本字段是否是密码文本字段。</p>
     * 如果此属性的值为 true，则文本字段被视为密码文本字段，并使用星号而不是实际字符来隐藏输入的字符。如果为 false，则不会将文本字段视为密码文本字段。
     */
    asPassword: boolean;
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @default 0
     */
    stroke: number;
    /**
     * <p>描边颜色，以字符串表示。</p>
     * @default "#000000";
     */
    strokeColor: string;
    /**是否为粗体*/
    bold: boolean;
    /**是否显示下划线*/
    underline: boolean;
    /**下划线颜色*/
    underlineColor: string|null;
    /**当前使用的位置字体。*/
    currBitmapFont: BitmapFont|null;
    /**
     * @override
     */
    reset(): SpriteStyle {
        super.reset();
        this.italic = false;
        this.align = "left";
        this.wordWrap = false;
        this.leading = 0;
        this.padding = [0, 0, 0, 0];
        this.bgColor = null;
        this.borderColor = null;
        this.asPassword = false;
        this.stroke = 0;
        this.strokeColor = "#000000";
        this.bold = false;
        this.underline = false;
        this.underlineColor = null;
        this.currBitmapFont = null;
        return this;
    }
    /**
     * @override
     */
    recover(): void {
        if (this === TextStyle.EMPTY)
            return;
        Pool.recover("TextStyle", this.reset());
    }

    /**
     * 从对象池中创建
     */
    static create(): TextStyle {
        return Pool.getItemByClass("TextStyle", TextStyle);
    }

    /**@inheritDoc	 */
    render(sprite: Sprite, context: Context, x: number, y: number): void {
		(this.bgColor || this.borderColor) && context.drawRect(x-this.pivotX, y-this.pivotY, sprite.width, sprite.height, this.bgColor, this.borderColor, 1);
    }
}

