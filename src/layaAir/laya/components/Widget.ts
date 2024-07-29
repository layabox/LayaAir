import { Component } from "./Component"
import { HideFlags } from "../Const";
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"

/**
 * @en Relative layout Component.
 * @zh 相对布局组件
 */
export class Widget extends Component {
    /**
     * @en An static instance of a Widget that has been initialized.
     * @zh 一个已初始化的 Widget 静态实例。
     */
    static EMPTY: Widget = null;// new Widget();

    private _top: number = null;
    private _bottom: number = null;
    private _left: number = null;
    private _right: number = null;
    private _centerX: number = null;
    private _centerY: number = null;

    constructor() {
        super();

        this.runInEditor = true;
        this.hideFlags |= HideFlags.HideAndDontSave;
    }

    /**
     * @en Resets the boundaries and center coordinates of the object to null.
     * @zh 将对象的边界和中心坐标重置为 null。
     */
    onReset(): void {
        this._top = this._bottom = this._left = this._right = this._centerX = this._centerY = null;
    }

    protected _onEnable(): void {
        if (this.owner.parent) this._onAdded();
        else this.owner.once(Event.ADDED, this, this._onAdded);
    }

    protected _onDisable(): void {
        this.owner.off(Event.ADDED, this, this._onAdded);
        if (this.owner.parent) this.owner.parent.off(Event.RESIZE, this, this._onParentResize);
    }

    protected _onAdded(): void {
        if (this.owner.parent)
            this.owner.parent.on(Event.RESIZE, this, this._onParentResize);
        this.resetLayoutX();
        this.resetLayoutY();
    }

    /**
     * 父容器的 <code>Event.RESIZE</code> 事件侦听处理函数。
     */
    protected _onParentResize(): void {
        var flagX = this.resetLayoutX();
        var flagY = this.resetLayoutY();
        if (flagX || flagY) this.owner.event(Event.RESIZE);
    }

    /**
     * @private
     * @en Resets the object's layout along the X-axis (horizontal direction).
     * @zh 重置对象的水平布局（X轴方向）。
     */
    resetLayoutX(): boolean {
        var owner: Sprite = (<Sprite>this.owner);
        if (!owner) return false;
        var parent: Sprite = (<Sprite>owner.parent);
        if (parent) {
            if (this._centerX != null) {
                owner.x = Math.round((parent.width - owner.displayWidth) * 0.5 + this._centerX + owner.pivotX * owner.scaleX);
            } else if (this._left != null) {
                owner.x = Math.round(this._left + owner.pivotX * owner.scaleX);
                if (this._right != null) {
                    if (!parent._width) return false;
                    //TODO:如果用width，会死循环
                    var temp: number = (parent._width - this._left - this._right) / (owner.scaleX || 0.01);
                    if (temp != owner._width) {
                        owner.width = temp;
                        return true;
                    }
                }
            } else if (this._right != null) {
                owner.x = Math.round(parent.width - owner.displayWidth - this._right + owner.pivotX * owner.scaleX);
            }
        }
        return false;
    }

    /**
     * @private
     * @en Resets the object's layout along the Y-axis (vertical direction).
     * @zh 重置对象的垂直布局（Y轴方向）。
     */
    resetLayoutY(): boolean {
        var owner: Sprite = (<Sprite>this.owner);
        if (!owner) return false;
        var parent: Sprite = (<Sprite>owner.parent);
        if (parent) {
            if (this._centerY != null) {
                owner.y = Math.round((parent.height - owner.displayHeight) * 0.5 + this._centerY + owner.pivotY * owner.scaleY);
            } else if (this._top != null) {
                owner.y = Math.round(this._top + owner.pivotY * owner.scaleY);
                if (this._bottom != null) {
                    if (!parent._height) return false;
                    //TODO:
                    var temp: number = (parent._height - this._top - this._bottom) / (owner.scaleY || 0.01);
                    if (temp != owner._height) {
                        owner.height = temp;
                        return true;
                    }
                }
            } else if (this._bottom != null) {
                owner.y = Math.round(parent.height - owner.displayHeight - this._bottom + owner.pivotY * owner.scaleY);
            }
        }
        return false;
    }

    /**
     * @en Recalculate layout
     * @zh 重新计算布局
     */
    resetLayout(): void {
        if (this.owner) {
            this.resetLayoutX();
            this.resetLayoutY();
        }
    }

    /**
     * @en The distance from the top edge, in pixels.
     * @zh 距顶边的距离（以像素为单位）。
     */
    get top(): number {
        return this._top;
    }

    set top(value: number) {
        if (isNaN(value)) //兼容2.0
            value = null;
        if (this._top != value) {
            this._top = value;
            this.resetLayoutY();
        }
    }

    /**
     * @en The distance from the bottom edge, in pixels.
     * @zh 距底边的距离（以像素为单位）。
     */
    get bottom(): number {
        return this._bottom;
    }

    set bottom(value: number) {
        if (isNaN(value)) //兼容2.0
            value = null;
        if (this._bottom != value) {
            this._bottom = value;
            this.resetLayoutY();
        }
    }

    /**
     * @en The distance from the left edge, in pixels.
     * @zh 距左边的距离（以像素为单位）。
     */
    get left(): number {
        return this._left;
    }

    set left(value: number) {
        if (isNaN(value)) //兼容2.0
            value = null;
        if (this._left != value) {
            this._left = value;
            this.resetLayoutX();
        }
    }

    /**
     * @en The distance from the right edge, in pixels.
     * @zh 距右边的距离（以像素为单位）。
     */
    get right(): number {
        return this._right;
    }

    set right(value: number) {
        if (isNaN(value)) //兼容2.0
            value = null;
        if (this._right != value) {
            this._right = value;
            this.resetLayoutX();
        }
    }

    /**
     * @en The distance from the horizontal center axis, in pixels.
     * @zh 距水平方向中心轴的距离（以像素为单位）。
     */
    get centerX(): number {
        return this._centerX;
    }

    set centerX(value: number) {
        if (isNaN(value)) //兼容2.0
            value = null;
        if (this._centerX != value) {
            this._centerX = value;
            this.resetLayoutX();
        }
    }

    /**
     * @en The distance from the vertical center axis, in pixels.
     * @zh 距垂直方向中心轴的距离（以像素为单位）。
     */
    get centerY(): number {
        return this._centerY;
    }

    set centerY(value: number) {
        if (isNaN(value)) //兼容2.0
            value = null;
        if (this._centerY != value) {
            this._centerY = value;
            this.resetLayoutY();
        }
    }
}

Widget.EMPTY = new Widget();
