import { IItem } from "././IItem";
/**
 * Morn UI Version 3.0 http://www.mornui.com/
 * Feedback yung http://weibo.com/newyung
 */
import { Node } from "../display/Node";
import { Box } from "./Box";
import { Handler } from "../utils/Handler";
/**
 * <code>ViewStack</code> 类用于视图堆栈类，用于视图的显示等设置处理。
 */
export declare class ViewStack extends Box implements IItem {
    /**@private */
    protected _items: any[];
    /**@private */
    protected _setIndexHandler: Handler;
    /**@private */
    protected _selectedIndex: number;
    /**
     * 批量设置视图对象。
     * @param views 视图对象数组。
     */
    setItems(views: any[]): void;
    /**
     * 添加视图。
     * @internal 添加视图对象，并设置此视图对象的<code>name</code> 属性。
     * @param view 需要添加的视图对象。
     */
    addItem(view: Node): void;
    _afterInited(): void;
    /**
     * 初始化视图对象集合。
     */
    initItems(): void;
    /**
     * 表示当前视图索引。
     */
    selectedIndex: number;
    /**
     * @private
     * 通过对象的索引设置项对象的 <code>selected</code> 属性值。
     * @param index 需要设置的对象的索引。
     * @param selected 表示对象的选中状态。
     */
    protected setSelect(index: number, selected: boolean): void;
    /**
     * 获取或设置当前选择的项对象。
     */
    selection: Node;
    /**
     *  索引设置处理器。
     * <p>默认回调参数：index:int</p>
     */
    setIndexHandler: Handler;
    /**
     * @private
     * 设置属性<code>selectedIndex</code>的值。
     * @param index 选中项索引值。
     */
    protected setIndex(index: number): void;
    /**
     * 视图集合数组。
     */
    readonly items: any[];
    /**@inheritDoc */
    dataSource: any;
}
