import { UIComponent } from "./UIComponent";
import { Button } from "./Button";
import { Slider } from "./Slider";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Handler } from "../utils/Handler";
/**
 * 滚动条滑块位置发生变化后调度。
 * @eventType laya.events.Event
 */
/**
 * 开始滑动。
 * @eventType laya.events.Event
 */
/**
 * 结束滑动。
 * @eventType laya.events.Event
 */
/**
 * <code>ScrollBar</code> 组件是一个滚动条组件。
 * <p>当数据太多以至于显示区域无法容纳时，最终用户可以使用 <code>ScrollBar</code> 组件控制所显示的数据部分。</p>
 * <p> 滚动条由四部分组成：两个箭头按钮、一个轨道和一个滑块。 </p>	 *
 *
 * @see laya.ui.VScrollBar
 * @see laya.ui.HScrollBar
 */
export declare class ScrollBar extends UIComponent {
    /**滚动衰减系数*/
    rollRatio: number;
    /**滚动变化时回调，回传value参数。*/
    changeHandler: Handler;
    /**是否缩放滑动条，默认值为true。 */
    scaleBar: boolean;
    /**一个布尔值，指定是否自动隐藏滚动条(无需滚动时)，默认值为false。*/
    autoHide: boolean;
    /**橡皮筋效果极限距离，0为没有橡皮筋效果。*/
    elasticDistance: number;
    /**橡皮筋回弹时间，单位为毫秒。*/
    elasticBackTime: number;
    /**上按钮 */
    upButton: Button;
    /**下按钮 */
    downButton: Button;
    /**滑条 */
    slider: Slider;
    /**@private */
    protected _showButtons: boolean;
    /**@private */
    protected _scrollSize: number;
    /**@private */
    protected _skin: string;
    /**@private */
    protected _thumbPercent: number;
    /**@private */
    protected _target: Sprite;
    /**@private */
    protected _lastPoint: Point;
    /**@private */
    protected _lastOffset: number;
    /**@private */
    protected _checkElastic: boolean;
    /**@private */
    protected _isElastic: boolean;
    /**@private */
    protected _value: number;
    /**@private */
    protected _hide: boolean;
    /**@private */
    protected _clickOnly: boolean;
    /**@private */
    protected _offsets: any[];
    /**@private */
    protected _touchScrollEnable: boolean;
    /**@private */
    protected _mouseWheelEnable: boolean;
    /**
     * 创建一个新的 <code>ScrollBar</code> 实例。
     * @param skin 皮肤资源地址。
     */
    constructor(skin?: string);
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**@inheritDoc */
    protected createChildren(): void;
    /**@inheritDoc */
    protected initialize(): void;
    /**
     * @private
     * 滑块位置发生改变的处理函数。
     */
    protected onSliderChange(): void;
    /**
     * @private
     * 向上和向下按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    protected onButtonMouseDown(e: Event): void;
    /**@private */
    protected startLoop(isUp: boolean): void;
    /**@private */
    protected slide(isUp: boolean): void;
    /**
     * @private
     * 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    protected onStageMouseUp(e: Event): void;
    /**
     * @copy laya.ui.Image#skin
     */
    skin: string;
    protected _skinLoaded(): void;
    /**
     * @private
     * 更改对象的皮肤及位置。
     */
    protected changeScrollBar(): void;
    /**@inheritDoc */
    protected _sizeChanged(): void;
    /**@private */
    private resetPositions;
    /**@private */
    protected resetButtonPosition(): void;
    /**@inheritDoc */
    protected measureWidth(): number;
    /**@inheritDoc */
    protected measureHeight(): number;
    /**
     * 设置滚动条信息。
     * @param min 滚动条最小位置值。
     * @param max 滚动条最大位置值。
     * @param value 滚动条当前位置值。
     */
    setScroll(min: number, max: number, value: number): void;
    /**
     * 获取或设置表示最高滚动位置的数字。
     */
    max: number;
    /**
     * 获取或设置表示最低滚动位置的数字。
     */
    min: number;
    /**
     * 获取或设置表示当前滚动位置的数字。
     */
    value: number;
    /**
     * 一个布尔值，指示滚动条是否为垂直滚动。如果值为true，则为垂直滚动，否则为水平滚动。
     * <p>默认值为：true。</p>
     */
    isVertical: boolean;
    /**
     * <p>当前实例的 <code>Slider</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    sizeGrid: string;
    /**获取或设置一个值，该值表示按下滚动条轨道时页面滚动的增量。 */
    scrollSize: number;
    /**@inheritDoc */
    dataSource: any;
    /**获取或设置一个值，该值表示滑条长度比例，值为：（0-1）。 */
    thumbPercent: number;
    /**
     * 设置滚动对象。
     * @see laya.ui.TouchScroll#target
     */
    target: Sprite;
    /**是否隐藏滚动条，不显示滚动条，但是可以正常滚动，默认为false。*/
    hide: boolean;
    /**一个布尔值，指定是否显示向上、向下按钮，默认值为true。*/
    showButtons: boolean;
    /**一个布尔值，指定是否开启触摸，默认值为true。*/
    touchScrollEnable: boolean;
    /** 一个布尔值，指定是否滑轮滚动，默认值为true。*/
    mouseWheelEnable: boolean;
    /**@private */
    protected onTargetMouseWheel(e: Event): void;
    isLockedFun: Function;
    /**@private */
    protected onTargetMouseDown(e: Event): void;
    startDragForce(): void;
    private cancelDragOp;
    triggerDownDragLimit: Function;
    triggerUpDragLimit: Function;
    private checkTriggers;
    readonly lastOffset: number;
    startTweenMoveForce(lastOffset: number): void;
    /**@private */
    protected loop(): void;
    /**@private */
    protected onStageMouseUp2(e: Event): void;
    /**@private */
    private elasticOver;
    /**@private */
    protected tweenMove(maxDistance: number): void;
    /**
     * 停止滑动。
     */
    stopScroll(): void;
    /**
     * 滚动的刻度值，滑动数值为tick的整数倍。默认值为1。
     */
    tick: number;
}
