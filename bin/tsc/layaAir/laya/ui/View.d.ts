import { Widget } from "././Widget";
import { Scene } from "../display/Scene";
/**
 * <code>View</code> 是一个视图类，2.0开始，更改继承至Scene类，相对于Scene，增加相对布局功能。
 */
export declare class View extends Scene {
    /**@private 兼容老版本*/
    static uiMap: any;
    /**@private */
    _watchMap: any;
    /**@private 相对布局组件*/
    protected _widget: Widget;
    /**@private 控件的数据源。 */
    protected _dataSource: any;
    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    protected _anchorX: number;
    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    protected _anchorY: number;
    constructor();
    /**
     * @private 兼容老版本
     * 注册组件类映射。
     * <p>用于扩展组件及修改组件对应关系。</p>
     * @param key 组件类的关键字。
     * @param compClass 组件类对象。
     */
    static regComponent(key: string, compClass: new () => any): void;
    /**
     * @private 兼容老版本
     * 注册UI视图类的逻辑处理类。
     * @internal 注册runtime解析。
     * @param key UI视图类的关键字。
     * @param compClass UI视图类对应的逻辑处理类。
     */
    static regViewRuntime(key: string, compClass: new () => any): void;
    /**
     * @private 兼容老版本
     * 注册UI配置信息，比如注册一个路径为"test/TestPage"的页面，UI内容是IDE生成的json
     * @param	url		UI的路径
     * @param	json	UI内容
     */
    static regUI(url: string, json: any): void;
    /** @inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**@private */
    changeData(key: string): void;
    /**
     * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
     */
    top: number;
    /**
     * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
     */
    bottom: number;
    /**
     * <p>从组件左边到其内容区域左边之间的水平距离（以像素为单位）。</p>
     */
    left: number;
    /**
     * <p>从组件右边到其内容区域右边之间的水平距离（以像素为单位）。</p>
     */
    right: number;
    /**
     * <p>在父容器中，此对象的水平方向中轴线与父容器的水平方向中心线的距离（以像素为单位）。</p>
     */
    centerX: number;
    /**
     * <p>在父容器中，此对象的垂直方向中轴线与父容器的垂直方向中心线的距离（以像素为单位）。</p>
     */
    centerY: number;
    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    anchorX: number;
    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    anchorY: number;
    /**@private */
    protected _sizeChanged(): void;
    /**
     * @private
     * <p>获取对象的布局样式。请不要直接修改此对象</p>
     */
    private _getWidget;
    /**@private 兼容老版本*/
    protected loadUI(path: string): void;
    /**@see  laya.ui.UIComponent#dataSource*/
    dataSource: any;
}
