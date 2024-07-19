
/**
 * @en The `Styles` class defines common style properties used by components.
 * @zh Styles 定义了组件常用的样式属性。
 */
export class Styles {

    /**
     * @en Default nine-slice grid information.
     * @zh 默认九宫格信息。
     * @see laya.ui.AutoBitmap#sizeGrid
     */
    static defaultSizeGrid: any[] = [4, 4, 4, 4, 0];

    //-----------------Label-----------------
    /**
     * @en The color of the label text.
     * @zh 标签颜色。
     */
    static labelColor: string = "#000000";
    /**
     * @en The padding of the label, in pixels. Defined as [top, right, bottom, left].
     * @zh 标签的边距，格式为 [上边距，右边距，下边距，左边距]。
     */
    static labelPadding: any[] = [2, 2, 2, 2];

    /**
     * @en The padding of the input label, in pixels. Defined as [top, right, bottom, left].
     * @zh 输入框标签的边距，格式为 [上边距，右边距，下边距，左边距]。
     */
    static inputLabelPadding: any[] = [1, 1, 1, 3];

    //-----------------Button-----------------
    /**
     * @en The number of state skins for a button, which supports 1, 2, or 3 states values.
     * @zh 按钮皮肤的状态数，支持1,2,3三种状态值。
     */
    static buttonStateNum: number = 3;
    /**
     * @en The colors of the button label. Defined as [upColor, overColor, downColor].
     * @zh 按钮标签颜色，格式为 [upColor, overColor, downColor]。
     */
    static buttonLabelColors: any[] = ["#32556b", "#32cc6b", "#ff0000"];

    //-----------------ComboBox-----------------
    /**
     * @en The colors of the combo box. Defined as [overBgColor, overLabelColor, outLabelColor, borderColor, bgColor].
     * @zh 下拉框项颜色，格式为 [overBgColor, overLabelColor, outLabelColor, borderColor, bgColor]。
     */
    static comboBoxItemColors: any[] = ["#5e95b6", "#ffffff", "#000000", "#8fa4b1", "#ffffff"];

    //-----------------ScrollBar-----------------
    /**
     * @en The minimum size of the scrollbar thumb, in pixels.
     * @zh 滚动条的最小值。
     */
    static scrollBarMinNum: number = 15;
    /**
     * @en The delay time before initiating continuous scrolling when a button is held down.
     * @zh 长按按钮后，等待时间使其可激活连续滚动。
     */
    static scrollBarDelayTime: number = 500;
}

export enum ScrollType {
    None,
    Horizontal,
    Vertical,
    Both
}