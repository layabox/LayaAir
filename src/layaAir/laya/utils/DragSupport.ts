import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { ILaya } from "../../ILaya";
import { Ease } from "../tween/Ease";
import { Tween } from "../tween/Tween";
import { InputManager } from "../events/InputManager";

/**
 * @en The `DragSupport` class is a touch sliding control.
 * @zh `DragSupport` 类是触摸滑动控件。
 */
export class DragSupport {
    /**
     * @en The object being dragged.
     * @zh 被拖动的对象。
     */
    readonly target: Sprite;
    /**
     * @en The damping ratio for easing.
     * @zh 缓动衰减系数。
     */
    ratio: number = 0.92;
    /**
     * @en The maximum offset per frame.
     * @zh 单帧最大偏移量。
     */
    maxOffset: number = 60;
    /**
     * @en The sliding area.
     * @zh 滑动范围。
     */
    readonly area: Rectangle;
    /**
     * @en Indicates whether the dragging has inertia.
     * @zh 表示拖动是否有惯性。
     */
    hasInertia: boolean = false;
    /**
     * @en The maximum elastic distance.
     * @zh 橡皮筋最大值。
     */
    elasticDistance: number = 0;
    /**
     * @en The time for elastic back in milliseconds.
     * @zh 橡皮筋回弹时间，单位为毫秒。
     */
    elasticBackTime: number = 300;

    /**
     * @en Indicates whether to automatically start dragging when the mouse is pressed.
     * @zh 表示鼠标按下时是否自动开始拖拽。
     */
    autoStart: boolean = false;

    private _testing: boolean = false;
    private _dragging: boolean = false;
    private _touchId: number;
    private _elasticRateX: number;
    private _elasticRateY: number;
    private _lastX: number;
    private _lastY: number;
    private _offsetX: number;
    private _offsetY: number;
    private _offsets: number[];
    private _tween: Tween;
    private _data: any;

    constructor(owner: Sprite) {
        this.target = owner;
        this.area = new Rectangle();
        this._offsets = [];

        this.target.on(Event.MOUSE_DOWN, this, this.onMouseDown);
        this.target.on(Event.MOUSE_DRAG, this, this.onMouseDrag);
        this.target.on(Event.MOUSE_DRAG_END, this, this.onMouseDragEnd);
    }

    get dragging(): boolean {
        return this._dragging;
    }

    /**
     * @en Start dragging.
     * @param data (Optional) The data to be passed to the event handler.
     * @zh 开始拖拽。
     * @param data (可选) 要传递给事件处理程序的数据。
     */
    start(data?: any): void {
        this.reset();

        this._touchId = InputManager.lastTouchId;
        this._dragging = true;
        this._testing = false;
        this._elasticRateX = this._elasticRateY = 1;
        this._lastX = this.target._parent.mouseX;
        this._lastY = this.target._parent.mouseY;
        this._offsets.length = 0;
        this._data = data;
    }

    /**
     * 清除计时器。
     */
    private reset(): void {
        this._dragging = false;
        this._testing = false;
        this._data = null;
        ILaya.systemTimer.clear(this, this.tweenMove);
        if (this._tween != null) {
            this._tween.kill();
            this._tween = null;
        }
    }

    /**
     * @en Stop dragging
     * @zh 停止拖拽。
     */
    stop(): void {
        if (!this._dragging) {
            this._testing = false;
            return;
        }

        if (!this._testing) {
            this._dragging = false;
            this.moveTarget(0, 0);
            this.clear();
        }
    }

    private onMouseDown() {
        if (this.autoStart && !this._dragging && !this._testing) {
            this.start();
            this._testing = true;
        }
    }

    private onMouseDrag(evt: Event): void {
        if (!this._testing && !this._dragging)
            return;

        if (this._touchId != evt.touchId)
            return;

        let point: Point = this.target._parent.getMousePoint();
        let mouseX: number = point.x;
        let mouseY: number = point.y;
        let offsetX: number = mouseX - this._lastX;
        let offsetY: number = mouseY - this._lastY;

        if (this._testing) {
            if (Math.abs(offsetX * ILaya.stage._canvasTransform.getScaleX()) < 1 && Math.abs(offsetY * ILaya.stage._canvasTransform.getScaleY()) < 1)
                return;

            this._dragging = true;
            this.target.event(Event.DRAG_START, this._data);
            if (!this._dragging)  //maybe cancelled
                return;

            this._testing = false;
        }

        this._offsets.push(offsetX, offsetY);
        this._lastX = mouseX;
        this._lastY = mouseY;
        this.moveTarget(offsetX * this._elasticRateX, offsetY * this._elasticRateY);

        this.target.event(Event.DRAG_MOVE, this._data);
    }

    private onMouseDragEnd(evt: Event): void {
        if (!this._dragging) {
            this._testing = false;
            return;
        }

        if (this._touchId != evt.touchId)
            return;

        if (this.hasInertia) {
            //计算平均值
            if (this._offsets.length < 1) {
                this._offsets.push(this.target._parent.mouseX - this._lastX, this.target._parent.mouseY - this._lastY);
            }

            this._offsetX = this._offsetY = 0;
            let len: number = this._offsets.length;
            let n: number = Math.min(len, 6);
            let m: number = this._offsets.length - n;
            for (let i: number = len - 1; i > m; i--) {
                this._offsetY += this._offsets[i--];
                this._offsetX += this._offsets[i];
            }

            this._offsetX = this._offsetX / n * 2;
            this._offsetY = this._offsetY / n * 2;

            if (Math.abs(this._offsetX) > this.maxOffset)
                this._offsetX = this._offsetX > 0 ? this.maxOffset : -this.maxOffset;
            if (Math.abs(this._offsetY) > this.maxOffset)
                this._offsetY = this._offsetY > 0 ? this.maxOffset : -this.maxOffset;
            ILaya.systemTimer.frameLoop(1, this, this.tweenMove);

        } else if (!this.area.isEmpty() && this.elasticDistance > 0) {
            this.checkElastic();
        } else {
            this.clear();
        }
    }

    private moveTarget(dx: number, dy: number): void {
        let nx = this.target._x + dx;
        let ny = this.target._y + dy;
        if (this.area.isEmpty())
            this.target.pos(nx, ny);
        else if (this.elasticDistance > 0 && this._dragging) {
            this.target.pos(nx, ny);
            this.updateElasticRate();
        }
        else
            this.target.pos(Math.min(Math.max(nx, this.area.x), this.area.x + this.area.width),
                Math.min(Math.max(ny, this.area.y), this.area.y + this.area.height));
    }

    private updateElasticRate() {
        let left: number;
        let top: number;
        if (this.target._x < this.area.x)
            left = this.area.x - this.target._x;
        else if (this.target._x > this.area.x + this.area.width)
            left = this.target._x - this.area.x - this.area.width;
        else
            left = 0;

        if (this.target._y < this.area.y)
            top = this.area.y - this.target._y;
        else if (this.target._y > this.area.y + this.area.height)
            top = this.target._y - this.area.y - this.area.height;
        else
            top = 0;

        this._elasticRateX = Math.max(0, 1 - (left / this.elasticDistance));
        this._elasticRateY = Math.max(0, 1 - (top / this.elasticDistance));
    }

    /**
     * 橡皮筋效果检测。
     */
    private checkElastic(): void {
        let tx: number;
        let ty: number;
        if (this.target._x < this.area.x)
            tx = this.area.x;
        else if (this.target._x > this.area.x + this.area.width)
            tx = this.area.x + this.area.width;

        if (this.target._y < this.area.y)
            ty = this.area.y;
        else if (this.target._y > this.area.y + this.area.height)
            ty = this.area.y + this.area.height;

        if (tx != null || ty != null) {
            this._tween = Tween.create(this.target).duration(this.elasticBackTime).ease(Ease.sineOut).then(this.clear, this);
            if (tx != null)
                this._tween.to("x", tx);
            if (ty != null)
                this._tween.to("y", ty);
        } else {
            this.clear();
        }
    }

    private tweenMove(): void {
        this._offsetX *= this.ratio * this._elasticRateX;
        this._offsetY *= this.ratio * this._elasticRateY;

        this.moveTarget(this._offsetX, this._offsetY);

        this.target.event(Event.DRAG_MOVE, this._data);

        if ((Math.abs(this._offsetX) < 1 && Math.abs(this._offsetY) < 1) || this._elasticRateX < 0.5 || this._elasticRateY < 0.5) {
            ILaya.systemTimer.clear(this, this.tweenMove);
            if (!this.area.isEmpty() && this.elasticDistance > 0)
                this.checkElastic();
            else
                this.clear();
        }
    }

    private clear(): void {
        let d = this._data;
        this.reset();
        this.target.event(Event.DRAG_END, d);
    }
}

