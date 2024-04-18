/**
 * 文本的样式类
 */
export class TextStyle {
    /**字体*/
    font="";
    /**字号*/
    fontSize=12;
    /**文字颜色*/
    color = "#000000";
    /**是否为粗体*/
    bold = false;
    /**
     * 表示使用此文本格式的文本是否为斜体。
     */
    italic = false;

    /**是否显示下划线*/
    underline = false;
    /**下划线颜色*/
    underlineColor:string = null;

    /**
     * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
     * @default  "left"
     */
    align='left';

    /**
     * <p>表示使用此文本格式的文本段落的垂直对齐方式。</p>
     * @default  "top"
     */
    valign='top';

    /**
     * 图文混排时图片和文字的对齐方式。可选值是top,middle,bottom
     */
    alignItems: string;

    /**
     * <p>垂直行间距（以像素为单位）</p>
     */
    leading = 2;

    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @default 0
     */
    stroke = 0;
    /**
     * <p>描边颜色，以字符串表示。</p>
     * @default "#000000";
     */
    strokeColor = '#000000';

    strikethrough: boolean;

    constructor() {
        this.font = "";
        this.fontSize = 12;
        this.color = "#000000";
        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.underlineColor = null;
        this.align = "left";
        this.valign = "top";
        this.alignItems = "middle";
        this.leading = 2;
        this.stroke = 0;
        this.strokeColor = "#000000";
    }
}

