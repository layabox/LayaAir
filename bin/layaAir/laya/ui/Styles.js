import { ILaya } from "ILaya";
/**
     * <code>Styles</code> 定义了组件常用的样式属性。
     */
export class Styles {
}
/**
 * 默认九宫格信息。
 * @see laya.ui.AutoBitmap#sizeGrid
 */
Styles.defaultSizeGrid = [4, 4, 4, 4, 0];
//-----------------Label-----------------
/**
 * 标签颜色。
 */
Styles.labelColor = "#000000";
/**
 * 标签的边距。
 * <p><b>格式：</b>[上边距，右边距，下边距，左边距]。</p>
 */
Styles.labelPadding = [2, 2, 2, 2];
/**
 * 标签的边距。
 * <p><b>格式：</b>[上边距，右边距，下边距，左边距]。</p>
 */
Styles.inputLabelPadding = [1, 1, 1, 3];
//-----------------Button-----------------
/**
 * 按钮皮肤的状态数，支持1,2,3三种状态值。
 */
Styles.buttonStateNum = 3;
/**
 * 按钮标签颜色。
 * <p><b>格式：</b>[upColor,overColor,downColor,disableColor]。</p>
 */
Styles.buttonLabelColors = ["#32556b", "#32cc6b", "#ff0000", "#C0C0C0"];
//-----------------ComboBox-----------------
/**
 * 下拉框项颜色。
 * <p><b>格式：</b>[overBgColor,overLabelColor,outLabelColor,borderColor,bgColor]。</p>
 */
Styles.comboBoxItemColors = ["#5e95b6", "#ffffff", "#000000", "#8fa4b1", "#ffffff"];
//-----------------ScrollBar-----------------
/**
 * 滚动条的最小值。
 */
Styles.scrollBarMinNum = 15;
/**
 * 长按按钮，等待时间，使其可激活连续滚动。
 */
Styles.scrollBarDelayTime = 500;
ILaya.regClass(Styles);
