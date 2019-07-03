import { Box } from "./Box";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
/**
 * 当 <code>Group</code> 实例的 <code>selectedIndex</code> 属性发生变化时调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/
/**
 * <code>Group</code> 是一个可以自动布局的项集合控件。
 * <p> <code>Group</code> 的默认项对象为 <code>Button</code> 类实例。
 * <code>Group</code> 是 <code>Tab</code> 和 <code>RadioGroup</code> 的基类。</p>
 */
export class UIGroup extends Box {
    /**
     * 创建一个新的 <code>Group</code> 类实例。
     * @param labels 标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     * @param skin 皮肤。
     */
    constructor(labels = null, skin = null) {
        super();
        /**@private */
        this._selectedIndex = -1;
        /**@private */
        this._direction = "horizontal";
        /**@private */
        this._space = 0;
        this.skin = skin;
        this.labels = labels;
    }
    /**@inheritDoc */
    /*override*/ preinitialize() {
        this.mouseEnabled = true;
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._items && (this._items.length = 0);
        this._items = null;
        this.selectHandler = null;
    }
    /**
     * 添加一个项对象，返回此项对象的索引id。
     *
     * @param item 需要添加的项对象。
     * @param autoLayOut 是否自动布局，如果为true，会根据 <code>direction</code> 和 <code>space</code> 属性计算item的位置。
     * @return
     */
    addItem(item, autoLayOut = true) {
        var display = item;
        var index = this._items.length;
        display.name = "item" + index;
        this.addChild(display);
        this.initItems();
        if (autoLayOut && index > 0) {
            var preItem = this._items[index - 1];
            if (this._direction == "horizontal") {
                display.x = preItem._x + preItem.width + this._space;
            }
            else {
                display.y = preItem._y + preItem.height + this._space;
            }
        }
        else {
            if (autoLayOut) {
                display.x = 0;
                display.y = 0;
            }
        }
        return index;
    }
    /**
     * 删除一个项对象。
     * @param item 需要删除的项对象。
     * @param autoLayOut 是否自动布局，如果为true，会根据 <code>direction</code> 和 <code>space</code> 属性计算item的位置。
     */
    delItem(item, autoLayOut = true) {
        var index = this._items.indexOf(item);
        if (index != -1) {
            var display = item;
            this.removeChild(display);
            for (var i = index + 1, n = this._items.length; i < n; i++) {
                var child = this._items[i];
                child.name = "item" + (i - 1);
                if (autoLayOut) {
                    if (this._direction == "horizontal") {
                        child.x -= display.width + this._space;
                    }
                    else {
                        child.y -= display.height + this._space;
                    }
                }
            }
            this.initItems();
            if (this._selectedIndex > -1) {
                var newIndex;
                newIndex = this._selectedIndex < this._items.length ? this._selectedIndex : (this._selectedIndex - 1);
                this._selectedIndex = -1;
                this.selectedIndex = newIndex;
            }
        }
    }
    /**@internal */
    _afterInited() {
        this.initItems();
    }
    /**
     * 初始化项对象们。
     */
    initItems() {
        this._items || (this._items = []);
        this._items.length = 0;
        for (var i = 0; i < 10000; i++) {
            var item = this.getChildByName("item" + i);
            if (item == null)
                break;
            this._items.push(item);
            item.selected = (i === this._selectedIndex);
            item.clickHandler = Handler.create(this, this.itemClick, [i], false);
        }
    }
    /**
     * @private
     * 项对象的点击事件侦听处理函数。
     * @param index 项索引。
     */
    itemClick(index) {
        this.selectedIndex = index;
    }
    /**
     * 表示当前选择的项索引。默认值为-1。
     */
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        if (this._selectedIndex != value) {
            this.setSelect(this._selectedIndex, false);
            this._selectedIndex = value;
            this.setSelect(value, true);
            this.event(Event.CHANGE);
            this.selectHandler && this.selectHandler.runWith(this._selectedIndex);
        }
    }
    /**
     * @private
     * 通过对象的索引设置项对象的 <code>selected</code> 属性值。
     * @param index 需要设置的项对象的索引。
     * @param selected 表示项对象的选中状态。
     */
    setSelect(index, selected) {
        if (this._items && index > -1 && index < this._items.length)
            this._items[index].selected = selected;
    }
    /**
     * @copy laya.ui.Image#skin
     */
    get skin() {
        return this._skin;
    }
    set skin(value) {
        if (this._skin != value) {
            this._skin = value;
            if (this._skin && !Loader.getRes(this._skin)) {
                window.Laya.loader.load(this._skin, Handler.create(this, this._skinLoaded), null, Loader.IMAGE, 1);
            }
            else {
                this._skinLoaded();
            }
        }
    }
    _skinLoaded() {
        this._setLabelChanged();
        this.event(Event.LOADED);
    }
    /**
     * 标签集合字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     */
    get labels() {
        return this._labels;
    }
    set labels(value) {
        if (this._labels != value) {
            this._labels = value;
            this.removeChildren();
            this._setLabelChanged();
            if (this._labels) {
                var a = this._labels.split(",");
                for (var i = 0, n = a.length; i < n; i++) {
                    var item = this.createItem(this._skin, a[i]);
                    item.name = "item" + i;
                    this.addChild(item);
                }
            }
            this.initItems();
        }
    }
    /**
     * @private
     * 创建一个项显示对象。
     * @param skin 项对象的皮肤。
     * @param label 项对象标签。
     */
    createItem(skin, label) {
        return null;
    }
    /**
     * @copy laya.ui.Button#labelColors()
     */
    get labelColors() {
        return this._labelColors;
    }
    set labelColors(value) {
        if (this._labelColors != value) {
            this._labelColors = value;
            this._setLabelChanged();
        }
    }
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @see laya.display.Text.stroke()
     */
    get labelStroke() {
        return this._labelStroke;
    }
    set labelStroke(value) {
        if (this._labelStroke != value) {
            this._labelStroke = value;
            this._setLabelChanged();
        }
    }
    /**
     * <p>描边颜色，以字符串表示。</p>
     * 默认值为 "#000000"（黑色）;
     * @see laya.display.Text.strokeColor()
     */
    get labelStrokeColor() {
        return this._labelStrokeColor;
    }
    set labelStrokeColor(value) {
        if (this._labelStrokeColor != value) {
            this._labelStrokeColor = value;
            this._setLabelChanged();
        }
    }
    /**
     * <p>表示各个状态下的描边颜色。</p>
     * @see laya.display.Text.strokeColor()
     */
    get strokeColors() {
        return this._strokeColors;
    }
    set strokeColors(value) {
        if (this._strokeColors != value) {
            this._strokeColors = value;
            this._setLabelChanged();
        }
    }
    /**
     * 表示按钮文本标签的字体大小。
     */
    get labelSize() {
        return this._labelSize;
    }
    set labelSize(value) {
        if (this._labelSize != value) {
            this._labelSize = value;
            this._setLabelChanged();
        }
    }
    /**
     * 表示按钮的状态值，以数字表示，默认为3态。
     * @see laya.ui.Button#stateNum
     */
    get stateNum() {
        return this._stateNum;
    }
    set stateNum(value) {
        if (this._stateNum != value) {
            this._stateNum = value;
            this._setLabelChanged();
        }
    }
    /**
     * 表示按钮文本标签是否为粗体字。
     */
    get labelBold() {
        return this._labelBold;
    }
    set labelBold(value) {
        if (this._labelBold != value) {
            this._labelBold = value;
            this._setLabelChanged();
        }
    }
    /**
     * 表示按钮文本标签的字体名称，以字符串形式表示。
     * @see laya.display.Text.font()
     */
    get labelFont() {
        return this._labelFont;
    }
    set labelFont(value) {
        if (this._labelFont != value) {
            this._labelFont = value;
            this._setLabelChanged();
        }
    }
    /**
     * 表示按钮文本标签的边距。
     * <p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
     */
    get labelPadding() {
        return this._labelPadding;
    }
    set labelPadding(value) {
        if (this._labelPadding != value) {
            this._labelPadding = value;
            this._setLabelChanged();
        }
    }
    /**
     * 布局方向。
     * <p>默认值为"horizontal"。</p>
     * <p><b>取值：</b>
     * <li>"horizontal"：表示水平布局。</li>
     * <li>"vertical"：表示垂直布局。</li>
     * </p>
     */
    get direction() {
        return this._direction;
    }
    set direction(value) {
        this._direction = value;
        this._setLabelChanged();
    }
    /**
     * 项对象们之间的间隔（以像素为单位）。
     */
    get space() {
        return this._space;
    }
    set space(value) {
        this._space = value;
        this._setLabelChanged();
    }
    /**
     * @private
     * 更改项对象的属性值。
     */
    changeLabels() {
        this._labelChanged = false;
        if (this._items) {
            var left = 0;
            for (var i = 0, n = this._items.length; i < n; i++) {
                var btn = this._items[i];
                this._skin && (btn.skin = this._skin);
                this._labelColors && (btn.labelColors = this._labelColors);
                this._labelSize && (btn.labelSize = this._labelSize);
                this._labelStroke && (btn.labelStroke = this._labelStroke);
                this._labelStrokeColor && (btn.labelStrokeColor = this._labelStrokeColor);
                this._strokeColors && (btn.strokeColors = this._strokeColors);
                this._labelBold && (btn.labelBold = this._labelBold);
                this._labelPadding && (btn.labelPadding = this._labelPadding);
                this._labelAlign && (btn.labelAlign = this._labelAlign);
                this._stateNum && (btn.stateNum = this._stateNum);
                this._labelFont && (btn.labelFont = this._labelFont);
                if (this._direction === "horizontal") {
                    btn.y = 0;
                    btn.x = left;
                    left += btn.width + this._space;
                }
                else {
                    btn.x = 0;
                    btn.y = left;
                    left += btn.height + this._space;
                }
            }
        }
        this._sizeChanged();
    }
    /**@inheritDoc */
    /*override*/ commitMeasure() {
        this.runCallLater(this.changeLabels);
    }
    /**
     * 项对象们的存放数组。
     */
    get items() {
        return this._items;
    }
    /**
     * 获取或设置当前选择的项对象。
     */
    get selection() {
        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
    }
    set selection(value) {
        this.selectedIndex = this._items.indexOf(value);
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
    /**@private */
    _setLabelChanged() {
        if (!this._labelChanged) {
            this._labelChanged = true;
            this.callLater(this.changeLabels);
        }
    }
}
ILaya.regClass(UIGroup);
