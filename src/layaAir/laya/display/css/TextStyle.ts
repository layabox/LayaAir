/**
 * 文本的样式类
 */
export class TextStyle {
    /**字体*/
    font: string;
    /**字号*/
    fontSize: number;
    /**文字颜色*/
    color: string;
    /**是否为粗体*/
    bold: boolean;
    /**
     * 表示使用此文本格式的文本是否为斜体。
     * @default false
     */
    italic: boolean;

    /**是否显示下划线*/
    underline: boolean;
    /**下划线颜色*/
    underlineColor: string;

    /**是否显示删除线 */
    strikethrough = false;
    /** 删除线颜色 */
    strikethroughColor:string = null;

    /**
     * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
     * @default  "left"
     */
    align: string;

    /**
     * <p>表示使用此文本格式的文本段落的垂直对齐方式。</p>
     * @default  "top"
     */
    valign: string;

    /**
     * 图文混排时图片和文字的对齐方式。可选值是top,middle,bottom
     */
    alignItems: string;

    /**
     * <p>垂直行间距（以像素为单位）</p>
     */
    leading: number;

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

