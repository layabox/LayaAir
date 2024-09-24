import { Box } from "./Box";
import { List } from "./List";
import { ScrollBar } from "./ScrollBar";
import { Clip } from "./Clip";
import { Event } from "../events/Event"
import { Handler } from "../utils/Handler"
import { HideFlags } from "../Const";
import { XML } from "../html/XML";

/**@internal */
interface ITreeDataSource {
    x: number;
    hasChild: boolean;
    isOpen: boolean;
    isDirectory: boolean;
}

/**
 * @en The `Tree` UI component allows users to view hierarchical data arranged in an expandable tree format.
 * @zh `Tree` UI组件使用户可以查看排列为可扩展树的层次结构数据。
 */
export class Tree extends Box {
    protected _list: List;
    protected _source: any[];
    protected _renderHandler: Handler;
    protected _spaceLeft: number = 10;
    protected _spaceBottom: number = 0;
    protected _keepStatus: boolean = true;

    /**
     * @en Determines whether to maintain the previous open state after the data source changes. The default value is true.
     * - true: Maintain the previous open state.
     * - false: Do not maintain the previous open state.
     * @zh 数据源发生变化后，是否保持之前打开状态，默认为true。
     * - true：保持之前打开状态。
     * - false：不保持之前打开状态。
     */
    get keepStatus(): boolean {
        return this._keepStatus;
    }

    set keepStatus(value: boolean) {
        this._keepStatus = value;
    }

    /**
     * @en The list data source, including only the data of currently visible nodes.
     * @zh 列表数据源，只包含当前可视节点数据。
     */
    get array(): any[] {
        return this._list.array;
    }

    set array(value: any[]) {
        if (this._keepStatus && this._list.array && value) {
            this.parseOpenStatus(this._list.array, value);
        }
        this._source = value;
        this._list.array = this.getArray();
    }

    /**
     * @en The data source containing all node data.
     * @zh 数据源，全部节点数据。
     */
    get source(): any[] {
        return this._source;
    }

    /**
     * @en The `List` instance contained within this object.
     * @zh 此对象包含的 `List` 实例对象。
     */
    get list(): List {
        return this._list;
    }

    /**
     * @en The cell renderer for the List instance contained in this object.
     * Possible values:
     * Cell class object.
     * JSON description of the UI.
     * @zh 此对象包含的List实例的单元格渲染器。
     * 取值：
     * 单元格类对象。
     *  UI 的 JSON 描述。
     */
    get itemRender(): any {
        return this._list.itemRender;
    }

    set itemRender(value: any) {
        this._list.itemRender = value;
    }

    /**
     * @en The skin of the scroll bar.
     * @zh 滚动条皮肤。
     */
    get scrollBarSkin(): string {
        return this._list.vScrollBarSkin;
    }

    set scrollBarSkin(value: string) {
        this._list.vScrollBarSkin = value;
    }

    /**
     * @en The scroll bar.
     * @zh 滚动条。
     */
    get scrollBar(): ScrollBar {
        return this._list.scrollBar;
    }

    /**
     * @en Handler for cell mouse events. Default returns parameters (e:Event,index:int).
     * @zh 单元格鼠标事件处理器。默认返回参数（e:Event,index:int）。
     */
    get mouseHandler(): Handler {
        return this._list.mouseHandler;
    }

    set mouseHandler(value: Handler) {
        this._list.mouseHandler = value;
    }

    /**
     * @en The render handler for the `Tree` instance.
     * @zh `Tree` 实例的渲染处理器。
     */
    get renderHandler(): Handler {
        return this._renderHandler;
    }

    set renderHandler(value: Handler) {
        this._renderHandler = value;
    }

    /**
     * @en The left indentation distance in pixels.
     * @zh 左侧缩进距离（以像素为单位）。
     */
    get spaceLeft(): number {
        return this._spaceLeft;
    }

    set spaceLeft(value: number) {
        this._spaceLeft = value;
    }

    /**
     * @en The space between each item in pixels.
     * @zh 每一项之间的间隔距离（以像素为单位）。
     */
    get spaceBottom(): number {
        return this._list.spaceY;
    }

    set spaceBottom(value: number) {
        this._list.spaceY = value;
    }

    /**
     * @en The index of the currently selected item.
     * @zh 表示当前选择的项索引。
     */
    get selectedIndex(): number {
        return this._list.selectedIndex;
    }

    set selectedIndex(value: number) {
        this._list.selectedIndex = value;
    }

    /**
     * @en The data source of the currently selected item.
     * @zh 当前选中的项对象的数据源。
     */
    get selectedItem(): any {
        return this._list.selectedItem;
    }

    set selectedItem(value: any) {
        this._list.selectedItem = value;
    }

    /**
     * @en The data source in XML structure.
     * @zh XML 结构的数据源。
     */
    set xml(value: XML) {
        var arr: any[] = [];
        this.parseXml(value, arr, null, true);

        this.array = arr;
    }

    /**
     * @en The value of the `path` property of the selected tree node item.
     * @zh 表示选择的树节点项的 `path` 属性值。
     */
    get selectedPath(): string {
        if (this._list.selectedItem) {
            return this._list.selectedItem.path;
        }
        return null;
    }

    /**
     * @en Creats an instance of `Tree`.
     * The `width` and `height` properties are both set to 200 in the `Tree` constructor.
     * @zh 创建一个 `Tree` 实例。
     * 在`Tree`构造函数中设置属性width、height的值默认都为200。
     */
    constructor() {
        super();
        this.width = this.height = 200;
    }
    protected createChildren(): void {
        this._list = new List();
        this._list.hideFlags = HideFlags.HideAndDontSave;
        this._list.left = 0;
        this._list.right = 0;
        this._list.top = 0;
        this._list.bottom = 0;
        this._list._skinBaseUrl = this._skinBaseUrl;
        this.addChild(this._list);
        this._list.renderHandler = Handler.create(this, this.renderItem, null, false);
        this._list.repeatX = 1;
        this._list.on(Event.CHANGE, this, this.onListChange);
    }

    /**
     * @en this object contains the List instance's Event.CHANGE event listener function.
     * @zh 此对象包含的List实例的Event.CHANGE事件侦听处理函数。
     */
    protected onListChange(e: Event = null): void {
        this.event(Event.CHANGE);
    }

    /**
     * @en Get the data source collection.
     * @zh 获取数据源集合。
     */
    protected getArray(): any[] {
        var arr: any[] = [];
        for (let key in this._source) {//TODO TS
            let item = this._source[key];
            if (this.getParentOpenStatus(item)) {
                item.x = this._spaceLeft * this.getDepth(item);
                arr.push(item);
            }
        }
        return arr;
    }

    /**
     * @en Get item object's depth.
     * @zh 获取项对象的深度。
     */
    protected getDepth(item: any, num: number = 0): number {
        if (item.nodeParent == null) return num;
        else return this.getDepth(item.nodeParent, num + 1);
    }

    /**
     * @en Get item object's parent open status.
     * @zh 获取项对象的上一级的打开状态。
     */
    protected getParentOpenStatus(item: any): boolean {
        var parent: any = item.nodeParent;
        if (parent == null) {
            return true;
        } else {
            if (parent.isOpen) {
                if (parent.nodeParent != null) return this.getParentOpenStatus(parent);
                else return true;
            } else {
                return false;
            }
        }
    }

    /**
     * @en Renders a item object.
     * @param cell a item object.
     * @param index item's index.
     * @zh 渲染一个项对象。
     * @param cell 一个项对象。
     * @param index 项的索引。
     */
    protected renderItem(cell: Box, index: number): void {
        var item: ITreeDataSource = cell.dataSource;
        if (item) {
            cell.left = item.x;
            var arrow = cell.getChildByName("arrow") as Clip;
            if (arrow) {
                if (item.hasChild) {
                    arrow.visible = true;
                    arrow.index = item.isOpen ? 1 : 0;
                    (<any>arrow).__cellIndex = index;
                    arrow.off(Event.CLICK, this, this.onArrowClick);
                    arrow.on(Event.CLICK, this, this.onArrowClick);
                } else {
                    arrow.visible = false;
                }
            }
            var folder = cell.getChildByName("folder") as Clip;
            if (folder) {
                if (folder.clipY == 2) {
                    folder.index = item.isDirectory ? 0 : 1;
                } else {
                    folder.index = item.isDirectory ? item.isOpen ? 1 : 0 : 2;
                }
            }
            this._renderHandler && this._renderHandler.runWith([cell, index]);
        }
    }

    private onArrowClick(e: Event): void {
        var arrow = e.currentTarget;
        var index = arrow.__cellIndex;
        this._list.array[index].isOpen = !this._list.array[index].isOpen;
        this.event(Event.OPEN);
        this._list.array = this.getArray();
    }

    /**
     * @en parse data source of XML type.
     * @zh 解析并处理XML类型的数据源。
     */
    protected parseXml(xml: XML, source: any[], nodeParent: any, isRoot: boolean): void {
        var obj: any;
        var list = xml.elements();
        var childCount = list.length;
        if (!isRoot) {
            obj = {};
            var list2 = xml.attributes;
            for (let key in list2) {
                var value = list2[key];
                obj[key] = value == "true" ? true : value == "false" ? false : value;
            }
            obj.nodeParent = nodeParent;
            if (childCount > 0) obj.isDirectory = true;
            obj.hasChild = childCount > 0;
            source.push(obj);
        }
        for (var i = 0; i < childCount; i++) {
            var node = list[i];
            this.parseXml(node, source, obj, false);
        }
    }

    /**
     * @en Handle the open state of the data items.
     * @zh 处理数据项的打开状态。
     */
    protected parseOpenStatus(oldSource: any[], newSource: any[]): void {
        for (var i = 0, n = newSource.length; i < n; i++) {
            var newItem = newSource[i];
            if (newItem.isDirectory) {
                for (var j = 0, m = oldSource.length; j < m; j++) {
                    var oldItem = oldSource[j];
                    if (oldItem.isDirectory && this.isSameParent(oldItem, newItem) && newItem.label == oldItem.label) {
                        newItem.isOpen = oldItem.isOpen;
                        break;
                    }
                }
            }
        }
    }

    /**
     * @en Determine whether the two item objects have the same parent node in the tree structure.
     * @param item1 Item object.
     * @param item2 Item object.    
     * @returns If the parent node is the same, the value of true. Otherwise, false.
     * @zh 判断两个项对象在树结构中的父节点是否相同。
     * @param item1 项对象。
     * @param item2 项对象。
     * @returns 如果父节点相同值为true，否则值为false。
     */
    protected isSameParent(item1: any, item2: any): boolean {
        if (item1.nodeParent == null && item2.nodeParent == null) return true;
        else if (item1.nodeParent == null || item2.nodeParent == null) return false
        else {
            if (item1.nodeParent.label == item2.nodeParent.label) return this.isSameParent(item1.nodeParent, item2.nodeParent);
            else return false;
        }
    }

    /**
     * @en Retrieve the value of a specified key from the data source.
     * @zh 获取数据源中指定键名的值。
     */
    private getFilterSource(array: any[], result: any[], key: string): void {
        key = key.toLocaleLowerCase();
        for (let item of array) {
            if (!item.isDirectory && String(item.label).toLowerCase().indexOf(key) > -1) {
                item.x = 0;
                result.push(item);
            }
            if (item.child && item.child.length > 0) {
                this.getFilterSource(item.child, result, key);
            }
        }
    }

    /**
     * @en Set the open state of an item object by index.
     * @param index The item index.
     * @param isOpen Whether the item is open.
     * @zh 设置指定项索引的项对象的打开状态。
     * @param index 项索引。
     * @param isOpen 是否处于打开状态。
     */
    setItemState(index: number, isOpen: boolean): void {
        if (!this._list.array[index]) return;
        this._list.array[index].isOpen = isOpen;
        this._list.array = this.getArray();
    }

    /**
     * @en Refresh the list.
     * @zh 刷新项列表。
     */
    fresh(): void {
        this._list.array = this.getArray();
        this.repaint();
    }

    /**
     * @en Set the data source.
     * @param value The data source.
     * @zh 设置数据源。
     * @param value The data source.
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        //if (value is XmlDom) xml = value as XmlDom;
        super.set_dataSource(value);
    }

    /**
     * @en Update the list to show items with the specified key name.
     * @param key The key name.
     * @zh 更新项列表，显示指定键名的数据项。
     * @param key 键名。
     */
    filter(key: string): void {
        if (Boolean(key)) {
            var result: any[] = [];
            this.getFilterSource(this._source, result, key);
            this._list.array = result;
        } else {
            this._list.array = this.getArray();
        }
    }

    /**
     * @en Destroy the object.
     * @param destroyChild Whether to destroy the child objects as well.
     * @zh 销毁对象。
     * @param destroyChild 是否销毁子对象。
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._list && this._list.destroy(destroyChild);
        this._list = null;
        this._source = null;
        this._renderHandler = null;
    }
}
