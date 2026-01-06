/**
 * @en Text style class
 * @zh 文本的样式类
 */
export class TextStyle {
    /**
     * @en Font
     * @zh 字体
     */
    font = "";
    /**
     * @en Font size
     * @zh 字号
     */
    fontSize = 12;
    /**
     * @en Text color
     * @zh 文字颜色
     */
    color = "#000000";
    /**
     * @en Whether the text is bold
     * @zh 是否为粗体
     */
    bold = false;
    /**
     * @en Whether the text is italic
     * @zh 是否为斜体
     */
    italic = false;

    /**
     * @en Whether to show underline
     * @zh 是否显示下划线
     */
    underline = false;
    /**
     * @en Underline color
     * @zh 下划线颜色
     */
    underlineColor: string;

    /**
     * @en Whether to display the strikethrough.
     * @zh 是否显示删除线。
     */
    strikethrough = false;

    /**
     * @en The color of the strikethrough.
     * @zh 删除线颜色。
     */
    strikethroughColor: string;

    /**
     * @en Indicates the horizontal alignment of text paragraphs using this text format
     * @zh 表示使用此文本格式的文本段落的水平对齐方式
     * @default "left"
     */
    align = 'left';

    /**
     * @en Indicates the vertical alignment of text paragraphs using this text format
     * @zh 表示使用此文本格式的文本段落的垂直对齐方式
     */
    valign = 'top';

    /**
     * @en Alignment of images and text in mixed content. Possible values are top, middle, bottom
     * @zh 图文混排时图片和文字的对齐方式。可选值是top, middle, bottom
     */
    alignItems = "middle";

    /**
     * @en Vertical line spacing (in pixels)
     * @zh 垂直行间距（以像素为单位）
     */
    leading = 2;

    /**
     * @en Letter spacing
     * @zh 字间距
     */
    letterSpacing = 0;

    /**
     * @en Stroke width (in pixels). Default is 0, meaning no stroke
     * @zh 描边宽度（以像素为单位）。默认值0，表示不描边
     */
    stroke = 0;
    /**
     * @en Stroke color, represented as a string
     * @zh 描边颜色，以字符串表示
     */
    strokeColor = '#000000';

    /** 
     * @en Shadow offset in the x direction
     * @zh 阴影在x方向的偏移量
     */
    shadowOffsetX: number = 0;
    /** 
     * @en Shadow offset in the y direction
     * @zh 阴影在y方向的偏移量
     */
    shadowOffsetY: number = 0;
    /** 
     * @en Shadow blur radius
     * @zh 阴影模糊半径
     */
    shadowBlur: number = 0;
    /** 
     * @en Shadow color
     * @zh 阴影颜色
     */
    shadowColor: string = '#000000';
}

