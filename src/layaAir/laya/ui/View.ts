import { Widget } from "./Widget";
import { Scene } from "../display/Scene"
import { Event } from "../events/Event"
import { UIComponent } from "./UIComponent"
import { ILaya } from "../../ILaya";

/**
 * <code>View</code> 是一个视图类，2.0开始，更改继承至Scene类，相对于Scene，增加相对布局功能。
 */
export class View extends Scene {
    /**@private 兼容老版本*/
    static uiMap: any = {};
    /**@internal */
    _watchMap: any = {};
    /**@private 相对布局组件*/
    protected _widget: Widget;
    /**@private 控件的数据源。 */
    protected _dataSource: any;
    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    protected _anchorX: number = NaN;
    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    protected _anchorY: number = NaN;

    constructor() {
        super(false);   // 先不要createChildren 因为 this._widget还没有赋值
        this._widget = Widget.EMPTY;
        this.createChildren();
    }

    /**
     * @private 兼容老版本
     * 注册UI配置信息，比如注册一个路径为"test/TestPage"的页面，UI内容是IDE生成的json
     * @param	url		UI的路径
     * @param	json	UI内容
     */
    static regUI(url: string, json: any): void {
        ILaya.loader.cacheRes(url, json);
    }

    /** 
     * @inheritDoc 
     * @override
    */
    destroy(destroyChild: boolean = true): void {
        this._watchMap = null;
        super.destroy(destroyChild);
    }

    /**@private */
    changeData(key: string): void {
        var arr: any[] = this._watchMap[key];
        if (!arr) return;
        for (var i: number = 0, n: number = arr.length; i < n; i++) {
            var watcher: any = arr[i];
            watcher.exe(this);
        }
    }

    /**
     * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
     */
    get top(): number {
        return this._widget.top;
    }

    set top(value: number) {
        if (value != this._widget.top) {
            this._getWidget().top = value;
        }
    }

    /**
     * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
     */
    get bottom(): number {
        return this._widget.bottom;
    }

    set bottom(value: number) {
        if (value != this._widget.bottom) {
            this._getWidget().bottom = value;
        }
    }

    /**
     * <p>从组件左边到其内容区域左边之间的水平距离（以像素为单位）。</p>
     */
    get left(): number {
        return this._widget.left;
    }

    set left(value: number) {
        if (value != this._widget.left) {
            this._getWidget().left = value;
        }
    }

    /**
     * <p>从组件右边到其内容区域右边之间的水平距离（以像素为单位）。</p>
     */
    get right(): number {
        return this._widget.right;
    }

    set right(value: number) {
        if (value != this._widget.right) {
            this._getWidget().right = value;
        }
    }

    /**
     * <p>在父容器中，此对象的水平方向中轴线与父容器的水平方向中心线的距离（以像素为单位）。</p>
     */
    get centerX(): number {
        return this._widget.centerX;
    }

    set centerX(value: number) {
        if (value != this._widget.centerX) {
            this._getWidget().centerX = value;
        }
    }

    /**
     * <p>在父容器中，此对象的垂直方向中轴线与父容器的垂直方向中心线的距离（以像素为单位）。</p>
     */
    get centerY(): number {
        return this._widget.centerY;
    }

    set centerY(value: number) {
        if (value != this._widget.centerY) {
            this._getWidget().centerY = value;
        }
    }

    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    get anchorX(): number {
        return this._anchorX;
    }

    set anchorX(value: number) {
        if (this._anchorX != value) {
            this._anchorX = value;
            this.callLater(this._sizeChanged);
        }
    }

    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    get anchorY(): number {
        return this._anchorY;
    }

    set anchorY(value: number) {
        if (this._anchorY != value) {
            this._anchorY = value
            this.callLater(this._sizeChanged);
        }
    }

    /**
     * @private 
     * @override
    */
    protected _sizeChanged(): void {
        if (!isNaN(this._anchorX)) this.pivotX = this.anchorX * this.width;
        if (!isNaN(this._anchorY)) this.pivotY = this.anchorY * this.height;
        this.event(Event.RESIZE);
    }

    /**
     * @private
     * <p>获取对象的布局样式。请不要直接修改此对象</p>
     */
    private _getWidget(): Widget {
        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
        return this._widget;
    }

    /**
     * @implements
     * laya.ui.UIComponent#dataSource
     * */
    get dataSource(): any {
        return this._dataSource;
    }

    set dataSource(value: any) {
        this._dataSource = value;
        for (var name in value) {
            var comp: any = this.getChildByName(name);
            if (comp instanceof UIComponent) comp.dataSource = value[name];
            else if (name in this && !((this as any)[name] instanceof Function)) (this as any)[name] = value[name];
        }
    }
    /**
     * 重新排版
     */
    freshLayout() {
        if (this._widget != Widget.EMPTY) {
            this._widget.resetLayout();
        }
    }
}

    //dialog 依赖于view，放到这里的话，谁在前都会报错，所以不能放到这里了
