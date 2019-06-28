import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { MouseManager } from "../events/MouseManager";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { ILaya } from "./../../ILaya";
import { Ease } from "./Ease";
import { Handler } from "./Handler";
import { Tween } from "./Tween";

/**
 * @private
 * <code>Dragging</code> 类是触摸滑动控件。
 */
export class Dragging {


	/** 被拖动的对象。*/
	target: Sprite;
	/** 缓动衰减系数。*/
	ratio: number = 0.92;
	/** 单帧最大偏移量。*/
	maxOffset: number = 60;
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

	private _dragging: boolean = false;
	private _clickOnly: boolean = true;
	private _elasticRateX: number;
	private _elasticRateY: number;
	private _lastX: number;
	private _lastY: number;
	private _offsetX: number;
	private _offsetY: number;
	private _offsets: any[];
	private _disableMouseEvent: boolean;
	private _tween: Tween;
	private _parent: Sprite;

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
	start(target: Sprite, area: Rectangle, hasInertia: boolean, elasticDistance: number, elasticBackTime: number, data: any, disableMouseEvent: boolean, ratio: number = 0.92): void {
		this.clearTimer();

		this.target = target;
		this.area = area;
		this.hasInertia = hasInertia;
		this.elasticDistance = area ? elasticDistance : 0;
		this.elasticBackTime = elasticBackTime;
		this.data = data;
		this._disableMouseEvent = disableMouseEvent;
		this.ratio = ratio;

		this._parent = (target.parent as Sprite);

		this._clickOnly = true;
		this._dragging = true;
		this._elasticRateX = this._elasticRateY = 1;
		this._lastX = this._parent.mouseX;
		this._lastY = this._parent.mouseY;

		ILaya.stage.on(Event.MOUSE_UP, this, this.onStageMouseUp);
		ILaya.stage.on(Event.MOUSE_OUT, this, this.onStageMouseUp);
		//Laya.stage.on(Event.MOUSE_MOVE, this, onStageMouseMove);
		ILaya.systemTimer.frameLoop(1, this, this.loop);
	}

	/**
	 * 清除计时器。
	 */
	private clearTimer(): void {
		ILaya.systemTimer.clear(this, this.loop);
		ILaya.systemTimer.clear(this, this.tweenMove);
		if (this._tween) {
			this._tween.recover();
			this._tween = null;
		}
	}

	/**
	 * 停止拖拽。
	 */
	stop(): void {
		if (this._dragging) {
			MouseManager.instance.disableMouseEvent = false;
			ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
			ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);
			this._dragging = false;
			this.target && this.area && this.backToArea();
			this.clear();
		}
	}

	/**
	 * 拖拽的循环处理函数。
	 */
	private loop(): void {
		var point: Point = this._parent.getMousePoint();
		var mouseX: number = point.x;
		var mouseY: number = point.y;
		var offsetX: number = mouseX - this._lastX;
		var offsetY: number = mouseY - this._lastY;

		if (this._clickOnly) {
			if (Math.abs(offsetX * ILaya.stage._canvasTransform.getScaleX()) > 1 || Math.abs(offsetY * ILaya.stage._canvasTransform.getScaleY()) > 1) {
				this._clickOnly = false;
				this._offsets || (this._offsets = []);
				this._offsets.length = 0;
				this.target.event(Event.DRAG_START, this.data);
				MouseManager.instance.disableMouseEvent = this._disableMouseEvent;
				//TODO:
				//target._set$P("$_MOUSEDOWN", false);
			} else return;
		} else {
			this._offsets.push(offsetX, offsetY);
		}
		if (offsetX === 0 && offsetY === 0) return;

		this._lastX = mouseX;
		this._lastY = mouseY;
		this.target.x += offsetX * this._elasticRateX;
		this.target.y += offsetY * this._elasticRateY;

		this.area && this.checkArea();

		this.target.event(Event.DRAG_MOVE, this.data);
	}

	/**
	 * 拖拽区域检测。
	 */
	private checkArea(): void {
		if (this.elasticDistance <= 0) {
			this.backToArea();
		} else {
			if (this.target._x < this.area.x) {
				var offsetX: number = this.area.x - this.target._x;
			} else if (this.target._x > this.area.x + this.area.width) {
				offsetX = this.target._x - this.area.x - this.area.width;
			} else {
				offsetX = 0;
			}
			this._elasticRateX = Math.max(0, 1 - (offsetX / this.elasticDistance));

			if (this.target._y < this.area.y) {
				var offsetY: number = this.area.y - this.target.y;
			} else if (this.target._y > this.area.y + this.area.height) {
				offsetY = this.target._y - this.area.y - this.area.height;
			} else {
				offsetY = 0;
			}
			this._elasticRateY = Math.max(0, 1 - (offsetY / this.elasticDistance));
		}
	}

	/**
	 * 移动至设定的拖拽区域。
	 */
	private backToArea(): void {
		this.target.x = Math.min(Math.max(this.target._x, this.area.x), this.area.x + this.area.width);
		this.target.y = Math.min(Math.max(this.target._y, this.area.y), this.area.y + this.area.height);
	}

	/**
	 * 舞台的抬起事件侦听函数。
	 * @param	e Event 对象。
	 */
	private onStageMouseUp(e: Event): void {
		MouseManager.instance.disableMouseEvent = false;
		ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
		ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);
		//Laya.stage.off(Event.MOUSE_MOVE, this, onStageMouseMove);
		ILaya.systemTimer.clear(this, this.loop);

		if (this._clickOnly || !this.target) return;
		//target.mouseEnabled = true;

		if (this.hasInertia) {
			//计算平均值
			if (this._offsets.length < 1) {
				this._offsets.push(this._parent.mouseX - this._lastX, this._parent.mouseY - this._lastY);
			}

			this._offsetX = this._offsetY = 0;
			var len: number = this._offsets.length;
			var n: number = Math.min(len, 6);
			var m: number = this._offsets.length - n;
			for (var i: number = len - 1; i > m; i--) {
				this._offsetY += this._offsets[i--];
				this._offsetX += this._offsets[i];
			}

			this._offsetX = this._offsetX / n * 2;
			this._offsetY = this._offsetY / n * 2;

			if (Math.abs(this._offsetX) > this.maxOffset) this._offsetX = this._offsetX > 0 ? this.maxOffset : -this.maxOffset;
			if (Math.abs(this._offsetY) > this.maxOffset) this._offsetY = this._offsetY > 0 ? this.maxOffset : -this.maxOffset;
			ILaya.systemTimer.frameLoop(1, this, this.tweenMove);
		} else if (this.elasticDistance > 0) {
			this.checkElastic();
		} else {
			this.clear();
		}
	}

	/**
	 * 橡皮筋效果检测。
	 */
	private checkElastic(): void {
		var tx: number = NaN;
		var ty: number = NaN;
		if (this.target.x < this.area.x) tx = this.area.x;
		else if (this.target._x > this.area.x + this.area.width) tx = this.area.x + this.area.width;

		if (this.target.y < this.area.y) ty = this.area.y;
		else if (this.target._y > this.area.y + this.area.height) ty = this.area.y + this.area.height;

		if (!isNaN(tx) || !isNaN(ty)) {
			var obj: any = {};
			if (!isNaN(tx)) obj.x = tx;
			if (!isNaN(ty)) obj.y = ty;
			this._tween = Tween.to(this.target, obj, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.clear), 0, false, false);
		} else {
			this.clear();
		}
	}

	/**
	 * 移动。
	 */
	private tweenMove(): void {
		this._offsetX *= this.ratio * this._elasticRateX;
		this._offsetY *= this.ratio * this._elasticRateY;

		this.target.x += this._offsetX;
		this.target.y += this._offsetY;

		this.area && this.checkArea();

		this.target.event(Event.DRAG_MOVE, this.data);

		if ((Math.abs(this._offsetX) < 1 && Math.abs(this._offsetY) < 1) || this._elasticRateX < 0.5 || this._elasticRateY < 0.5) {
			ILaya.systemTimer.clear(this, this.tweenMove);
			if (this.elasticDistance > 0) this.checkElastic();
			else this.clear();
		}
	}

	/**
	 * 结束拖拽。
	 */
	private clear(): void {
		if (this.target) {
			this.clearTimer();
			var sp = this.target;
			this.target = null;
			this._parent = null;
			sp.event(Event.DRAG_END, this.data);
		}
	}
}

