import { Box } from "./Box";
import { IItem } from "./IItem";
import { ISelect } from "./ISelect";
import { Sprite } from "../display/Sprite";
import { Handler } from "../utils/Handler";
/**
 * 当 <code>Group</code> 实例的 <code>selectedIndex</code> 属性发生变化时调度。
 * @eventType laya.events.Event
 */
/**
 * <code>Group</code> 是一个可以自动布局的项集合控件。
 * <p> <code>Group</code> 的默认项对象为 <code>Button</code> 类实例。
 * <code>Group</code> 是 <code>Tab</code> 和 <code>RadioGroup</code> 的基类。</p>
 */
export declare class UIGroup extends Box implements IItem {
    /**
     * 改变 <code>Group</code> 的选择项时执行的处理器，(默认返回参数： 项索引（index:int）)。
     */
    selectHandler: Handler;
    /**@private */
    protected _items: ISelect[];
    /**@private */
    protected _selectedIndex: number;
    /**@private */
    protected _skin: string;
    /**@private */
    protected _direction: string;
    /**@private */
    protected _space: number;
    /**@private */
    protected _labels: string;
    /**@private */
    protected _labelColors: string;
    /**@private */
    private _labelFont;
    /**@private */
    protected _labelStrokeColor: string;
    /**@private */
    protected _strokeColors: string;
    /**@private */
    protected _labelStroke: number;
    /**@private */
    protected _labelSize: number;
    /**@private */
    protected _labelBold: boolean;
    /**@private */
    protected _labelPadding: string;
    /**@private */
    protected _labelAlign: string;
    /**@private */
    protected _stateNum: number;
    /**@private */
    protected _labelChanged: boolean;
    /**
     * 创建一个新的 <code>Group</code> 类实例。
     * @param labels 标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     * @param skin 皮肤。
     */
    constructor(labels?: string, skin?: string);
    /**@inheritDoc */
    protected preinitialize(): void;
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**
     * 添加一个项对象，返回此项对象的索引id。
     *
     * @param item 需要添加的项对象。
     * @param autoLayOut 是否自动布局，如果为true，会根据 <code>direction</code> 和 <code>space</code> 属性计算item的位置。
     * @return
     */
    addItem(item: ISelect, autoLayOut?: boolean): number;
    /**
     * 删除一个项对象。
     * @param item 需要删除的项对象。
     * @param autoLayOut 是否自动布局，如果为true，会根据 <code>direction</code> 和 <code>space</code> 属性计算item的位置。
     */
    delItem(item: ISelect, autoLayOut?: boolean): void;
    /**
     * 初始化项对象们。
     */
    initItems(): void;
    /**
     * @private
     * 项对象的点击事件侦听处理函数。
     * @param index 项索引。
     */
    protected itemClick(index: number): void;
    /**
     * 表示当前选择的项索引。默认值为-1。
     */
    selectedIndex: number;
    /**
     * @private
     * 通过对象的索引设置项对象的 <code>selected</code> 属性值。
     * @param index 需要设置的项对象的索引。
     * @param selected 表示项对象的选中状态。
     */
    protected setSelect(index: number, selected: boolean): void;
    /**
     * @copy laya.ui.Image#skin
     */
    skin: string;
    protected _skinLoaded(): void;
    /**
     * 标签集合字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     */
    labels: string;
    /**
     * @private
     * 创建一个项显示对象。
     * @param skin 项对象的皮肤。
     * @param label 项对象标签。
     */
    protected createItem(skin: string, label: string): Sprite;
    /**
     * @copy laya.ui.Button#labelColors()
     */
    labelColors: string;
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @see laya.display.Text.stroke()
     */
    labelStroke: number;
    /**
     * <p>描边颜色，以字符串表示。</p>
     * 默认值为 "#000000"（黑色）;
     * @see laya.display.Text.strokeColor()
     */
    labelStrokeColor: string;
    /**
     * <p>表示各个状态下的描边颜色。</p>
     * @see laya.display.Text.strokeColor()
     */
    strokeColors: string;
    /**
     * 表示按钮文本标签的字体大小。
     */
    labelSize: number;
    /**
     * 表示按钮的状态值，以数字表示，默认为3态。
     * @see laya.ui.Button#stateNum
     */
    stateNum: number;
    /**
     * 表示按钮文本标签是否为粗体字。
     */
    labelBold: boolean;
    /**
     * 表示按钮文本标签的字体名称，以字符串形式表示。
     * @see laya.display.Text.font()
     */
    labelFont: string;
    /**
     * 表示按钮文本标签的边距。
     * <p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
     */
    labelPadding: string;
    /**
     * 布局方向。
     * <p>默认值为"horizontal"。</p>
     * <p><b>取值：</b>
     * <li>"horizontal"：表示水平布局。</li>
     * <li>"vertical"：表示垂直布局。</li>
     * </p>
     */
    direction: string;
    /**
     * 项对象们之间的间隔（以像素为单位）。
     */
    space: number;
    /**
     * @private
     * 更改项对象的属性值。
     */
    protected changeLabels(): void;
    /**@inheritDoc */
    protected commitMeasure(): void;
    /**
     * 项对象们的存放数组。
     */
    readonly items: ISelect[];
    /**
     * 获取或设置当前选择的项对象。
     */
    selection: ISelect;
    /**@inheritDoc */
    dataSource: any;
    /**@private */
    protected _setLabelChanged(): void;
}
