import { Box } from "./Box";
import { ISelect } from "./ISelect";
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Loader } from "../net/Loader"
import { Button } from "./Button"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { HideFlags } from "../Const";
import { URL } from "../net/URL";

/**
 * @en UIGroup is an item collection control that can be automatically laid out. 
 * The default item object for UIGroup is a Button class instance.
 * UIGroup is the base class for Tab and RadioGroup.
 * @zh UIGroup 是一个可以自动布局的项集合控件。
 * UIGroup 的默认项对象为 Button 类实例。
 * UIGroup是 Tab 和 RadioGroup 的基类。
 */
export class UIGroup extends Box {

    protected _items: ISelect[];
    protected _selectedIndex: number = -1;
    protected _skin: string;
    protected _direction: string = "horizontal";
    protected _space: number = 0;
    protected _labels: string;
    protected _labelColors: string;
    private _labelFont: string;
    protected _labelStrokeColor: string;
    protected _strokeColors: string;
    protected _labelStroke: number;
    protected _labelSize: number;
    protected _labelBold: boolean;
    protected _labelPadding: string;
    protected _labelAlign: string;
    protected _stateNum: number;
    protected _labelChanged: boolean;
    /**
     * @en The processor executed when changing the selection of the Group, (Default return parameter: item index (index: int)).
     * @zh 改变 Group 的选择项时执行的处理器，(默认返回参数： 项索引（index:int）)。
     */
    selectHandler: Handler;

    /**
     * @en Indicates the index of the currently selected item. The default value is -1.
     * @zh 表示当前选择的项索引。默认值为-1。
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value: number) {
        if (this._selectedIndex != value) {
            this.setSelect(this._selectedIndex, false);
            this._selectedIndex = value;
            this.setSelect(value, true);
            this.event(Event.CHANGE);
            this.selectHandler && this.selectHandler.runWith(this._selectedIndex);
        }
    }

    /**
     * @en The URL of the skin for the component.
     * @zh 组件的皮肤URL。
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (value == "")
            value = null;
        if (this._skin == value)
            return;

        this._setSkin(value);
    }

    /**
     * @en The labels string, separated by commas, such as "item0,item1,item2,item3,item4,item5".
     * @zh 标签集合字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
     */
    get labels(): string {
        return this._labels;
    }

    set labels(value: string) {
        if (value == "")
            value = null;
        if (this._labels != value) {
            this._labels = value;
            let i = 0;
            let n = this.numChildren;
            while (i < n) {
                let item = this.getChildAt(i);
                if (item.hasHideFlag(HideFlags.HideAndDontSave) && item.name && item.name.startsWith("item")) {
                    this.removeChildAt(i);
                    n--;
                }
                else
                    i++;
            }
            this._setLabelChanged();
            if (this._labels) {
                let a = this._labels.split(",");
                for (let i = 0, n = a.length; i < n; i++) {
                    let item = this.createItem(this._skin, a[i]);
                    item.name = "item" + i;
                    item.hideFlags = HideFlags.HideAndDontSave;
                    this.addChild(item);
                }
            }
            this.initItems();
        }
    }

    /**
     * @en The label colors string for the component.
     * @zh 组件的标签颜色字符串。
     */
    get labelColors(): string {
        return this._labelColors;
    }

    set labelColors(value: string) {
        if (this._labelColors != value) {
            this._labelColors = value;
            this._setLabelChanged();
        }
    }

    /**
     * @en The stroke width (in pixels) for the label.
     * The default value is 0, indicating no stroke.
     * @zh 描边宽度（以像素为单位）。
     * 默认值0，表示不描边。
     */
    get labelStroke(): number {
        return this._labelStroke;
    }

    set labelStroke(value: number) {
        if (this._labelStroke != value) {
            this._labelStroke = value;
            this._setLabelChanged();
        }
    }

    /**
     * @en The stroke color for the label, represented as a string.
     * The default color is "#000000" (black).
     * @zh 描边颜色，以字符串表示。
     * 默认值为 "#000000"（黑色）;
     */
    get labelStrokeColor(): string {
        return this._labelStrokeColor;
    }

    set labelStrokeColor(value: string) {
        if (this._labelStrokeColor != value) {
            this._labelStrokeColor = value;
            this._setLabelChanged();
        }
    }

    /**
     * @en The stroke colors in various states.
     * @zh 各个状态下的描边颜色
     */
    get strokeColors(): string {
        return this._strokeColors;
    }

    set strokeColors(value: string) {
        if (this._strokeColors != value) {
            this._strokeColors = value;
            this._setLabelChanged();
        }
    }

    /**
     * @en The font size of the button's text label.
     * @zh 按钮文本标签的字体大小。
     */
    get labelSize(): number {
        return this._labelSize;
    }

    set labelSize(value: number) {
        if (this._labelSize != value) {
            this._labelSize = value;
            this._setLabelChanged();
        }
    }

    /**
     * @en The number of states the button has, represented as a number. The default is 3 states.
     * @zh 按钮的状态值，以数字表示，默认为3态。
     */
    get stateNum(): number {
        return this._stateNum;
    }

    set stateNum(value: number) {
        if (this._stateNum != value) {
            this._stateNum = value;
            this._setLabelChanged();
        }
    }

    /**
     * @en Whether the button's text label is bold.
     * @zh 按钮文本标签是否为粗体字。
     */
    get labelBold(): boolean {
        return this._labelBold;
    }

    set labelBold(value: boolean) {
        if (this._labelBold != value) {
            this._labelBold = value;
            this._setLabelChanged();
        }
    }

    /**
     * @en The font name of the button's text label, represented as a string.
     * @zh 按钮文本标签的字体名称，以字符串形式表示。
     */
    get labelFont(): string {
        return this._labelFont;
    }

    set labelFont(value: string) {
        if (this._labelFont != value) {
            this._labelFont = value;
            this._setLabelChanged();
        }
    }
    /**
     * @en The padding of the button's text label.
     * Format: "Top,Right,Bottom,Left".
     * @zh 按钮文本标签的边距。
     * 格式："上边距,右边距,下边距,左边距"。
     */
    get labelPadding(): string {
        return this._labelPadding;
    }

    set labelPadding(value: string) {
        if (this._labelPadding != value) {
            this._labelPadding = value;
            this._setLabelChanged();
        }
    }

    /**
     * @en The layout direction. The default value is "horizontal".
     * Possible values: 
     * "horizontal": Indicates a horizontal layout.
     * "vertical": Indicates a vertical layout.
     * @zh 布局方向。 默认值为"horizontal"。
     * 取值：
     * "horizontal"：表示水平布局。
     * "vertical"：表示垂直布局。
     */
    get direction(): string {
        return this._direction;
    }

    set direction(value: string) {
        this._direction = value;
        this._setLabelChanged();
    }

    /**
     * @en The space between items in pixels.
     * @zh 项对象们之间的间隔（以像素为单位）。
     */
    get space(): number {
        return this._space;
    }

    set space(value: number) {
        this._space = value;
        this._setLabelChanged();
    }

    /**
     * @en The array where the item objects are stored.
     * @zh 项对象们的存放数组。
     */
    get items(): ISelect[] {
        return this._items;
    }

    /**
     * @en The currently selected item object.
     * @zh 当前选择的项对象。
     */
    get selection(): ISelect {
        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
    }

    set selection(value: ISelect) {
        this.selectedIndex = this._items.indexOf(value);
    }

    /**
     * @en Creates an instance of UIGroup.
     * @param labels A string of labels separated by commas, e.g., "item0,item1,item2,item3,item4,item5".
     * @param skin The skin. 
     * @zh 创建一个 UIGroup 的实例。
     * @param labels 标签集字符串，以逗号分隔，例如 "item0,item1,item2,item3,item4,item5"。
     * @param skin 皮肤。
     */
    constructor(labels: string = null, skin: string = null) {
        super();
        this._items = [];
        this.skin = skin;
        this.labels = labels;
    }

    /**
     * @internal 
     * @en 2.0 parsing will call
     * @zh 2.0解析会调用 
     */
    _afterInited(): void {
        this.initItems();
    }

    /** @internal */
    _setSkin(url: string): Promise<void> {
        this._skin = url;
        if (url) {
            if (this._skinBaseUrl)
                url = URL.formatURL(url, this._skinBaseUrl);
            if (Loader.getRes(url)) {
                this._skinLoaded();
                return Promise.resolve();
            }
            else
                return ILaya.loader.load(url, Loader.IMAGE).then(tex => this._skinLoaded());
        }
        else {
            this._skinLoaded();
            return Promise.resolve();
        }
    }

    protected _skinLoaded(): void {
        if (this._destroyed)
            return;

        this._setLabelChanged();
        this.event(Event.LOADED);
    }

    protected _setLabelChanged(): void {
        if (!this._labelChanged) {
            this._labelChanged = true;
            this.callLater(this.changeLabels);
        }
    }

    /**
     * @en The item object's click event listener function, used to set the current selected item index.
     * @param index The item index.
     * @zh 项对象的点击事件侦听处理函数，用于设置当前选择的项索引
     * @param index 项索引。
     */
    protected itemClick(index: number): void {
        this.selectedIndex = index;
    }

    /**
     * @en Creates an item display object.
     * @param skin The skin path for the item object.
     * @param label The text label for the item object.
     * @zh 创建一个项显示对象。
     * @param skin 项对象的皮肤路径。
     * @param label 项对象的文本标签。
     */
    protected createItem(skin: string, label: string): Sprite {
        return null;
    }

    /**
     * @en Change the property value of an item object.
     * @zh 更改项对象的属性值。
     */
    protected changeLabels(): void {
        this._labelChanged = false;
        if (this._items) {
            var left: number = 0
            for (var i: number = 0, n: number = this._items.length; i < n; i++) {
                var btn: Button = (<Button>this._items[i]);
                this._skin && (btn.skin = this._skin);
                this._labelColors && (btn.labelColors = this._labelColors);
                this._labelSize != null && (btn.labelSize = this._labelSize);
                this._labelStroke != null && (btn.labelStroke = this._labelStroke);
                this._labelStrokeColor && (btn.labelStrokeColor = this._labelStrokeColor);
                this._strokeColors && (btn.strokeColors = this._strokeColors);
                this._labelBold && (btn.labelBold = this._labelBold);
                this._labelPadding && (btn.labelPadding = this._labelPadding);
                this._labelAlign && (btn.labelAlign = this._labelAlign);
                this._stateNum != null && (btn.stateNum = this._stateNum);
                this._labelFont && (btn.labelFont = this._labelFont);
                if (this._direction === "horizontal") {
                    btn.y = 0;
                    btn.x = left;
                    left += btn.width + this._space;
                } else {
                    btn.x = 0;
                    btn.y = left;
                    left += btn.height + this._space;
                }
            }
        }
        this._sizeChanged();
    }

    protected commitMeasure(): void {
        this.runCallLater(this.changeLabels);
    }

    /**
     * @en Sets the `selected`property value of an item object by its index.
     * @param index The index of the item object to be set.
     * @param selected Indicates the selected state of the item object.
     * @zh 通过对象的索引设置项对象的 `selected`属性值。
     * @param index 需要设置的项对象的索引。
     * @param selected 表示项对象的选中状态。
     */

    protected setSelect(index: number, selected: boolean): void {
        if (this._items && index > -1 && index < this._items.length) this._items[index].selected = selected;
    }

    protected preinitialize(): void {
        this.mouseEnabled = true;
    }

    /**
     * @en Destroys this instance.
     * @param destroyChild Whether to destroy the child components.
     * @zh 销毁此实例。
     * @param destroyChild 是否销毁子组件。
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._items && (this._items.length = 0);
        this._items = null;
        this.selectHandler = null;
    }

    /**
     * @en Adds an item object.
     * @param item The item object to be added.
     * @param autoLayout Whether to automatically layout the item. If true, the position of the item will be calculated based on the direction and space properties.
     * @returns returns the index ID of this item object.
     * @zh 添加一个项对象。
     * @param item 需要添加的项对象。
     * @param autoLayout 是否自动布局，如果为true，会根据 direction 和 space 属性计算item的位置。
     * @returns 返回添加的项对象的索引ID。
     */
    addItem(item: ISelect, autoLayout: boolean = true): number {
        let display = (<Sprite>(item as any));
        let index = this._items.length;
        display.name = "item" + index;
        this.addChild(display);
        this.initItems();

        if (autoLayout && index > 0) {
            let preItem = (<Sprite>(this._items[index - 1] as any));
            if (this._direction == "horizontal") {
                display.x = preItem._x + preItem.width + this._space;
            } else {
                display.y = preItem._y + preItem.height + this._space;
            }
        } else {
            if (autoLayout) {
                display.x = 0;
                display.y = 0;
            }
        }
        return index;
    }

    /**
     * @en Removes an item object.
     * @param item The item object to be added.
     * @param autoLayout Whether to automatically layout the item. If true, the position of the item will be calculated based on the direction and space properties. Default is true.
     * @zh 删除一个项对象。
     * @param item 需要删除的项对象。
     * @param autoLayout 是否自动布局，如果为true，会根据 direction 和 space 属性计算item的位置。
     */
    delItem(item: ISelect, autoLayout: boolean = true): void {
        var index: number = this._items.indexOf(item);
        if (index != -1) {
            let display: Sprite = (<Sprite>(item as any));
            this.removeChild(display);
            for (let i = index + 1, n = this._items.length; i < n; i++) {
                let child = (<Sprite>(this._items[i] as any));
                child.name = "item" + (i - 1);
                if (autoLayout) {
                    if (this._direction == "horizontal") {
                        child.x -= display.width + this._space;
                    } else {
                        child.y -= display.height + this._space;
                    }
                }
            }
            this.initItems();
            if (this._selectedIndex > -1) {
                let newIndex = this._selectedIndex < this._items.length ? this._selectedIndex : (this._selectedIndex - 1);
                this._selectedIndex = -1;
                this.selectedIndex = newIndex;
            }
        }
    }

    /**
     * @en This method is called after deserialization of this instance.
     * @zh 反序列化后调用此方法。
     */
    onAfterDeserialize() {
        super.onAfterDeserialize();
        if (!this._labels)
            this.initItems();
    }

    /**
     * @en Initializes the item objects.
     * @zh 初始化项对象们。
     */
    initItems(): void {
        this._items.length = 0;
        for (let i = 0; i < 10000; i++) {
            let item = <ISelect>this.getChildByName("item" + i);
            if (item == null)
                break;
            this._items.push(item);
            item.selected = (i === this._selectedIndex);
            item.clickHandler = Handler.create(this, this.itemClick, [i], false);
        }
    }

    /**
     * @en Sets the data source for this component.
     * @zh 设置此组件的数据源。
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.selectedIndex = parseInt(value as string);
        else if (value instanceof Array)
            this.labels = ((<any[]>value)).join(",");
        else
            super.set_dataSource(value);
    }
}