import { Component } from "../components/Component";
import { Event } from "../events/Event";
/**
 * 相对布局插件
 */
export class Widget extends Component {
    constructor() {
        super(...arguments);
        this._top = NaN;
        this._bottom = NaN;
        this._left = NaN;
        this._right = NaN;
        this._centerX = NaN;
        this._centerY = NaN;
    }
    /*override*/ onReset() {
        this._top = this._bottom = this._left = this._right = this._centerX = this._centerY = NaN;
    }
    /*override*/ _onEnable() {
        if (this.owner.parent)
            this._onAdded();
        else
            this.owner.once(Event.ADDED, this, this._onAdded);
    }
    /*override*/ _onDisable() {
        this.owner.off(Event.ADDED, this, this._onAdded);
        if (this.owner.parent)
            this.owner.parent.off(Event.RESIZE, this, this._onParentResize);
    }
    /**
     * 对象被添加到显示列表的事件侦听处理函数。
     */
    /*override*/ _onAdded() {
        if (this.owner.parent)
            this.owner.parent.on(Event.RESIZE, this, this._onParentResize);
        this.resetLayoutX();
        this.resetLayoutY();
    }
    /**
     * 父容器的 <code>Event.RESIZE</code> 事件侦听处理函数。
     */
    _onParentResize() {
        if (this.resetLayoutX() || this.resetLayoutY())
            this.owner.event(Event.RESIZE);
    }
    /**
     * <p>重置对象的 <code>X</code> 轴（水平方向）布局。</p>
     * @private
     */
    resetLayoutX() {
        var owner = this.owner;
        if (!owner)
            return false;
        var parent = owner.parent;
        if (parent) {
            if (!isNaN(this.centerX)) {
                owner.x = Math.round((parent.width - owner.displayWidth) * 0.5 + this.centerX + owner.pivotX * owner.scaleX);
            }
            else if (!isNaN(this.left)) {
                owner.x = Math.round(this.left + owner.pivotX * owner.scaleX);
                if (!isNaN(this.right)) {
                    //TODO:如果用width，会死循环
                    var temp = (parent._width - this.left - this.right) / (owner.scaleX || 0.01);
                    if (temp != owner.width) {
                        owner.width = temp;
                        return true;
                    }
                }
            }
            else if (!isNaN(this.right)) {
                owner.x = Math.round(parent.width - owner.displayWidth - this.right + owner.pivotX * owner.scaleX);
            }
        }
        return false;
    }
    /**
     * <p>重置对象的 <code>Y</code> 轴（垂直方向）布局。</p>
     * @private
     */
    resetLayoutY() {
        var owner = this.owner;
        if (!owner)
            return false;
        var parent = owner.parent;
        if (parent) {
            if (!isNaN(this.centerY)) {
                owner.y = Math.round((parent.height - owner.displayHeight) * 0.5 + this.centerY + owner.pivotY * owner.scaleY);
            }
            else if (!isNaN(this.top)) {
                owner.y = Math.round(this.top + owner.pivotY * owner.scaleY);
                if (!isNaN(this.bottom)) {
                    //TODO:
                    var temp = (parent._height - this.top - this.bottom) / (owner.scaleY || 0.01);
                    if (temp != owner.height) {
                        owner.height = temp;
                        return true;
                    }
                }
            }
            else if (!isNaN(this.bottom)) {
                owner.y = Math.round(parent.height - owner.displayHeight - this.bottom + owner.pivotY * owner.scaleY);
            }
        }
        return false;
    }
    /**
     * 重新计算布局
     */
    resetLayout() {
        if (this.owner) {
            this.resetLayoutX();
            this.resetLayoutY();
        }
    }
    /**表示距顶边的距离（以像素为单位）。*/
    get top() {
        return this._top;
    }
    set top(value) {
        if (this._top != value) {
            this._top = value;
            this.resetLayoutY();
        }
    }
    /**表示距底边的距离（以像素为单位）。*/
    get bottom() {
        return this._bottom;
    }
    set bottom(value) {
        if (this._bottom != value) {
            this._bottom = value;
            this.resetLayoutY();
        }
    }
    /**表示距左边的距离（以像素为单位）。*/
    get left() {
        return this._left;
    }
    set left(value) {
        if (this._left != value) {
            this._left = value;
            this.resetLayoutX();
        }
    }
    /**表示距右边的距离（以像素为单位）。*/
    get right() {
        return this._right;
    }
    set right(value) {
        if (this._right != value) {
            this._right = value;
            this.resetLayoutX();
        }
    }
    /**表示距水平方向中心轴的距离（以像素为单位）。*/
    get centerX() {
        return this._centerX;
    }
    set centerX(value) {
        if (this._centerX != value) {
            this._centerX = value;
            this.resetLayoutX();
        }
    }
    /**表示距垂直方向中心轴的距离（以像素为单位）。*/
    get centerY() {
        return this._centerY;
    }
    set centerY(value) {
        if (this._centerY != value) {
            this._centerY = value;
            this.resetLayoutY();
        }
    }
}
/**一个已初始化的 <code>Widget</code> 实例。*/
Widget.EMPTY = new Widget();
