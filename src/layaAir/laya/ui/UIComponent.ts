import { Widget } from "../components/Widget";
import { UIEvent } from "./UIEvent";
import { UIUtils } from "./UIUtils";
import { Node } from "../display/Node"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { ILaya } from "../../ILaya";
import { SerializeUtil } from "../loaders/SerializeUtil";

/**
 * <code>Component</code> 是ui控件类的基类。
 * <p>生命周期：preinitialize > createChildren > initialize > 组件构造函数</p>
 */
export class UIComponent extends Sprite {
    /**@private 控件的数据源。 */
    protected _dataSource: any;
    /**@private 鼠标悬停提示 */
    protected _toolTip: any;
    /**@private 禁用 */
    protected _disabled: boolean;
    /**@private 变灰*/
    protected _gray: boolean;
    /**@private 相对布局组件*/
    protected _widget: Widget = Widget.EMPTY;

    /**
     * <p>创建一个新的 <code>Component</code> 实例。</p>
     */
    constructor(createChildren = true) {
        super();
        if (createChildren) {
            this.preinitialize();
            this.createChildren();
            this.initialize();
        }
    }

    /**
     * @inheritDoc 
     * @override
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._dataSource = null;
        this._toolTip = null;
    }

    /**
     * <p>预初始化。</p>
     * 子类可在此函数内设置、修改属性默认值
     */
    protected preinitialize(): void {
    }

    /**
     * <p>创建并添加控件子节点。</p>
     * 子类可在此函数内创建并添加子节点。
     */
    protected createChildren(): void {
    }

    /**
     * <p>控件初始化。</p>
     * 在此子对象已被创建，可以对子对象进行修改。
     */
    protected initialize(): void {
    }

    /**
     * @override
     */
    get_width(): number {
        if (this._isWidthSet) return this._width;
        return this.measureWidth();
    }

    /**
     * <p>显示对象的实际显示区域宽度（以像素为单位）。</p>
     */
    protected measureWidth(): number {
        var max: number = 0;
        this.commitMeasure();
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var comp: Sprite = (<Sprite>this.getChildAt(i));
            if (comp._visible) {
                max = Math.max(comp._x + comp.width * comp.scaleX, max);
            }
        }
        return max;
    }

    /**
     * <p>立即执行影响宽高度量的延迟调用函数。</p>
     * <p>使用 <code>runCallLater</code> 函数，立即执行影响宽高度量的延迟运行函数(使用 <code>callLater</code> 设置延迟执行函数)。</p>
     * @see #callLater()
     * @see #runCallLater()
     */
    protected commitMeasure(): void {
    }

    /**
     * @override
     */
    get_height(): number {
        if (this._isHeightSet) return this._height;
        return this.measureHeight();
    }

    /**
     * <p>显示对象的实际显示区域高度（以像素为单位）。</p>
     */
    protected measureHeight(): number {
        var max: number = 0;
        this.commitMeasure();
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var comp: Sprite = (<Sprite>this.getChildAt(i));
            if (comp._visible) {
                max = Math.max(comp._y + comp.height * comp.scaleY, max);
            }
        }
        return max;
    }

    /**
     * @implements
     * <p>数据赋值，通过对UI赋值来控制UI显示逻辑。</p>
     * <p>简单赋值会更改组件的默认属性，使用大括号可以指定组件的任意属性进行赋值。</p>
     * @example
       //默认属性赋值
       dataSource = {label1: "改变了label", checkbox1: true};//(更改了label1的text属性值，更改checkbox1的selected属性)。
       //任意属性赋值
       dataSource = {label2: {text:"改变了label",size:14}, checkbox2: {selected:true,x:10}};
     */
    get dataSource(): any {
        return this.get_dataSource();
    }

    get_dataSource(): any {
        return this._dataSource;
    }

    set dataSource(value: any) {
        this.set_dataSource(value);
    }

    set_dataSource(value: any) {
        this._dataSource = value;
        for (var prop in this._dataSource) {
            if (prop in this && !(typeof ((this as any)[prop]) == 'function')) {
                (this as any)[prop] = this._dataSource[prop];
            }
        }
    }

    /**
     * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
     */
    get top(): number {
        return this.get_top();
    }

    get_top(): number {
        return this._widget.top;
    }

    set top(value: number) {
        this.set_top(value);
    }

    set_top(value: number) {
        if (value != this._widget.top) {
            this._getWidget().top = value;
        }
    }

    /**
     * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
     */
    get bottom(): number {
        return this.get_bottom();
    }

    get_bottom(): number {
        return this._widget.bottom;
    }

    set bottom(value: number) {
        this.set_bottom(value);
    }

    set_bottom(value: number) {
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

    protected _shouldRefreshLayout(): void {
        super._shouldRefreshLayout();
        this.callLater(this._sizeChanged);
    }

    protected _sizeChanged(): void {
        this.event(Event.RESIZE);
        if (this._widget !== Widget.EMPTY) this._widget.resetLayout();
    }

    /**
     * <p>鼠标悬停提示。</p>
     * <p>可以赋值为文本 <code>String</code> 或函数 <code>Handler</code> ，用来实现自定义样式的鼠标提示和参数携带等。</p>
     * @example
     * private var _testTips:TestTipsUI = new TestTipsUI();
     * private function testTips():void {
       //简单鼠标提示
     * btn2.toolTip = "这里是鼠标提示&lt;b&gt;粗体&lt;/b&gt;&lt;br&gt;换行";
       //自定义的鼠标提示
     * btn1.toolTip = showTips1;
       //带参数的自定义鼠标提示
     * clip.toolTip = new Handler(this,showTips2, ["clip"]);
     * }
     * private function showTips1():void {
     * _testTips.label.text = "这里是按钮[" + btn1.label + "]";
     * tip.addChild(_testTips);
     * }
     * private function showTips2(name:String):void {
     * _testTips.label.text = "这里是" + name;
     * tip.addChild(_testTips);
     * }
     */
    get toolTip(): any {
        return this._toolTip;
    }

    set toolTip(value: any) {
        if (this._toolTip != value) {
            this._toolTip = value;
            if (value != null) {
                this.on(Event.MOUSE_OVER, this, this.onMouseOver);
                this.on(Event.MOUSE_OUT, this, this.onMouseOut);
            } else {
                this.off(Event.MOUSE_OVER, this, this.onMouseOver);
                this.off(Event.MOUSE_OUT, this, this.onMouseOut);
            }
        }
    }

    /**
     * 对象的 <code>Event.MOUSE_OVER</code> 事件侦听处理函数。
     */
    private onMouseOver(e: Event): void {
        ILaya.stage.event(UIEvent.SHOW_TIP, this._toolTip);
    }

    /**
     * 对象的 <code>Event.MOUSE_OUT</code> 事件侦听处理函数。
     */
    private onMouseOut(e: Event): void {
        ILaya.stage.event(UIEvent.HIDE_TIP, this._toolTip);
    }

    /** 是否变灰。*/
    get gray(): boolean {
        return this._gray;
    }

    set gray(value: boolean) {
        if (value !== this._gray) {
            this._gray = value;
            UIUtils.gray(this, value);
        }
    }

    /** 是否禁用页面，设置为true后，会变灰并且禁用鼠标。*/
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            if (!SerializeUtil.isDeserializing)
                this.gray = value;
            this.mouseEnabled = !value;
        }
    }

    /**
     * @private
     * <p>获取对象的布局样式。请不要直接修改此对象</p>
     */
    private _getWidget(): Widget {
        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
        return this._widget;
    }

    /**@private */
    protected onCompResize(): void {
        this._sizeChanged();

    }

    /**
     * 
     * @param child 
     * @override
     */
    protected _childChanged(child: Node = null): void {
        this.callLater(this._sizeChanged);
        super._childChanged(child);
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
