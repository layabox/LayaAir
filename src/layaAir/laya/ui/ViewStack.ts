import { Node } from "../display/Node"
import { Sprite } from "../display/Sprite"
import { Box } from "./Box"
import { Handler } from "../utils/Handler"

/**
 * @en The ViewStack class is used for the View Stack class, which is used for setting and processing the display of views.
 * @zh ViewStack 类用于视图堆栈类，用于视图的显示等设置处理。
 */
export class ViewStack extends Box {
    /**@internal */
    protected _items: any[];
    /**@internal */
    protected _setIndexHandler: Handler = Handler.create(this, this.setIndex, null, false);
    /**@internal */
    protected _selectedIndex: number;

    /**
     * @en The index of the current view.
     * @zh 当前视图的索引。
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(value: number) {
        if (this._selectedIndex != value) {
            this.setSelect(this._selectedIndex, false);
            this._selectedIndex = value;
            this.setSelect(this._selectedIndex, true);
        }
    }

    /**
     * @en The currently selected item object.
     * @zh 当前选中的项对象。
     */
    get selection(): Node {
        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
    }

    set selection(value: Node) {
        this.selectedIndex = this._items.indexOf(value);
    }

    /**
     * @en Index setting processor.
     * Default callback parameters: index:int
     * @zh 索引设置处理器。
     * 默认回调参数：index:int
     */
    get setIndexHandler(): Handler {
        return this._setIndexHandler;
    }

    set setIndexHandler(value: Handler) {
        this._setIndexHandler = value;
    }

    /**
     * @en The array of view items.
     * @zh 视图集合数组。
     */
    get items(): any[] {
        return this._items;
    }

    /** @ignore */
    constructor() {
        super();

        this._items = [];
    }

    /**
     * @en Sets the `selected` property value of an item object by its index.
     * @param index The index of the object to be set.
     * @param selected Indicates the selected state of the object.
     * @zh 通过对象的索引设置项对象的 `selected` 属性值。
     * @param index 需要设置的对象的索引。
     * @param selected 表示对象的选中状态。
     */
    protected setSelect(index: number, selected: boolean): void {
        if (this._items && index > -1 && index < this._items.length) {
            this._items[index].visible = selected;
        }
    }

    /**
     * 设置属性<code>selectedIndex</code>的值。
     * @param index 选中项索引值。
     */
    protected setIndex(index: number): void {
        this.selectedIndex = index;
    }

    /**
     * @en Sets the view items in batch.
     * @param views An array of view objects to be set.
     * @zh 批量设置视图对象。
     * @param views 视图对象数组。
     */
    setItems(views: any[]): void {
        this.removeChildren();
        var index: number = 0;
        for (var i: number = 0, n: number = views.length; i < n; i++) {
            var item: Node = views[i];
            if (item) {
                item.name = "item" + index;
                this.addChild(item);
                index++;
            }
        }
        this.initItems();
    }

    /**
     * @en Adds a view to the ViewStack.Sets the name property of the view object to facilitate identification.
     * @param view The view object to be added.
     * @zh 添加视图对象到 ViewStack，并设置此视图对象的 `name` 属性。
     * @param view 需要添加的视图对象。
     */
    addItem(view: Node): void {
        view.name = "item" + this._items.length;
        this.addChild(view);
        this.initItems();
    }

    /**
     * @en This method is called after the object has been deserialized, and it initializes the view items.
     * @zh 反序列化后调用此方法，用以初始化视图项。
     */
    onAfterDeserialize() {
        super.onAfterDeserialize();
        this.initItems();
    }

    _afterInited(): void {
        this.initItems();
    }

    /**
     * @en Initialize the collection of view objects.
     * @zh 初始化视图对象集合。
     */
    initItems(): void {
        this._items.length = 0;
        for (var i: number = 0; i < 10000; i++) {
            var item: Sprite = (<Sprite>this.getChildByName("item" + i));
            if (item == null) {
                break;
            }
            this._items.push(item);
            item.visible = (i == this._selectedIndex);
        }
    }

    /**
     * @en Sets the data source for the ViewStack, updating the selectedIndex or properties accordingly.
     * @zh 为 ViewStack 设置数据源，相应地更新 selectedIndex 或属性。
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string') {
            this.selectedIndex = parseInt(value as string);
        } else {
            for (var prop in this._dataSource) {
                if (prop in this) {
                    (this as any)[prop] = this._dataSource[prop];
                }
            }
        }
    }
}