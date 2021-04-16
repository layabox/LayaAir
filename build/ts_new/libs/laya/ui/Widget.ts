import { Component } from "../components/Component"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 相对布局插件
 */
export class Widget extends Component {
    /**一个已初始化的 <code>Widget</code> 实例。*/
    static EMPTY: Widget = null;// new Widget();

    private _top: number = NaN;
    private _bottom: number = NaN;
    private _left: number = NaN;
    private _right: number = NaN;
    private _centerX: number = NaN;
    private _centerY: number = NaN;
		/**
		 * @override
		 */
		/*override*/  onReset(): void {
        this._top = this._bottom = this._left = this._right = this._centerX = this._centerY = NaN;
    }
    /**
     * @override
     * @internal
     */
    _onEnable(): void {
        if (this.owner.parent) this._onAdded();
        else this.owner.once(Event.ADDED, this, this._onAdded);
    }
    /**
     * @override
     * @internal
     */
    protected _onDisable(): void {
        this.owner.off(Event.ADDED, this, this._onAdded);
        if (this.owner.parent) this.owner.parent.off(Event.RESIZE, this, this._onParentResize);
    }

		/**
		 * @internal
		 * 对象被添加到显示列表的事件侦听处理函数。
		 * @override
		 */
		/*override*/  _onAdded(): void {
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
     * <p>重置对象的 <code>X</code> 轴（水平方向）布局。</p>
     * @private
     */
    resetLayoutX(): boolean {
        var owner: Sprite = (<Sprite>this.owner);
        if (!owner) return false;
        var parent: Sprite = (<Sprite>owner.parent);
        if (parent) {
            if (!isNaN(this.centerX)) {
                owner.x = Math.round((parent.width - owner.displayWidth) * 0.5 + this.centerX + owner.pivotX * owner.scaleX);
            } else if (!isNaN(this.left)) {
                owner.x = Math.round(this.left + owner.pivotX * owner.scaleX);
                if (!isNaN(this.right)) {
                    //TODO:如果用width，会死循环
                    var temp: number = (parent._width - this.left - this.right) / (owner.scaleX || 0.01);
                    if (temp != owner.width) {
                        owner.width = temp;
                        return true;
                    }
                }
            } else if (!isNaN(this.right)) {
                owner.x = Math.round(parent.width - owner.displayWidth - this.right + owner.pivotX * owner.scaleX);
            }
        }
        return false;
    }

    /**
     * <p>重置对象的 <code>Y</code> 轴（垂直方向）布局。</p>
     * @private
     */
    resetLayoutY(): boolean {
        var owner: Sprite = (<Sprite>this.owner);
        if (!owner) return false;
        var parent: Sprite = (<Sprite>owner.parent);
        if (parent) {
            if (!isNaN(this.centerY)) {
                owner.y = Math.round((parent.height - owner.displayHeight) * 0.5 + this.centerY + owner.pivotY * owner.scaleY);
            } else if (!isNaN(this.top)) {
                owner.y = Math.round(this.top + owner.pivotY * owner.scaleY);
                if (!isNaN(this.bottom)) {
                    //TODO:
                    var temp: number = (parent._height - this.top - this.bottom) / (owner.scaleY || 0.01);
                    if (temp != owner.height) {
                        owner.height = temp;
                        return true;
                    }
                }
            } else if (!isNaN(this.bottom)) {
                owner.y = Math.round(parent.height - owner.displayHeight - this.bottom + owner.pivotY * owner.scaleY);
            }
        }
        return false;
    }

    /**
     * 重新计算布局
     */
    resetLayout(): void {
        if (this.owner) {
            this.resetLayoutX();
            this.resetLayoutY();
        }
    }

    /**表示距顶边的距离（以像素为单位）。*/
    get top(): number {
        return this._top;
    }

    set top(value: number) {
        if (this._top != value) {
            this._top = value;
            this.resetLayoutY();
        }
    }

    /**表示距底边的距离（以像素为单位）。*/
    get bottom(): number {
        return this._bottom;
    }

    set bottom(value: number) {
        if (this._bottom != value) {
            this._bottom = value;
            this.resetLayoutY();
        }
    }

    /**表示距左边的距离（以像素为单位）。*/
    get left(): number {
        return this._left;
    }

    set left(value: number) {
        if (this._left != value) {
            this._left = value;
            this.resetLayoutX();
        }
    }

    /**表示距右边的距离（以像素为单位）。*/
    get right(): number {
        return this._right;
    }

    set right(value: number) {
        if (this._right != value) {
            this._right = value;
            this.resetLayoutX();
        }
    }

    /**表示距水平方向中心轴的距离（以像素为单位）。*/
    get centerX(): number {
        return this._centerX;
    }

    set centerX(value: number) {
        if (this._centerX != value) {
            this._centerX = value;
            this.resetLayoutX();
        }
    }

    /**表示距垂直方向中心轴的距离（以像素为单位）。*/
    get centerY(): number {
        return this._centerY;
    }

    set centerY(value: number) {
        if (this._centerY != value) {
            this._centerY = value;
            this.resetLayoutY();
        }
    }
}

ILaya.regClass(Widget);
Widget.EMPTY = new Widget();
ClassUtils.regClass("laya.ui.Widget", Widget);
ClassUtils.regClass("Laya.Widget", Widget);
