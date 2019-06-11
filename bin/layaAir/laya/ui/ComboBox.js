import { UIComponent } from "././UIComponent";
import { Button } from "././Button";
import { List } from "././List";
import { Styles } from "././Styles";
import { UIUtils } from "././UIUtils";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Handler } from "../utils/Handler";
import { ILaya } from "ILaya";
/**
 * 当用户更改 <code>ComboBox</code> 组件中的选定内容时调度。
 * @eventType laya.events.Event
 * @internal selectedIndex属性变化时调度。
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
    /**
     * 创建一个新的 <code>ComboBox</code> 组件实例。
     * @param skin 皮肤资源地址。
     * @param labels 下拉列表的标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     */
    constructor(skin = null, labels = null) {
        super();
        /**@private */
        this._visibleNum = 6;
        /**
         * @private
         */
        this._itemColors = Styles.comboBoxItemColors;
        /**
         * @private
         */
        this._itemSize = 12;
        /**
         * @private
         */
        this._labels = [];
        /**
         * @private
         */
        this._selectedIndex = -1;
        /**
         * 渲染项，用来显示下拉列表展示对象
         */
        this.itemRender = null;
        this.skin = skin;
        this.labels = labels;
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._button && this._button.destroy(destroyChild);
        this._list && this._list.destroy(destroyChild);
        this._button = null;
        this._list = null;
        this._itemColors = null;
        this._labels = null;
        this._selectHandler = null;
    }
    /**@inheritDoc */
    /*override*/ createChildren() {
        this.addChild(this._button = new Button());
        this._button.text.align = "left";
        this._button.labelPadding = "0,0,0,5";
        this._button.on(Event.MOUSE_DOWN, this, this.onButtonMouseDown);
    }
    _createList() {
        this._list = new List();
        if (this._scrollBarSkin)
            this._list.vScrollBarSkin = this._scrollBarSkin;
        this._setListEvent(this._list);
    }
    _setListEvent(list) {
        this._list.selectEnable = true;
        this._list.on(Event.MOUSE_DOWN, this, this.onListDown);
        this._list.mouseHandler = Handler.create(this, this.onlistItemMouse, null, false);
        if (this._list.scrollBar)
            this._list.scrollBar.on(Event.MOUSE_DOWN, this, this.onScrollBarDown);
    }
    /**
     * @private
     */
    onListDown(e) {
        e.stopPropagation();
    }
    onScrollBarDown(e) {
        e.stopPropagation();
    }
    onButtonMouseDown(e) {
        this.callLater(this.switchTo, [!this._isOpen]);
    }
    /**
     * @copy laya.ui.Button#skin
     */
    get skin() {
        return this._button.skin;
    }
    set skin(value) {
        if (this._button.skin != value) {
            this._button.skin = value;
            this._listChanged = true;
        }
    }
    /**@inheritDoc */
    /*override*/ measureWidth() {
        return this._button.width;
    }
    /**@inheritDoc */
    /*override*/ measureHeight() {
        return this._button.height;
    }
    /**
     * @private
     */
    changeList() {
        this._listChanged = false;
        var labelWidth = this.width - 2;
        var labelColor = this._itemColors[2];
        this._itemHeight = this._itemSize + 6;
        this._list.itemRender = this.itemRender || { type: "Box", child: [{ type: "Label", props: { name: "label", x: 1, padding: "3,3,3,3", width: labelWidth, height: this._itemHeight, fontSize: this._itemSize, color: labelColor } }] };
        this._list.repeatY = this._visibleNum;
        this._list.refresh();
    }
    /**
     * @private
     * 下拉列表的鼠标事件响应函数。
     */
    onlistItemMouse(e, index) {
        var type = e.type;
        if (type === Event.MOUSE_OVER || type === Event.MOUSE_OUT) {
            if (this._isCustomList)
                return;
            var box = this._list.getCell(index);
            if (!box)
                return;
            var label = box.getChildByName("label");
            if (label) {
                if (type === Event.ROLL_OVER) {
                    label.bgColor = this._itemColors[0];
                    label.color = this._itemColors[1];
                }
                else {
                    label.bgColor = null;
                    label.color = this._itemColors[2];
                }
            }
        }
        else if (type === Event.CLICK) {
            this.selectedIndex = index;
            this.isOpen = false;
        }
    }
    /**
     * @private
     */
    switchTo(value) {
        this.isOpen = value;
    }
    /**
     * 更改下拉列表的打开状态。
     */
    changeOpen() {
        this.isOpen = !this._isOpen;
    }
    /**@inheritDoc */
    /*override*/ set width(value) {
        super.width = value;
        this._button.width = this._width;
        this._itemChanged = true;
        this._listChanged = true;
    }
    get width() {
        return super.width;
    }
    /**@inheritDoc */
    /*override*/ set height(value) {
        super.height = value;
        this._button.height = this._height;
    }
    get height() {
        return super.height;
    }
    /**
     * 标签集合字符串。
     */
    get labels() {
        return this._labels.join(",");
    }
    set labels(value) {
        if (this._labels.length > 0)
            this.selectedIndex = -1;
        if (value)
            this._labels = value.split(",");
        else
            this._labels.length = 0;
        this._itemChanged = true;
    }
    /**
     * 更改下拉列表。
     */
    changeItem() {
        this._itemChanged = false;
        //显示边框
        this._listHeight = this._labels.length > 0 ? Math.min(this._visibleNum, this._labels.length) * this._itemHeight : this._itemHeight;
        if (!this._isCustomList) {
            //填充背景
            var g = this._list.graphics;
            g.clear(true);
            g.drawRect(0, 0, this.width - 1, this._listHeight, this._itemColors[4], this._itemColors[3]);
        }
        //填充数据			
        var a = this._list.array || [];
        a.length = 0;
        for (var i = 0, n = this._labels.length; i < n; i++) {
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
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        if (this._selectedIndex != value) {
            this._selectedIndex = value;
            if (this._labels.length > 0)
                this.changeSelected();
            else
                this.callLater(this.changeSelected);
            this.event(Event.CHANGE, [Event.EMPTY.setTo(Event.CHANGE, this, this)]);
            this._selectHandler && this._selectHandler.runWith(this._selectedIndex);
        }
    }
    changeSelected() {
        this._button.label = this.selectedLabel;
    }
    /**
     * 改变下拉列表的选择项时执行的处理器(默认返回参数index:int)。
     */
    get selectHandler() {
        return this._selectHandler;
    }
    set selectHandler(value) {
        this._selectHandler = value;
    }
    /**
     * 表示选择的下拉列表项的的标签。
     */
    get selectedLabel() {
        return this._selectedIndex > -1 && this._selectedIndex < this._labels.length ? this._labels[this._selectedIndex] : null;
    }
    set selectedLabel(value) {
        this.selectedIndex = this._labels.indexOf(value);
    }
    /**
     * 获取或设置没有滚动条的下拉列表中可显示的最大行数。
     */
    get visibleNum() {
        return this._visibleNum;
    }
    set visibleNum(value) {
        this._visibleNum = value;
        this._listChanged = true;
    }
    /**
     * 下拉列表项颜色。
     * <p><b>格式：</b>"悬停或被选中时背景颜色,悬停或被选中时标签颜色,标签颜色,边框颜色,背景颜色"</p>
     */
    get itemColors() {
        return String(this._itemColors);
    }
    set itemColors(value) {
        this._itemColors = UIUtils.fillArray(this._itemColors, value, String);
        this._listChanged = true;
    }
    /**
     * 下拉列表项标签的字体大小。
     */
    get itemSize() {
        return this._itemSize;
    }
    set itemSize(value) {
        this._itemSize = value;
        this._listChanged = true;
    }
    /**
     * 表示下拉列表的打开状态。
     */
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(value) {
        var Laya = window.Laya;
        if (this._isOpen != value) {
            this._isOpen = value;
            this._button.selected = this._isOpen;
            if (this._isOpen) {
                this._list || this._createList();
                this._listChanged && !this._isCustomList && this.changeList();
                this._itemChanged && this.changeItem();
                var p = this.localToGlobal(Point.TEMP.setTo(0, 0));
                var py = p.y + this._button.height;
                py = py + this._listHeight <= Laya.stage.height ? py : p.y - this._listHeight;
                this._list.pos(p.x, py);
                this._list.zOrder = 1001;
                Laya._currentStage.addChild(this._list);
                //Laya.stage.once(Event.MOUSE_DOWN, this, removeList);
                //Laya.stage.on(Event.MOUSE_WHEEL, this, _onStageMouseWheel);
                //parent.addChild(_list);
                Laya.stage.once(Event.MOUSE_DOWN, this, this.removeList);
                Laya.stage.on(Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
                this._list.selectedIndex = this._selectedIndex;
            }
            else {
                this._list && this._list.removeSelf();
            }
        }
    }
    _onStageMouseWheel(e) {
        if (!this._list || this._list.contains(e.target))
            return;
        this.removeList(null);
    }
    /**
     * 关闭下拉列表。
     */
    removeList(e) {
        var Laya = window.Laya;
        Laya.stage.off(Event.MOUSE_DOWN, this, this.removeList);
        Laya.stage.off(Event.MOUSE_WHEEL, this, this._onStageMouseWheel);
        this.isOpen = false;
    }
    /**
     * 滚动条皮肤。
     */
    get scrollBarSkin() {
        return this._scrollBarSkin;
    }
    set scrollBarSkin(value) {
        this._scrollBarSkin = value;
    }
    /**
     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    get sizeGrid() {
        return this._button.sizeGrid;
    }
    set sizeGrid(value) {
        this._button.sizeGrid = value;
    }
    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>VScrollBar</code> 滚动条组件的引用。
     */
    get scrollBar() {
        return this.list.scrollBar;
    }
    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的引用。
     */
    get button() {
        return this._button;
    }
    /**
     * 获取对 <code>ComboBox</code> 组件所包含的 <code>List</code> 列表组件的引用。
     */
    get list() {
        this._list || this._createList();
        return this._list;
    }
    set list(value) {
        if (value) {
            value.removeSelf();
            this._isCustomList = true;
            this._list = value;
            this._setListEvent(value);
            this._itemHeight = value.getCell(0).height + value.spaceY;
        }
    }
    /**@inheritDoc */
    /*override*/ set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.selectedIndex = parseInt(value);
        else if (value instanceof Array)
            this.labels = value.join(",");
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本标签颜色。
     * <p><b>格式：</b>upColor,overColor,downColor,disableColor</p>
     */
    get labelColors() {
        return this._button.labelColors;
    }
    set labelColors(value) {
        if (this._button.labelColors != value) {
            this._button.labelColors = value;
        }
    }
    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本边距。
     * <p><b>格式：</b>上边距,右边距,下边距,左边距</p>
     */
    get labelPadding() {
        return this._button.text.padding.join(",");
    }
    set labelPadding(value) {
        this._button.text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }
    /**
     * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的标签字体大小。
     */
    get labelSize() {
        return this._button.text.fontSize;
    }
    set labelSize(value) {
        this._button.text.fontSize = value;
    }
    /**
     * 表示按钮文本标签是否为粗体字。
     * @see laya.display.Text#bold
     */
    get labelBold() {
        return this._button.text.bold;
    }
    set labelBold(value) {
        this._button.text.bold = value;
    }
    /**
     * 表示按钮文本标签的字体名称，以字符串形式表示。
     * @see laya.display.Text#font
     */
    get labelFont() {
        return this._button.text.font;
    }
    set labelFont(value) {
        this._button.text.font = value;
    }
    /**
     * 表示按钮的状态值。
     * @see laya.ui.Button#stateNum
     */
    get stateNum() {
        return this._button.stateNum;
    }
    set stateNum(value) {
        this._button.stateNum = value;
    }
}
ILaya.regClass(ComboBox);
