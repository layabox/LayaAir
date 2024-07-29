import { UIComponent } from "./UIComponent";
import { Button } from "./Button";
import { List } from "./List";
import { ScrollType, Styles } from "./Styles";
import { Label } from "./Label";
import { UIUtils } from "./UIUtils";
import { VScrollBar } from "./VScrollBar";
import { Graphics } from "../display/Graphics"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { HideFlags } from "../Const";

/**
 * 当用户更改 <code>ComboBox</code> 组件中的选定内容时调度。
 * @eventType laya.events.Event
 * selectedIndex属性变化时调度。
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

/**
 * @en The `ComboBox` component contains a drop-down list from which the user can select a single value.
 * @zh `ComboBox` 组件包含一个下拉列表，用户可以从该列表中选择单个值。
 */
export class ComboBox extends UIComponent {
    /**@internal */
    protected _visibleNum: number = 6;
    /**
     * @internal
     */
    protected _button: Button;
    /**
     * @internal
     */
    protected _list: List;
    /**
     * @internal
     */
    protected _isOpen: boolean;
    /**
     * @internal
     */
    protected _itemColors: string[];
    /**
     * @internal
     */
    protected _itemPadding: number[];
    /**
     * @internal
     */
    protected _itemSize: number = 12;
    /**
     * @internal
     */
    protected _labels: string[] = [];
    /**
     * @internal
     * 下拉提示文本
     */
    protected _defaultLabel: string = '';
    /**
     * @internal
     */
    protected _selectedIndex: number = -1;
    /**
     * @internal
     */
    protected _selectHandler: Handler;
    /**
     * @internal 下拉框列表单元的高度
     */
    protected _itemHeight: number;
    /**
     * @internal
     */
    protected _listHeight: number;
    /**
     * @internal
     */
    protected _listChanged: boolean;
    /**
     * @internal
     */
    protected _itemChanged: boolean;
    /**
     * @internal
     */
    protected _scrollBarSkin: string;
    protected _scrollType: ScrollType = 0;
    /**
     * @internal
     */
    protected _isCustomList: boolean;
    /**
     * @en Rendering item, used to display a dropdown list to display objects
     * @zh 渲染项，用来显示下拉列表展示对象
     */
    itemRender: any = null;

    /**
     * @en The skin resource address of the object. Supports single state, two states and three states, set with the `stateNum` property.
     * @zh 对象的皮肤纹理资源地址。 支持单态，两态和三态，用 `stateNum` 属性设置
     * @see #stateNum
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
     * @en The padding of the drop-down list text.
     * @readme The format is: top, right, bottom, left
     * @zh 下拉列表文本的边距。
     * @readme 格式：上边距,右边距,下边距,左边距
     */
    get itemPadding(): string {
        return this._itemPadding.join(",");
    }

    set itemPadding(value: string) {
        this._itemPadding = UIUtils.fillArray(this._itemPadding, value, Number);
    }


    /**
     * @en The string of label collection.
     * @zh 标签集合字符串。
     */
    get labels(): string {
        return this._labels.join(",");
    }

    set labels(value: string) {
        if (this._labels.length > 0)
            this.selectedIndex = -1;
        if (value)
            this._labels = value.split(",");
        else
            this._labels.length = 0;
        this._itemChanged = true;
    }


    /**
     * @en Indicates the index of the selected drop-down list item.
     * @zh 表示选择的下拉列表项的索引。
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value: number) {
        if (this._selectedIndex != value) {
            this._selectedIndex = value;

            if (this._labels.length > 0)
                this.changeSelected();
            else
                this.callLater(this.changeSelected);

            this.event(Event.CHANGE, Event.EMPTY);
            this._selectHandler && this._selectHandler.runWith(this._selectedIndex);
        }
    }

    /**
     * @en The default drop-down prompt text.
     * @zh 默认的下拉提示文本。
     */
    get defaultLabel(): string {
        return this._defaultLabel;
    }

    set defaultLabel(value: string) {
        this._defaultLabel = value;
        this._selectedIndex < 0 && (this._button.label = value);
    }

    /**
     * @en The handler to be executed when changing the selection of the drop-down list (default returns parameter index:int).
     * @zh 改变下拉列表的选择项时执行的处理器(默认返回参数index:int)。
     */
    get selectHandler(): Handler {
        return this._selectHandler;
    }

    set selectHandler(value: Handler) {
        this._selectHandler = value;
    }

    /**
     * @en Indicates the label of the selected drop-down list item.
     * @zh 表示选择的下拉列表项的的标签。
     */
    get selectedLabel(): string {
        return this._selectedIndex > -1 && this._selectedIndex < this._labels.length ? this._labels[this._selectedIndex] : this.defaultLabel;
    }

    set selectedLabel(value: string) {
        this.selectedIndex = this._labels.indexOf(value);
    }

    /**
     * @en Gets or sets the maximum number of rows that can be displayed in the drop-down list without a scrollbar.
     * @zh 获取或设置没有滚动条的下拉列表中可显示的最大行数。
     */
    get visibleNum(): number {
        return this._visibleNum;
    }

    set visibleNum(value: number) {
        this._visibleNum = value;
        this._listChanged = true;
    }


    /**
     * @en The height of the drop-down list item.
     * @zh 下拉列表项的高度。
     */
    get itemHeight(): number {
        return this._itemHeight;
    }
    set itemHeight(value: number) {
        this._itemHeight = value;
        this._listChanged = true;
    }

    /**
     * @en The color of drop-down list items.
     * The format is: "background color when hovering or selected, label color when hovering or selected, label color, border color, background color"
     * @zh 下拉列表项颜色。
     * 格式：悬停或被选中时背景颜色,悬停或被选中时标签颜色,标签颜色,边框颜色,背景颜色"。
     */
    get itemColors(): string {
        return this._itemColors.join(",");
    }

    set itemColors(value: string) {
        this._itemColors = UIUtils.fillArray(this._itemColors, value, String);
        this._listChanged = true;
    }

    /**
     * @en The font size of the drop-down list item label.
     * @zh 下拉列表项标签的字体大小。
     */
    get itemSize(): number {
        return this._itemSize;
    }

    set itemSize(value: number) {
        this._itemSize = value;
        this._listChanged = true;
    }

    /**
     * @en Indicates the open state of the drop-down list.
     * @zh 表示下拉列表的打开状态。
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
                py = py + this._listHeight <= ILaya.stage.height ? py : p.y - this._listHeight < 0 ? py : p.y - this._listHeight;

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

    /**
     * @en The scroll type.
     * @zh 滚动类型。
     */
    get scrollType() {
        return this._scrollType;
    }

    set scrollType(value: ScrollType) {
        this._scrollType = value;
    }

    /**
     * @en The scrollbar skin.
     * @zh 滚动条皮肤。
     */
    get scrollBarSkin(): string {
        return this._scrollBarSkin;
    }

    set scrollBarSkin(value: string) {
        this._scrollBarSkin = value;
    }

    /**
     * @en The size grid of the texture.
     * The size grid is a 3x3 division of the texture, allowing it to be scaled without distorting the corners and edges. 
     * The array contains five values representing the top, right, bottom, and left margins, and whether to repeat the fill (0: no repeat, 1: repeat). 
     * The values are separated by commas. For example: "6,6,6,6,1".
     * @zh 纹理的九宫格数据。
     * 九宫格是一种将纹理分成3x3格的方式，使得纹理缩放时保持角和边缘不失真。
     * 数组包含五个值，分别代表上边距、右边距、下边距、左边距以及是否重复填充（0：不重复填充，1：重复填充）。
     * 值以逗号分隔。例如："6,6,6,6,1"。
     */
    get sizeGrid(): string {
        return this._button.sizeGrid;
    }

    set sizeGrid(value: string) {
        this._button.sizeGrid = value;
    }

    /**
     * @en a reference to the `VScrollBar` scrollbar component contained in the `ComboBox` component.
     * @zh `ComboBox` 组件所包含的 `VScrollBar` 滚动条组件的引用。
     */
    get scrollBar(): VScrollBar {
        return (<VScrollBar>this.list.scrollBar);
    }

    /**
     * @en a reference to the `Button` component contained in the `ComboBox` component.
     * @zh `ComboBox` 组件所包含的 `Button` 组件的引用。
     */
    get button(): Button {
        return this._button;
    }

    /**
     * @en a reference to the `List` list component contained in the `ComboBox` component.
     * @zh `ComboBox` 组件所包含的 `List` 列表组件的引用。
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
     * @en the text label color of the `Button` component contained in the `ComboBox` component.
     * The format is: upColor,overColor,downColor
     * @zh  `ComboBox` 组件所包含的 `Button` 组件的文本标签颜色。
     * 格式：upColor,overColor,downColor
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
     * @en the text margin of the `Button` component contained in the `ComboBox` component.
     * The format is: top, right, bottom, left
     * @zh `ComboBox` 组件所包含的 `Button` 组件的文本边距。
     * 格式：上边距,右边距,下边距,左边距
     */
    get labelPadding(): string {
        return this._button.text.padding.join(",");
    }

    set labelPadding(value: string) {
        this._button.text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }

    /**
    * @en the label font size of the `Button` component contained in the `ComboBox` component.
    * @zh `ComboBox` 组件所包含的 `Button` 组件的标签字体大小。
    */
    get labelSize(): number {
        return this._button.text.fontSize;
    }

    set labelSize(value: number) {
        this._button.text.fontSize = value
    }

    /**
    * @en Indicates whether the button text label is bold.
    * @zh 表示按钮文本标签是否为粗体字。
    * @see laya.display.Text#bold
    */
    get labelBold(): boolean {
        return this._button.text.bold;
    }

    set labelBold(value: boolean) {
        this._button.text.bold = value
    }

    /**
     * @en Indicates the font name of the button text label, expressed as a string.
     * @zh 表示按钮文本标签的字体名称，以字符串形式表示。
     * @see laya.display.Text#font
     */
    get labelFont(): string {
        return this._button.text.font;
    }

    set labelFont(value: string) {
        this._button.text.font = value
    }

    /**
     * @en Indicates the state value of the button.
     * @zh 表示按钮的状态值。
     * @see laya.ui.Button#stateNum
     */
    get stateNum(): number {
        return this._button.stateNum;
    }

    set stateNum(value: number) {
        this._button.stateNum = value
    }

    /**
     * @en `ComboBox` constructor.
     * @param skin The skin resource address.
     * @param labels The string of the label collection in the drop-down list. Separated by commas, such as "item0,item1,item2,item3,item4,item5".
     * @zh  `ComboBox` UI组件的构造函数。
     * @param skin 皮肤资源地址。
     * @param labels 下拉列表的标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     */
    constructor(skin: string = null, labels: string = null) {
        super();

        this._itemColors = Styles.comboBoxItemColors;
        this._itemPadding = [3, 3, 3, 3];

        this.skin = skin;
        this.labels = labels;
    }

    /**
     * @inheritDoc 
     * @override
    */
    protected createChildren(): void {
        this._button = new Button();
        this._button.hideFlags = HideFlags.HideAndDontSave;
        this._button.text.align = "left";
        this._button.labelPadding = "0,0,0,5";
        this._button.on(Event.MOUSE_DOWN, this, this.onButtonMouseDown);
        this.addChild(this._button);
    }

    /**
     * @internal
     */
    private _createList(): void {
        this._list = new List();
        this._list.hideFlags = HideFlags.HideAndDontSave;
        this._list.scrollType = this._scrollType;
        if (this._scrollBarSkin)
            this._list.vScrollBarSkin = this._scrollBarSkin;
        this._setListEvent(this._list);
    }

    /**
     * @internal
     */
    private _setListEvent(list: List): void {
        this._list.selectEnable = true;
        this._list.on(Event.MOUSE_DOWN, this, this.onListDown);
        this._list.mouseHandler = Handler.create(this, this.onlistItemMouse, null, false);
        if (this._list.scrollBar) this._list.scrollBar.on(Event.MOUSE_DOWN, this, this.onScrollBarDown);
    }


    /**
     * @internal
     * @inheritDoc 
     * @override
     */
    _setWidth(value: number) {
        super._setWidth(value);
        this._button.width = this._width;
        this._itemChanged = true;
        this._listChanged = true;
    }

    /**
     * @internal
     * @inheritDoc 
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this._button.height = this._height;
    }

    /**
     * @internal
     */
    private _onStageMouseWheel(e: Event): void {
        if (!this._list || this._list.contains(e.target)) return;
        this.removeList(null);
    }

    /**
     * @internal
     * 关闭下拉列表。
     */
    protected removeList(e: Event): void {
        ILaya.stage.off(Event.MOUSE_DOWN, this, this.removeList);
        ILaya.stage.off(Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
        this.isOpen = false;
    }

    /**
     * @internal
     */
    private onListDown(e: Event): void {
        e.stopPropagation();
    }

    /**
     * @internal
     */
    private onScrollBarDown(e: Event): void {
        e.stopPropagation();
    }

    /**
     * @internal
     */
    private onButtonMouseDown(e: Event): void {
        this.callLater(this.switchTo, [!this._isOpen]);
    }


    /**
     * @internal
     * @inheritDoc 
     * @override
    */
    protected measureWidth(): number {
        return this._button.width;
    }

    /**
     * @internal
     * @inheritDoc 
     * @override
    */
    protected measureHeight(): number {
        return this._button.height;
    }

    /**
     * @internal
     */
    protected changeList(): void {
        this._listChanged = false;
        var labelWidth: number = this.width - 2;
        var labelColor: string = this._itemColors[2];
        this._itemHeight = (this._itemHeight) ? this._itemHeight : this._itemSize + 6;
        let _padding: string = (this.itemPadding) ? this.itemPadding : "3,3,3,3";
        this._list.itemRender = this.itemRender || { type: "Box", child: [{ type: "Label", props: { name: "label", x: 1, padding: _padding, width: labelWidth, height: this._itemHeight, fontSize: this._itemSize, color: labelColor } }] };
        this._list.repeatY = this._visibleNum;
        this._list.refresh();
    }

    /**
     * @internal
     * 下拉列表的鼠标事件响应函数。
     */
    protected onlistItemMouse(e: Event, index: number): void {
        let type: string = e.type;
        if (type === Event.MOUSE_OVER || type === Event.MOUSE_OUT) {
            if (this._isCustomList) return;
            let box = this._list.getCell(index);
            if (!box) return;
            let label: Label = (<Label>box.getChildByName("label"));
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
     * @internal
     */
    private switchTo(value: boolean): void {
        this.isOpen = value;
    }

    /**
     * @internal
     * 更改下拉列表的打开状态。
     */
    protected changeOpen(): void {
        this.isOpen = !this._isOpen;
    }

    /**
     * @internal
     * 更改下拉列表。
     */
    protected changeItem(): void {
        this._itemChanged = false;
        //显示边框
        this._listHeight = this._labels.length > 0 ? Math.min(this._visibleNum, this._labels.length) * this._itemHeight : this._itemHeight;
        if (!this._isCustomList) {
            //填充背景
            var g: Graphics = this._list.graphics;
            g.clear();
            g.drawRect(0, 0, this.width - 1, this._listHeight, this._itemColors[4], this._itemColors[3]);
        }

        //填充数据
        let a: any[] = this._list.array || [];
        a.length = 0;
        for (let i = 0, n = this._labels.length; i < n; i++) {
            a.push({ label: this._labels[i] });
        }
        this._list.size(this.width, this._listHeight);
        this._list.array = a;

        //if (_visibleNum > a.length) {
        //_list.height = _listHeight;
        //} else {
        //_list.height = 0;
        //}
    }


    /**
     * @internal
     */
    private changeSelected(): void {
        this._button.label = this.selectedLabel;
    }

    /**
     * @en Destroy the component and release the memory occupied by the component. Destroy the child objects of the component at the same time by default.
     * @param destroyChild Whether to simultaneously destroy the child objects of the component. The default value is true.
     * @zh 销毁组件并释放组件所占用的内存。默认会同时销毁组件的子对象。
     * @param destroyChild 是否同时销毁组件的子对象。默认值为true。
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
        this._itemPadding = null;
        this._itemHeight = null;
        this._labels = null;
        this._selectHandler = null;
        this._defaultLabel = null;
    }

    /**
     * @inheritDoc 
     * @override
     * @en Set the data source of the ComboBox.
     * @param value The new data source.
     * @zh 设置下拉选项框的数据源。
     * @param value 新的数据源。
     */
    set_dataSource(value: any): void {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.selectedIndex = parseInt(value as string);
        else if (value instanceof Array)
            this.labels = ((<any[]>value)).join(",");
        else
            super.set_dataSource(value);
    }
}