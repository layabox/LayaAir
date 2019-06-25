import { Component } from "../components/Component";
/**
 * 相对布局插件
 */
export declare class Widget extends Component {
    /**一个已初始化的 <code>Widget</code> 实例。*/
    static EMPTY: Widget;
    private _top;
    private _bottom;
    private _left;
    private _right;
    private _centerX;
    private _centerY;
    onReset(): void;
    protected _onEnable(): void;
    protected _onDisable(): void;
    /**
     * 对象被添加到显示列表的事件侦听处理函数。
     */
    _onAdded(): void;
    /**
     * 父容器的 <code>Event.RESIZE</code> 事件侦听处理函数。
     */
    protected _onParentResize(): void;
    /**
     * <p>重置对象的 <code>X</code> 轴（水平方向）布局。</p>
     * @private
     */
    resetLayoutX(): boolean;
    /**
     * <p>重置对象的 <code>Y</code> 轴（垂直方向）布局。</p>
     * @private
     */
    resetLayoutY(): boolean;
    /**
     * 重新计算布局
     */
    resetLayout(): void;
    /**表示距顶边的距离（以像素为单位）。*/
    top: number;
    /**表示距底边的距离（以像素为单位）。*/
    bottom: number;
    /**表示距左边的距离（以像素为单位）。*/
    left: number;
    /**表示距右边的距离（以像素为单位）。*/
    right: number;
    /**表示距水平方向中心轴的距离（以像素为单位）。*/
    centerX: number;
    /**表示距垂直方向中心轴的距离（以像素为单位）。*/
    centerY: number;
}
