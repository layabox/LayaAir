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

    strikethrough = false;
}

