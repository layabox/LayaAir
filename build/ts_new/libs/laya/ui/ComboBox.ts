import { UIComponent } from "./UIComponent";
import { Button } from "./Button";
import { List } from "./List";
import { Styles } from "./Styles";
import { Box } from "./Box";
import { Label } from "./Label";
import { UIUtils } from "./UIUtils";
import { VScrollBar } from "./VScrollBar";
import { Graphics } from "../display/Graphics"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 当用户更改 <code>ComboBox</code> 组件中的选定内容时调度。
 * @eventType laya.events.Event
 * selectedIndex属性变化时调度。
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

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
export class ComboBox extends UIComponent {
    /**@private */
    protected _visibleNum: number = 6;
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
    protected _itemColors: any[] = Styles.comboBoxItemColors;
    /**
     * @private
     */
    protected _itemSize: number = 12;
    /**
     * @private
     */
    protected _labels: any[] = [];
    /**
     * @private
     */
    protected _selectedIndex: number = -1;
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
    itemRender: any = null;

    /**
     * 创建一个新的 <code>ComboBox</code> 组件实例。
     * @param skin 皮肤资源地址。
     * @param labels 下拉列表的标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     */
    constructor(skin: string = null, labels: string = null) {
        super();
        this.skin = skin;
        this.labels = labels;
    }

    /**
     * @inheritDoc 
     * @override
    */
	destroy(destroyChild: boolean = true): void {
        ILaya.stage.off(Event.MOUSE_DOWN, this, this.removeList);
        ILaya.stage.off(Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
        super.destroy(destroyChild);
        this._button && this._button.destroy(destroyChild);
        this._list && this._list.destroy(destroyChild);
        this._button = null;
        this._list = null;
        this._itemColors = null;
        this._labels = null;
        this._selectHandler = null;
    }

    /**
     * @inheritDoc 
     * @override
    */
	protected createChildren(): void {
        this.addChild(this._button = new Button());
        this._button.text.align = "left";
        this._button.labelPadding = "0,0,0,5";
        this._button.on(Event.MOUSE_DOWN, this, this.onButtonMouseDown);
    }

    private _createList(): void {
        this._list = new List();
        if (this._scrollBarSkin) this._list.vScrollBarSkin = this._scrollBarSkin;
        this._setListEvent(this._list);
    }

    private _setListEvent(list: List): void {
        this._list.selectEnable = true;
        this._list.on(Event.MOUSE_DOWN, this, this.onListDown);
        this._list.mouseHandler = Handler.create(this, this.onlistItemMouse, null, false);
        if (this._list.scrollBar) this._list.scrollBar.on(Event.MOUSE_DOWN, this, this.onScrollBarDown);
    }

    /**
     * @private
     */
    private onListDown(e: Event): void {
        e.stopPropagation();
    }

    private onScrollBarDown(e: Event): void {
        e.stopPropagation();
    }

    private onButtonMouseDown(e: Event): void {
        this.callLater(this.switchTo, [!this._isOpen]);
    }

    /**
     * @copy laya.ui.Button#skin
     */
    get skin(): string {
        return this._button.skin;
    }

    set skin(value: string) {
        if (this._button.skin != value) {
            this._button.skin = value;
            this._listChanged = true;
        }
    }

    /**
     * @inheritDoc 
     * @override
    */
	protected measureWidth(): number {
        return this._button.width;
    }

    /**
     * @inheritDoc 
     * @override
    */
	protected measureHeight(): number {
        return this._button.height;
    }

    /**
     * @private
     */
    protected changeList(): void {
        this._listChanged = false;
        var labelWidth: number = this.width - 2;
        var labelColor: string = this._itemColors[2];
        this._itemHeight = this._itemSize + 6;
        this._list.itemRender = this.itemRender || { type: "Box", child: [{ type: "Label", props: { name: "label", x: 1, padding: "3,3,3,3", width: labelWidth, height: this._itemHeight, fontSize: this._itemSize, color: labelColor } }] };
        this._list.repeatY = this._visibleNum;
        this._list.refresh();
    }

    /**
     * @private
     * 下拉列表的鼠标事件响应函数。
     */
    protected onlistItemMouse(e: Event, index: number): void {
        var type: string = e.type;
        if (type === Event.MOUSE_OVER || type === Event.MOUSE_OUT) {
            if (this._isCustomList) return;
            var box: Box = this._list.getCell(index);
            if (!box) return;
            var label: Label = (<Label>box.getChildByName("label"));
            if (label) {
                if (type === Event.ROLL_OVER) {
                    label.bgColor = this._itemColors[0];
                    label.color = this._itemColors[1];
                } else {
                    label.bgColor = null;
                    label.color = this._itemColors[2];
                }
            }
        } else if (type === Event.CLICK) {
            this.selectedIndex = index;
            this.isOpen = false;
        }
    }

    /**
     * @private
     */
    private switchTo(value: boolean): void {
        this.isOpen = value;
    }

    /**
     * 更改下拉列表的打开状态。
     */
    protected changeOpen(): void {
        this.isOpen = !this._isOpen;
    }

    /**
     * @inheritDoc 
     * @override
     */
	set width(value: number) {
        super.width = value;
        this._button.width = this._width;
        this._itemChanged = true;
        this._listChanged = true;
    }
    /**
     * @inheritDoc 
     * @override
     */
    get width() {
        return super.width;
    }

    /**
     * @inheritDoc 
     * @override
     */
	set height(value: number) {
        super.height = value;
        this._button.height = this._height;
    }
    /**
     * @inheritDoc 
     * @override
     */
    get height() {
        return super.height;
    }

    /**
     * 标签集合字符串。
     */
    get labels(): string {
        return this._labels.join(",");
    }

    set labels(value: string) {
        if (this._labels.length > 0) this.selectedIndex = -1;
        if (value) this._labels = value.split(",");
        else this._labels.length = 0;
        this._itemChanged = true;
    }

    /**
     * 更改下拉列表。
     */
    protected changeItem(): void {
        this._itemChanged = false;
        //显示边框
        this._listHeight = this._labels.length > 0 ? Math.min(this._visibleNum, this._labels.length) * this._itemHeight : this._itemHeight;
        if (!this._isCustomList) {
            //填充背景
            var g: Graphics = this._list.graphics;
            g.clear(true);
            g.drawRect(0, 0, this.width - 1, this._listHeight, this._itemColors[4], this._itemColors[3]);
        }

        //填充数据			
        var a: any[] = this._list.array || [];
        a.length = 0;
        for (var i: number = 0, n: number = this._labels.length; i < n; i++) {
            a.push({ label: this._labels[i] });
        }
        this._list.height = this._listHeight;
        this._list.array = a;

        //if (_visibleNum > a.length) {
        //_list.height = _listHeight;
        //} else {
        //_list.height = 0;
        //}
    }

    /**
     * 表示选择的下拉列表项的索引。
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value: number) {
        if (this._selectedIndex != value) {
            this._selectedIndex = value;

            if (this._labels.length > 0) this.changeSelected();
            else this.callLater(this.changeSelected);

            this.event(Event.CHANGE, [Event.EMPTY.setTo(Event.CHANGE, this, this)]);
            this._selectHandler && this._selectHandler.runWith(this._selectedIndex);
        }
    }

    private changeSelected(): void {
        this._button.label = this.selectedLabel;
    }

    /**
     * 改变下拉列表的选择项时执行的处理器(默认返回参数index:int)。
     */
    get selectHandler(): Handler {
        return this._selectHandler;
    }

    set selectHandler(value: Handler) {
        this._selectHandler = value;
    }

    /**
     * 表示选择的下拉列表项的的标签。
     */
    get selectedLabel(): string {
        return this._selectedIndex > -1 && this._selectedIndex < this._labels.length ? this._labels[this._selectedIndex] : null;
    }

    set selectedLabel(value: string) {
        this.selectedIndex = this._labels.indexOf(value);
    }

    /**
     * 获取或设置没有滚动条的下拉列表中可显示的最大行数。
     */
    get visibleNum(): number {
        return this._visibleNum;
    }

    set visibleNum(value: number) {
        this._visibleNum = value;
        this._listChanged = true;
    }

    /**
     * 下拉列表项颜色。
     * <p><b>格式：</b>"悬停或被选中时背景颜色,悬停或被选中时标签颜色,标签颜色,边框颜色,背景颜色"</p>
     */
    get itemColors(): string {
        return String(this._itemColors)
    }

    set itemColors(value: string) {
        this._itemColors = UIUtils.fillArray(this._itemColors, value, String);
        this._listChanged = true;
    }

    /**
     * 下拉列表项标签的字体大小。
     */
    get itemSize(): number {
        return this._itemSize;
    }

    set itemSize(value: number) {
        this._itemSize = value;
        this._listChanged = true;
    }

    /**
     * 表示下拉列表的打开状态。
     */
    get isOpen(): boolean {
        return this._isOpen;
    }

    set isOpen(value: boolean) {
        //var Laya = ILaya.Laya;
        if (this._isOpen != value) {
            this._isOpen = value;
            this._button.selected = this._isOpen;
            if (this._isOpen) {
                this._list || this._createList();
                this._listChanged && !this._isCustomList && this.changeList();
                this._itemChanged && this.changeItem();

                var p: Point = this.localToGlobal(Point.TEMP.setTo(0, 0));
                var py: number = p.y + this._button.height;
                py = py + this._listHeight <= ILaya.stage.height ? py : p.y - this._listHeight;

                this._list.pos(p.x, py);
                this._list.zOrder = 1001;

                ILaya.stage.addChild(this._list);
                //Laya.stage.once(Event.MOUSE_DOWN, this, removeList);
                //Laya.stage.on(Event.MOUSE_WHEEL, this, _onStageMouseWheel);
                //parent.addChild(_list);
                ILaya.stage.once(Event.MOUSE_DOWN, this, this.removeList);
                ILaya.stage.on(Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
                this._list.selectedIndex = this._selectedIndex;
            } else {
                this._list && this._list.removeSelf();
            }
        }
    }

    private _onStageMouseWheel(e: Event): void {
        if (!this._list || this._list.contains(e.target)) return;
        this.removeList(null);
    }

    /**
     * 关闭下拉列表。
     */
    protected removeList(e: Event): void {
        ILaya.stage.off(Event.MOUSE_DOWN, this, this.removeList);
        ILaya.stage.off(Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
        this.isOpen = false;
    }

    /**
     * 滚动条皮肤。
     */
    get scrollBarSkin(): string {
        return this._scrollBarSkin;
    }

    set scrollBarSkin(value: string) {
        this._scrollBarSkin = value;
    }

    /**
     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    get sizeGrid(): string {
        return this._button.sizeGrid;
    }

    set sizeGrid(value: string) {
        this._button.sizeGrid = value;
    }

    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>VScrollBar</code> 滚动条组件的引用。
     */
    get scrollBar(): VScrollBar {
        return (<VScrollBar>this.list.scrollBar);
    }

    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的引用。
     */
    get button(): Button {
        return this._button;
    }

    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>List</code> 列表组件的引用。
     */
    get list(): List {
        this._list || this._createList();
        return this._list;
    }

    set list(value: List) {
        if (value) {
            value.removeSelf();
            this._isCustomList = true;
            this._list = value;
            this._setListEvent(value);
            this._itemHeight = value.getCell(0).height + value.spaceY;
        }
    }

    /**
     * @inheritDoc 
     * @override
    */
    set dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string') this.selectedIndex = parseInt(value as string);
        else if (value instanceof Array) this.labels = ((<any[]>value)).join(",");
        else super.dataSource = value;
    }
    /**
     * @inheritDoc 
     * @override
     */
    get dataSource() {
        return super.dataSource;
    }

    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本标签颜色。
     * <p><b>格式：</b>upColor,overColor,downColor,disableColor</p>
     */
    get labelColors(): string {
        return this._button.labelColors;
    }

    set labelColors(value: string) {
        if (this._button.labelColors != value) {
            this._button.labelColors = value;
        }
    }

    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本边距。
     * <p><b>格式：</b>上边距,右边距,下边距,左边距</p>
     */
    get labelPadding(): string {
        return this._button.text.padding.join(",");
    }

    set labelPadding(value: string) {
        this._button.text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }

    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的标签字体大小。
     */
    get labelSize(): number {
        return this._button.text.fontSize;
    }

    set labelSize(value: number) {
        this._button.text.fontSize = value
    }

    /**
     * 表示按钮文本标签是否为粗体字。
     * @see laya.display.Text#bold
     */
    get labelBold(): boolean {
        return this._button.text.bold;
    }

    set labelBold(value: boolean) {
        this._button.text.bold = value
    }

    /**
     * 表示按钮文本标签的字体名称，以字符串形式表示。
     * @see laya.display.Text#font
     */
    get labelFont(): string {
        return this._button.text.font;
    }

    set labelFont(value: string) {
        this._button.text.font = value
    }

    /**
     * 表示按钮的状态值。
     * @see laya.ui.Button#stateNum
     */
    get stateNum(): number {
        return this._button.stateNum;
    }

    set stateNum(value: number) {
        this._button.stateNum = value
    }
}

ILaya.regClass(ComboBox);
ClassUtils.regClass("laya.ui.ComboBox", ComboBox);
ClassUtils.regClass("Laya.ComboBox", ComboBox);