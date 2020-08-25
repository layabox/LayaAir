
/**
 * <code>Styles</code> 定义了组件常用的样式属性。
 */
export class Styles {

    /**
     * 默认九宫格信息。
     * @see laya.ui.AutoBitmap#sizeGrid
     */
    static defaultSizeGrid: any[] = [4, 4, 4, 4, 0];

    //-----------------Label-----------------
    /**
     * 标签颜色。
     */
    static labelColor: string = "#000000";
    /**
     * 标签的边距。
     * <p><b>格式：</b>[上边距，右边距，下边距，左边距]。</p>
     */
    static labelPadding: any[] = [2, 2, 2, 2];

    /**
     * 标签的边距。
     * <p><b>格式：</b>[上边距，右边距，下边距，左边距]。</p>
     */
    static inputLabelPadding: any[] = [1, 1, 1, 3];

    //-----------------Button-----------------
    /**
     * 按钮皮肤的状态数，支持1,2,3三种状态值。
     */
    static buttonStateNum: number = 3;
    /**
     * 按钮标签颜色。
     * <p><b>格式：</b>[upColor,overColor,downColor,disableColor]。</p>
     */
    static buttonLabelColors: any[] = ["#32556b", "#32cc6b", "#ff0000", "#C0C0C0"];

    //-----------------ComboBox-----------------
    /**
     * 下拉框项颜色。
     * <p><b>格式：</b>[overBgColor,overLabelColor,outLabelColor,borderColor,bgColor]。</p>
     */
    static comboBoxItemColors: any[] = ["#5e95b6", "#ffffff", "#000000", "#8fa4b1", "#ffffff"];

    //-----------------ScrollBar-----------------
    /**
     * 滚动条的最小值。
     */
    static scrollBarMinNum: number = 15;
    /**
     * 长按按钮，等待时间，使其可激活连续滚动。
     */
    static scrollBarDelayTime: number = 500;
}


//ILaya.regClass(Styles);    