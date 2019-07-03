import { UIComponent } from "./UIComponent";
import { Button } from "./Button";
import { List } from "./List";
import { VScrollBar } from "./VScrollBar";
import { Event } from "../events/Event";
import { Handler } from "../utils/Handler";
/**
 * 当用户更改 <code>ComboBox</code> 组件中的选定内容时调度。
 * @eventType laya.events.Event
 * selectedIndex属性变化时调度。
 */
/**
 * <code>ComboBox</code> 组件包含一个下拉列表，用户可以从该列表中选择单个值。
 *
 * @example <caption>以下示例代码，创建了一个 <code>ComboBox</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.ComboBox;
 *		import laya.utils.Handler;
 *		public class ComboBox_Example
 *		{
 *			public function ComboBox_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				trace("资源加载完成！");
 *				var comboBox:ComboBox = new ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。
 *				comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
 *				comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
 *				comboBox.selectHandler = new Handler(this, onSelect);//设置 comboBox 选择项改变时执行的处理器。
 *				Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。
 *			}
 *			private function onSelect(index:int):void
 *			{
 *				trace("当前选中的项对象索引： ",index);
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高。
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 * Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源
 * function loadComplete() {
 *     console.log("资源加载完成！");
 *     var comboBox = new laya.ui.ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。
 *     comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
 *     comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
 *     comboBox.selectHandler = new laya.utils.Handler(this, onSelect);//设置 comboBox 选择项改变时执行的处理器。
 *     Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。
 * }
 * function onSelect(index)
 * {
 *     console.log("当前选中的项对象索引： ",index);
 * }
 * @example
 * import ComboBox = laya.ui.ComboBox;
 * import Handler = laya.utils.Handler;
 * class ComboBox_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load("resource/ui/button.png", Handler.create(this, this.onLoadComplete));//加载资源。
 *     }
 *     private onLoadComplete(): void {
 *         console.log("资源加载完成！");
 *         var comboBox: ComboBox = new ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。
 *         comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
 *         comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。
 *         comboBox.selectHandler = new Handler(this, this.onSelect);//设置 comboBox 选择项改变时执行的处理器。
 *         Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。
 *     }
 *     private onSelect(index: number): void {
 *         console.log("当前选中的项对象索引： ", index);
 *     }
 * }
 *
 */
export declare class ComboBox extends UIComponent {
    /**@private */
    protected _visibleNum: number;
    /**
     * @private
     */
    protected _button: Button;
    /**
     * @private
     */
    protected _list: List;
    /**
     * @private
     */
    protected _isOpen: boolean;
    /**
     * @private
     */
    protected _itemColors: any[];
    /**
     * @private
     */
    protected _itemSize: number;
    /**
     * @private
     */
    protected _labels: any[];
    /**
     * @private
     */
    protected _selectedIndex: number;
    /**
     * @private
     */
    protected _selectHandler: Handler;
    /**
     * @private
     */
    protected _itemHeight: number;
    /**
     * @private
     */
    protected _listHeight: number;
    /**
     * @private
     */
    protected _listChanged: boolean;
    /**
     * @private
     */
    protected _itemChanged: boolean;
    /**
     * @private
     */
    protected _scrollBarSkin: string;
    /**
     * @private
     */
    protected _isCustomList: boolean;
    /**
     * 渲染项，用来显示下拉列表展示对象
     */
    itemRender: any;
    /**
     * 创建一个新的 <code>ComboBox</code> 组件实例。
     * @param skin 皮肤资源地址。
     * @param labels 下拉列表的标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     */
    constructor(skin?: string, labels?: string);
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**@inheritDoc */
    protected createChildren(): void;
    private _createList;
    private _setListEvent;
    /**
     * @private
     */
    private onListDown;
    private onScrollBarDown;
    private onButtonMouseDown;
    /**
     * @copy laya.ui.Button#skin
     */
    skin: string;
    /**@inheritDoc */
    protected measureWidth(): number;
    /**@inheritDoc */
    protected measureHeight(): number;
    /**
     * @private
     */
    protected changeList(): void;
    /**
     * @private
     * 下拉列表的鼠标事件响应函数。
     */
    protected onlistItemMouse(e: Event, index: number): void;
    /**
     * @private
     */
    private switchTo;
    /**
     * 更改下拉列表的打开状态。
     */
    protected changeOpen(): void;
    /**@inheritDoc */
    width: number;
    /**@inheritDoc */
    height: number;
    /**
     * 标签集合字符串。
     */
    labels: string;
    /**
     * 更改下拉列表。
     */
    protected changeItem(): void;
    /**
     * 表示选择的下拉列表项的索引。
     */
    selectedIndex: number;
    private changeSelected;
    /**
     * 改变下拉列表的选择项时执行的处理器(默认返回参数index:int)。
     */
    selectHandler: Handler;
    /**
     * 表示选择的下拉列表项的的标签。
     */
    selectedLabel: string;
    /**
     * 获取或设置没有滚动条的下拉列表中可显示的最大行数。
     */
    visibleNum: number;
    /**
     * 下拉列表项颜色。
     * <p><b>格式：</b>"悬停或被选中时背景颜色,悬停或被选中时标签颜色,标签颜色,边框颜色,背景颜色"</p>
     */
    itemColors: string;
    /**
     * 下拉列表项标签的字体大小。
     */
    itemSize: number;
    /**
     * 表示下拉列表的打开状态。
     */
    isOpen: boolean;
    private _onStageMouseWheel;
    /**
     * 关闭下拉列表。
     */
    protected removeList(e: Event): void;
    /**
     * 滚动条皮肤。
     */
    scrollBarSkin: string;
    /**
     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    sizeGrid: string;
    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>VScrollBar</code> 滚动条组件的引用。
     */
    readonly scrollBar: VScrollBar;
    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的引用。
     */
    readonly button: Button;
    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>List</code> 列表组件的引用。
     */
    list: List;
    /**@inheritDoc */
    dataSource: any;
    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本标签颜色。
     * <p><b>格式：</b>upColor,overColor,downColor,disableColor</p>
     */
    labelColors: string;
    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本边距。
     * <p><b>格式：</b>上边距,右边距,下边距,左边距</p>
     */
    labelPadding: string;
    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的标签字体大小。
     */
    labelSize: number;
    /**
     * 表示按钮文本标签是否为粗体字。
     * @see laya.display.Text#bold
     */
    labelBold: boolean;
    /**
     * 表示按钮文本标签的字体名称，以字符串形式表示。
     * @see laya.display.Text#font
     */
    labelFont: string;
    /**
     * 表示按钮的状态值。
     * @see laya.ui.Button#stateNum
     */
    stateNum: number;
}
