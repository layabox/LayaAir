import { Widget } from "././Widget";
import { Node } from "../display/Node";
import { Sprite } from "../display/Sprite";
/**
 * <code>Component</code> 是ui控件类的基类。
 * <p>生命周期：preinitialize > createChildren > initialize > 组件构造函数</p>
 */
export declare class UIComponent extends Sprite {
    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    protected _anchorX: number;
    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    protected _anchorY: number;
    /**@private 控件的数据源。 */
    protected _dataSource: any;
    /**@private 鼠标悬停提示 */
    protected _toolTip: any;
    /**@private 标签 */
    protected _tag: any;
    /**@private 禁用 */
    protected _disabled: boolean;
    /**@private 变灰*/
    protected _gray: boolean;
    /**@private 相对布局组件*/
    protected _widget: Widget;
    /**
     * <p>创建一个新的 <code>Component</code> 实例。</p>
     */
    constructor();
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**
     * <p>预初始化。</p>
     * @internal 子类可在此函数内设置、修改属性默认值
     */
    protected preinitialize(): void;
    /**
     * <p>创建并添加控件子节点。</p>
     * @internal 子类可在此函数内创建并添加子节点。
     */
    protected createChildren(): void;
    /**
     * <p>控件初始化。</p>
     * @internal 在此子对象已被创建，可以对子对象进行修改。
     */
    protected initialize(): void;
    /**
     * <p>表示显示对象的宽度，以像素为单位。</p>
     * <p><b>注：</b>当值为0时，宽度为自适应大小。</p>
     */
    /**@inheritDoc */
    /*override*/ width: number;
    get_width(): number;
    /**
     * <p>显示对象的实际显示区域宽度（以像素为单位）。</p>
     */
    protected measureWidth(): number;
    /**
     * <p>立即执行影响宽高度量的延迟调用函数。</p>
     * @internal <p>使用 <code>runCallLater</code> 函数，立即执行影响宽高度量的延迟运行函数(使用 <code>callLater</code> 设置延迟执行函数)。</p>
     * @see #callLater()
     * @see #runCallLater()
     */
    protected commitMeasure(): void;
    /**
     * <p>表示显示对象的高度，以像素为单位。</p>
     * <p><b>注：</b>当值为0时，高度为自适应大小。</p>
     */
    /**@inheritDoc */
    /*override*/ height: number;
    get_height(): number;
    /**
     * <p>显示对象的实际显示区域高度（以像素为单位）。</p>
     */
    protected measureHeight(): number;
    /**
     * <p>数据赋值，通过对UI赋值来控制UI显示逻辑。</p>
     * <p>简单赋值会更改组件的默认属性，使用大括号可以指定组件的任意属性进行赋值。</p>
     * @example
       //默认属性赋值
       dataSource = {label1: "改变了label", checkbox1: true};//(更改了label1的text属性值，更改checkbox1的selected属性)。
       //任意属性赋值
       dataSource = {label2: {text:"改变了label",size:14}, checkbox2: {selected:true,x:10}};
     */
    dataSource: any;
    get_dataSource(): any;
    set_dataSource(value: any): void;
    /**
     * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
     */
    top: number;
    get_top(): number;
    set_top(value: number): void;
    /**
     * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
     */
    bottom: number;
    get_bottom(): number;
    set_bottom(value: number): void;
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
    protected _sizeChanged(): void;
    /**
     * <p>对象的标签。</p>
     * @internal 冗余字段，可以用来储存数据。
     */
    tag: any;
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
    toolTip: any;
    /**
     * 对象的 <code>Event.MOUSE_OVER</code> 事件侦听处理函数。
     */
    private onMouseOver;
    /**
     * 对象的 <code>Event.MOUSE_OUT</code> 事件侦听处理函数。
     */
    private onMouseOut;
    /** 是否变灰。*/
    gray: boolean;
    /** 是否禁用页面，设置为true后，会变灰并且禁用鼠标。*/
    disabled: boolean;
    /**
     * @private
     * <p>获取对象的布局样式。请不要直接修改此对象</p>
     */
    private _getWidget;
    /**@inheritDoc */
    scaleX: number;
    set_scaleX(value: number): void;
    /**@inheritDoc */
    scaleY: number;
    set_scaleY(value: number): void;
    /**@private */
    protected onCompResize(): void;
    set_width(value: number): void;
    set_height(value: number): void;
    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    anchorX: number;
    get_anchorX(): number;
    set_anchorX(value: number): void;
    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    anchorY: number;
    get_anchorY(): number;
    set_anchorY(value: number): void;
    protected _childChanged(child?: Node): void;
}
