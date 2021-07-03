import { IItem } from "./IItem";
/**
 * Morn UI Version 3.0 http://www.mornui.com/
 * Feedback yung http://weibo.com/newyung
 */
import { Node } from "../display/Node"
import { Sprite } from "../display/Sprite"
import { Box } from "./Box"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * <code>ViewStack</code> 类用于视图堆栈类，用于视图的显示等设置处理。
 */
export class ViewStack extends Box implements IItem {
    /**@private */
    protected _items: any[];
    /**@private */
    protected _setIndexHandler: Handler = Handler.create(this, this.setIndex, null, false);
    /**@private */
    protected _selectedIndex: number;

    /**
     * 批量设置视图对象。
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
     * 添加视图。
     * 添加视图对象，并设置此视图对象的<code>name</code> 属性。
     * @param view 需要添加的视图对象。
     */
    addItem(view: Node): void {
        view.name = "item" + this._items.length;
        this.addChild(view);
        this.initItems();
    }
    /**@internal */
    _afterInited(): void {
        this.initItems();
    }

    /**
     * 初始化视图对象集合。
     */
    initItems(): void {
        this._items = [];
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
     * 表示当前视图索引。
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
     * @private
     * 通过对象的索引设置项对象的 <code>selected</code> 属性值。
     * @param index 需要设置的对象的索引。
     * @param selected 表示对象的选中状态。
     */
    protected setSelect(index: number, selected: boolean): void {
        if (this._items && index > -1 && index < this._items.length) {
            this._items[index].visible = selected;
        }
    }

    /**
     * 获取或设置当前选择的项对象。
     */
    get selection(): Node {
        return this._selectedIndex > -1 && this._selectedIndex < this._items.length ? this._items[this._selectedIndex] : null;
    }

    set selection(value: Node) {
        this.selectedIndex = this._items.indexOf(value);
    }

    /**
     *  索引设置处理器。
     * <p>默认回调参数：index:int</p>
     */
    get setIndexHandler(): Handler {
        return this._setIndexHandler;
    }

    set setIndexHandler(value: Handler) {
        this._setIndexHandler = value;
    }

    /**
     * @private
     * 设置属性<code>selectedIndex</code>的值。
     * @param index 选中项索引值。
     */
    protected setIndex(index: number): void {
        this.selectedIndex = index;
    }

    /**
     * 视图集合数组。
     */
    get items(): any[] {
        return this._items;
    }

    /**
     * @inheritDoc 
     * @override
    */
    set dataSource(value: any) {
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
    /**
     * @inheritDoc
     * @override
     */
    get dataSource() {
        return super.dataSource;
    }
}

ILaya.regClass(ViewStack);
ClassUtils.regClass("laya.ui.ViewStack", ViewStack);
ClassUtils.regClass("Laya.ViewStack", ViewStack);