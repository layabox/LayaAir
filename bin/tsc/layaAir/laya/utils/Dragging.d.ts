import { Sprite } from "../display/Sprite";
import { Rectangle } from "../maths/Rectangle";
/**
 * @private
 * <code>Dragging</code> 类是触摸滑动控件。
 */
export declare class Dragging {
    /** 被拖动的对象。*/
    target: Sprite;
    /** 缓动衰减系数。*/
    ratio: number;
    /** 单帧最大偏移量。*/
    maxOffset: number;
    /** 滑动范围。*/
    area: Rectangle;
    /** 表示拖动是否有惯性。*/
    hasInertia: boolean;
    /** 橡皮筋最大值。*/
    elasticDistance: number;
    /** 橡皮筋回弹时间，单位为毫秒。*/
    elasticBackTime: number;
    /** 事件携带数据。*/
    data: any;
    private _dragging;
    private _clickOnly;
    private _elasticRateX;
    private _elasticRateY;
    private _lastX;
    private _lastY;
    private _offsetX;
    private _offsetY;
    private _offsets;
    private _disableMouseEvent;
    private _tween;
    private _parent;
    /**
     * 开始拖拽。
     * @param	target 待拖拽的 <code>Sprite</code> 对象。
     * @param	area 滑动范围。
     * @param	hasInertia 拖动是否有惯性。
     * @param	elasticDistance 橡皮筋最大值。
     * @param	elasticBackTime 橡皮筋回弹时间，单位为毫秒。
     * @param	data 事件携带数据。
     * @param	disableMouseEvent 鼠标事件是否有效。
     * @param	ratio 惯性阻尼系数
     */
    start(target: Sprite, area: Rectangle, hasInertia: boolean, elasticDistance: number, elasticBackTime: number, data: any, disableMouseEvent: boolean, ratio?: number): void;
    /**
     * 清除计时器。
     */
    private clearTimer;
    /**
     * 停止拖拽。
     */
    stop(): void;
    /**
     * 拖拽的循环处理函数。
     */
    private loop;
    /**
     * 拖拽区域检测。
     */
    private checkArea;
    /**
     * 移动至设定的拖拽区域。
     */
    private backToArea;
    /**
     * 舞台的抬起事件侦听函数。
     * @param	e Event 对象。
     */
    private onStageMouseUp;
    /**
     * 橡皮筋效果检测。
     */
    private checkElastic;
    /**
     * 移动。
     */
    private tweenMove;
    /**
     * 结束拖拽。
     */
    private clear;
}
