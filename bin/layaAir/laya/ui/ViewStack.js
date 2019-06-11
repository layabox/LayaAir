import { Box } from "./Box";
import { Handler } from "../utils/Handler";
import { ILaya } from "ILaya";
/**
 * <code>ViewStack</code> 类用于视图堆栈类，用于视图的显示等设置处理。
 */
export class ViewStack extends Box {
    constructor() {
        super(...arguments);
        /**@private */
        this._setIndexHandler = Handler.create(this, this.setIndex, null, false);
    }
    /**
     * 批量设置视图对象。
     * @param views 视图对象数组。
     */
    setItems(views) {
        this.removeChildren();
        var index = 0;
        for (var i = 0, n = views.length; i < n; i++) {
            var item = views[i];
            if (item) {
                item.name = "item" + index;
                this.addChild(item);
                index++;
            }
        }
        this.initItems();
    }
    /**
     * 添加视图。
     * @internal 添加视图对象，并设置此视图对象的<code>name</code> 属性。
     * @param view 需要添加的视图对象。
     */
    addItem(view) {
        view.name = "item" + this._items.length;
        this.addChild(view);
        this.initItems();
    }
    _afterInited() {
        this.initItems();
    }
    /**
     * 初始化视图对象集合。
     */
    initItems() {
        this._items = [];
        for (var i = 0; i < 10000; i++) {
            var item = this.getChildByName("item" + i);
            if (item == null) {
                break;
            }
            this._items.push(item);
            item.visible = (i == this._selectedIndex);
        }
    }
    /**
     * 表示当前视图索引。
     */
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(value) {
        if (this._selectedIndex != value) {
            this.setSelect(this._selectedIndex, false);
            this._selectedIndex = value;
            this.setSelect(this._selectedIndex, true);
        }
    }
    /**
     * @private
     * 通过对象的索引设置项对象的 <code>selected</code> 属性值。
     * @param index 需要设置的对象的索引。
     * @param selected 表示对象的选中状态。
     */
    setSelect(index, selected) {
        if (this._items && index > -1 && index < this._items.length) {
            this._items[index].visible = selected;
        }
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
    /**
     *  索引设置处理器。
     * <p>默认回调参数：index:int</p>
     */
    get setIndexHandler() {
        return this._setIndexHandler;
    }
    set setIndexHandler(value) {
        this._setIndexHandler = value;
    }
    /**
     * @private
     * 设置属性<code>selectedIndex</code>的值。
     * @param index 选中项索引值。
     */
    setIndex(index) {
        this.selectedIndex = index;
    }
    /**
     * 视图集合数组。
     */
    get items() {
        return this._items;
    }
    /**@inheritDoc */
    /*override*/ set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string') {
            this.selectedIndex = parseInt(value);
        }
        else {
            for (var prop in this._dataSource) {
                if (prop in this) {
                    this[prop] = this._dataSource[prop];
                }
            }
        }
    }
    get dataSource() {
        return super.dataSource;
    }
}
ILaya.regClass(ViewStack);
