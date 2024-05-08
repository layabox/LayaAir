import { Widget } from "../components/Widget";
import { UIEvent } from "./UIEvent";
import { UIUtils } from "./UIUtils";
import { Node } from "../display/Node"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { ILaya } from "../../ILaya";
import { SerializeUtil } from "../loaders/SerializeUtil";

/**
 * @en UIComponent is the base class of UI Component.
 * Life cycle: preinitialize > createChildren > initialize > constructor of component
 * @zh UIComponent 是UI组件类的基类。
 * 生命周期：preinitialize > createChildren > initialize > 组件构造函数
 */
export class UIComponent extends Sprite {

    /**
     * @internal
     * @en The data source of the UIComponent.
     * @zh UI组件的数据源。
     */
    protected _dataSource: any;

    /**
     * @internal
     * @en Mouse hover prompt
     * @zh 鼠标悬停提示
     */
    protected _toolTip: any;

    /**
     * @internal
     * @en Disabled
     * @zh 禁用
     */
    protected _disabled: boolean;

    /**
     * @internal
     * @en Grayed out
     * @zh 变灰
     */
    protected _gray: boolean;

    /**
     * @internal
     * @en Relative layout component
     * @zh 相对布局组件
     */
    protected _widget: Widget = Widget.EMPTY;

    /**
    * @en The vertical distance in pixels from the top edge of the component to the top edge of its parent.
    * This property is used for relative layout, which means the component's position is always relative to its parent's top edge.
    * @zh 组件顶边距离父节点顶边的垂直距离（以像素为单位）。
    * 此属性用于相对布局,意味着组件的位置始终相对于父节点的顶部边缘。
    */
    get top(): number {
        return this.get_top();
    }

    set top(value: number) {
        this.set_top(value);
    }

    /**
     * @en The vertical distance in pixels from the bottom edge of the component to the bottom edge of its parent.
     * This property is used for relative layout, which means the component's position is always relative to its parent's bottom edge.
     * @zh 组件底边距离父节点底边的垂直距离（以像素为单位）。
     * 此属性用于相对布局,意味着组件的位置始终相对于父节点的底部边缘。
     */
    get bottom(): number {
        return this.get_bottom();
    }

    set bottom(value: number) {
        this.set_bottom(value);
    }

    /**
     * @en The horizontal distance in pixels from the left edge of the component to the left edge of its parent.
     * This property is used for relative layout, which means the component's position is always relative to its parent's left edge.
     * @zh 组件左边距离父节点左边的水平距离（以像素为单位）。
     * 此属性用于相对布局,意味着组件的位置始终相对于父节点的左侧边缘。
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
     * @en The horizontal distance in pixels from the right edge of the component to the right edge of its parent.
     * This property is used for relative layout, which means the component's position is always relative to its parent's right edge.
     * @zh 组件右边距离父节点右边的水平距离（以像素为单位）。
     * 此属性用于相对布局,意味着组件的位置始终相对于父节点的右侧边缘。
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
     * @en The distance in pixels from the center axis of this object in the horizontal direction to the center line of the parent container in the horizontal direction.
     * @zh 在父容器中，此对象的水平方向中轴线与父容器的水平方向中心线的距离（以像素为单位）。
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
     * @en The distance in pixels from the center axis of this object in the vertical direction to the center line of the parent container in the vertical direction.
     * @zh 在父容器中，此对象的垂直方向中轴线与父容器的垂直方向中心线的距离（以像素为单位）。
     */
    get centerY(): number {
        return this._widget.centerY;
    }

    set centerY(value: number) {
        if (value != this._widget.centerY) {
            this._getWidget().centerY = value;
        }
    }

    /**
     * @en Data assignment, control UI display logic by assigning UI.
     * Simple assignment will change the default properties of the component, and curly braces can be used to assign any property of the component.
     * @zh 数据源赋值，通过对UI赋值来控制UI显示逻辑。
     * 简单赋值会更改组件的默认属性，使用大括号可以指定组件的任意属性进行赋值。
     * @example
       //Default property assignment
       dataSource = {label1: "Label changed", checkbox1: true};//(Change the text property value of label1, change the selected property of checkbox1).
       //Any property assignment
       dataSource = {label2: {text:"Label changed",size:14}, checkbox2: {selected:true,x:10}};
     */
    get dataSource(): any {
        return this.get_dataSource();
    }

    set dataSource(value: any) {
        this.set_dataSource(value);
    }

    /**
     * @en Mouse hover prompt.
     * It can be assigned as text `String` or function `Handler` to implement custom style mouse prompts and parameter carrying, etc.
     * @zh 鼠标悬停提示。
     * 可以赋值为文本`String`或函数`Handler`，用来实现自定义样式的鼠标提示和参数携带等。
     * @example
     * private var _testTips:TestTipsUI = new TestTipsUI();
     * private function testTips():void {
       //Simple mouse prompt
     * btn2.toolTip = "This is a mouse tip&lt;b&gt;Bold&lt;/b&gt;&lt;br&gt;New line";
       //Custom mouse prompt
     * btn1.toolTip = showTips1;
       //Custom mouse prompt with parameters
     * clip.toolTip = new Handler(this,showTips2, ["clip"]);
     * }
     * private function showTips1():void {
     * _testTips.label.text = "This is button[" + btn1.label + "]";
     * tip.addChild(_testTips);
     * }
     * private function showTips2(name:String):void {
     * _testTips.label.text = "This is " + name;
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
     * @en Whether it is grayed out.
     * @zh 是否变灰。
     */
    get gray(): boolean {
        return this._gray;
    }

    set gray(value: boolean) {
        if (value !== this._gray) {
            this._gray = value;
            UIUtils.gray(this, value);
        }
    }

    /**
     * @en Whether the page is disabled, it will turn gray and disable the mouse when set to true.
     * @zh 是否禁用页面，设置为true后，会变灰并且禁用鼠标。
     */
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
     * @en The constructor function that is called when creating a new instance of the UIComponent.
     * It calls a series of initialization methods in sequence. Subclasses inheriting from this class can override these methods directly to implement their own initialization logic.
     * If these initialization methods are not needed, `createChildren` can be set to `false` to skip them and reduce unnecessary overhead.
     * @param createChildren Whether to execute the initialization methods, default is true.
     * @zh 创建UI组件新实例时调用的构造函数。
     * 它将依次调用一系列初始化方法。继承该类的子类可以直接重写这些方法,实现自己的初始化逻辑。
     * 如果不需要这些初始化方法,可以将 `createChildren` 设置为 `false`,以跳过它们并减少不必要的开销。
     * @param createChildren 是否执行子对象初始化方法,默认为 true。
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
     * @internal
     * @en Called when the layout should be refreshed.
     * This method will call the `_sizeChanged` method later to perform the actual layout refresh.
     * @zh 当需要刷新布局时调用。
     * 这个方法会在稍后调用 `_sizeChanged` 方法来执行实际的布局刷新。
     */
    protected _shouldRefreshLayout(): void {
        super._shouldRefreshLayout();
        this.callLater(this._sizeChanged);
    }

    /**
     * @internal
     * @en Callback function when the component size changes.
     * @zh 组件尺寸变化时的回调函数。
     */
    protected _sizeChanged(): void {
        this.event(Event.RESIZE);
        if (this._widget !== Widget.EMPTY) this._widget.resetLayout();
    }

    /**
    * @internal
    * @override
    * @en Callback when a child node changes.
    * @param child The child node that has changed.
    * @zh 子节点发生变化时的回调。
    * @param child 发生变化的子节点。
    */
    protected _childChanged(child: Node = null): void {
        this.callLater(this._sizeChanged);
        super._childChanged(child);
    }

    /**
     * @internal
     * @en Get the layout style of the object. Please do not modify this object directly.
     * @zh 获取对象的布局样式。请不要直接修改此对象。
     */
    private _getWidget(): Widget {
        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
        return this._widget;
    }

    /**
     * @internal
     * @en Pre-initialization.
     * Subclasses can set and modify default property values in this function.
     * @zh 预初始化。
     * 子类可在此函数内设置、修改属性默认值。
     */
    protected preinitialize(): void {
    }

    /**
     * @internal
     * @en Create and add UIComponent child nodes.
     * Subclasses can create and add child nodes in this function.
     * @zh 创建并添加UI组件的子节点。
     * 子类可在此函数内创建并添加子节点。
     */
    protected createChildren(): void {
    }

    /**
     * @internal
     * @en UIComponent initialization.
     * Child objects have been created at this point and can be modified.
     * @zh UI组件初始化。
     * 在此子对象已被创建，可以对子对象进行修改。
     */
    protected initialize(): void {
    }

    /**
     * @internal
     * @en The actual display area width of the object (in pixels).
     * @zh 显示对象的实际显示区域宽度（以像素为单位）。
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
     * @internal
     * @en Immediately execute the delayed call function that affects the width and height measurement.
     * Use the 'runCallLater' function to immediately execute the delayed running function that affects the width and height measurement (set using 'callLater').
     * @zh 立即执行影响宽高度量的延迟调用函数。
     * 使用 'runCallLater' 函数，立即执行影响宽高度量的延迟运行函数(使用 'callLater' 设置延迟执行函数)。
     * @see #callLater()
     * @see #runCallLater()
     */
    protected commitMeasure(): void {
    }

    /**
     * @internal
     * @en The actual display area height of the object (in pixels).
     * @zh 显示对象的实际显示区域高度（以像素为单位）。
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
     * @internal
     * @en The event handler for the 'Event.MOUSE_OVER' event, triggered when the mouse enters the component (the node object to which the component belongs).
     * When the 'toolTip' property is set, this method is invoked to dispatch the 'UIEvent.SHOW_TIP' event with the '_toolTip' property as the parameter.
     * @param e The event object.
     * @zh 'Event.MOUSE_OVER' 事件的事件处理程序,在鼠标进入组件(组件所属的节点对象)时触发。
     * 当 'toolTip' 属性被设置时,该方法会被调用以派发 'UIEvent.SHOW_TIP' 事件,并将 '_toolTip' 属性作为参数传递。
     * @param e 事件对象。
     */
    private onMouseOver(e: Event): void {
        ILaya.stage.event(UIEvent.SHOW_TIP, this._toolTip);
    }

    /**
     * @internal
     * @en The event handler for the 'Event.MOUSE_OUT' event, triggered when the mouse leaves the component (the node object to which the component belongs).
     * When the 'toolTip' property is set, this method is invoked to dispatch the 'UIEvent.HIDE_TIP' event with the '_toolTip' property as the parameter.
     * @param e The event object.
     * @zh 'Event.MOUSE_OUT' 事件的事件处理程序,在鼠标离开组件(组件所属的节点对象)时触发。
     * 当 'toolTip' 属性被设置时,该方法会被调用以派发 'UIEvent.HIDE_TIP' 事件,并将 '_toolTip' 属性作为参数传递。
     * @param e 事件对象。
     */
    private onMouseOut(e: Event): void {
        ILaya.stage.event(UIEvent.HIDE_TIP, this._toolTip);
    }

    /**
     * @internal
     * @en The method to be invoked when the component is resized.
     * It handles the logic for when the component's size changes.
     * @zh 组件大小调整时调用的方法。
     * 它处理组件大小发生变化时的逻辑。
     */
    protected onCompResize(): void {
        this._sizeChanged();
    }

    /**
     * @internal
     * @en Get the width of the object.
     * @zh 获取对象的宽度。
     * @override
     */
    get_width(): number {
        if (this._isWidthSet) return this._width;
        return this.measureWidth();
    }

    /**
     * @internal
     * @en Get the height of the object.
     * @zh 获取对象的高度。
     * @override
     */
    get_height(): number {
        if (this._isHeightSet) return this._height;
        return this.measureHeight();
    }

    /**
     * @internal
     * @en Get the top margin of the object.
     * @zh 获取对象的上边距。
     */
    get_top(): number {
        return this._widget.top;
    }

    /**
     * @internal
     * @en Set the top margin of the object.
     * @param value The top margin value.
     * @zh 设置对象的上边距。
     * @param value 上边距的值。
     */
    set_top(value: number) {
        if (value != this._widget.top) {
            this._getWidget().top = value;
        }
    }

    /**
     * @internal
     * @en Get the bottom margin of the object.
     * @zh 获取对象的下边距。
     */
    get_bottom(): number {
        return this._widget.bottom;
    }

    /**
     * @internal
     * @en Set the bottom margin of the object.
     * @param value The bottom margin value.
     * @zh 设置对象的下边距。
     * @param value 下边距的值。
     */
    set_bottom(value: number) {
        if (value != this._widget.bottom) {
            this._getWidget().bottom = value;
        }
    }

    /**
     * @internal
     * @en Get the data source of the object.
     * @zh 获取对象的数据源。
     */
    get_dataSource(): any {
        return this._dataSource;
    }

    /**
     * @internal
     * @en Set the data source of the object.
     * @param value The data source.
     * @zh 设置对象的数据源。
     * @param value 数据源。
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        for (var prop in this._dataSource) {
            if (prop in this && !(typeof ((this as any)[prop]) == 'function')) {
                (this as any)[prop] = this._dataSource[prop];
            }
        }
    }

    /**
     * @en Recalculate and update the layout of the object.
     * This method will reset the horizontal and vertical layout of the object based on the `_widget` property.
     * It will calculate the position and size of the object according to the layout rules specified by the `_widget` property,
     * such as `left`, `right`, `top`, `bottom`, `centerX`, and `centerY`.
     * @zh 重新计算并更新对象的布局。
     * 这个方法将根据 `_widget` 属性重置对象的水平和垂直布局。
     * 它会根据 `_widget` 属性指定的布局规则,如 `left`、`right`、`top`、`bottom`、`centerX` 和 `centerY`,计算对象的位置和大小。
     */
    freshLayout() {
        if (this._widget != Widget.EMPTY) {
            this._widget.resetLayout();
        }
    }

    /**
     * @override
     * @en Destroy the object.
     * @param destroyChild Whether to destroy child nodes, default is true.
     * @zh 销毁对象。
     * @param destroyChild 是否销毁子节点,默认为 true。
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._dataSource = null;
        this._toolTip = null;
    }
}
