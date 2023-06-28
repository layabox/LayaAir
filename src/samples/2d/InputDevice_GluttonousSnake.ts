import { Laya } from "Laya";
import { AccelerationInfo } from "laya/device/motion/AccelerationInfo";
import { Accelerator } from "laya/device/motion/Accelerator";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { Point } from "laya/maths/Point";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

/**
 * ...
 * @author Survivor
 */
export class InputDevice_GluttonousSnake {
	private seg: Segment;
	private segments: any[] = [];
	private foods: any[] = [];

	private initialSegmentsAmount: number = 5;
	private vx: number = 0
	private vy: number = 0;
	private targetPosition: Point;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.width, Browser.height).then(() => {
			// 初始化蛇
			this.initSnake();
			// 监视加速器状态
			Accelerator.instance.on(Event.CHANGE, this, this.monitorAccelerator);
			// 游戏循环
			Laya.timer.frameLoop(1, this, this.animate);
			// 食物生产
			Laya.timer.loop(3000, this, this.produceFood);
			// 游戏开始时有一个食物
			this.produceFood();
		});

	}

	private initSnake(): void {
		for (var i: number = 0; i < this.initialSegmentsAmount; i++) {
			this.addSegment();

			// 蛇头部设置
			if (i == 0) {
				var header: Segment = this.segments[0];

				// 初始化位置
				header.rotation = 180;
				this.targetPosition = new Point();
				this.targetPosition.x = Laya.stage.width / 2;
				this.targetPosition.y = Laya.stage.height / 2;

				header.pos(this.targetPosition.x + header.width, this.targetPosition.y);

				// 蛇眼睛绘制
				header.graphics.drawCircle(header.width, 5, 3, "#000000");
				header.graphics.drawCircle(header.width, -5, 3, "#000000");
			}
		}
	}

	private monitorAccelerator(acceleration: AccelerationInfo, accelerationIncludingGravity: AccelerationInfo, rotationRate: any, interval: number): void {
		this.vx = accelerationIncludingGravity.x;
		this.vy = accelerationIncludingGravity.y;
	}

	private addSegment(): void {
		var seg: Segment = new Segment(40, 30);
		this.Main.box2D.addChildAt(seg, 0);

		// 蛇尾与上一节身体对齐
		if (this.segments.length > 0) {
			var prevSeg: Segment = this.segments[this.segments.length - 1];
			seg.rotation = prevSeg.rotation;
			var point: Point = seg.getPinPosition();
			seg.x = prevSeg.x - point.x;
			seg.y = prevSeg.y - point.y;
		}

		this.segments.push(seg);
	}

	private animate(): void {
		var seg: Segment = this.segments[0];

		// 更新蛇的位置
		this.targetPosition.x += this.vx;
		this.targetPosition.y += this.vy;

		// 限制蛇的移动范围
		this.limitMoveRange();
		// 检测觅食
		this.checkEatFood();

		// 更新所有关节位置
		var targetX: number = this.targetPosition.x;
		var targetY: number = this.targetPosition.y;

		for (var i: number = 0, len: number = this.segments.length; i < len; i++) {
			seg = this.segments[i];

			var dx: number = targetX - seg.x;
			var dy: number = targetY - seg.y;

			var radian: number = Math.atan2(dy, dx);
			seg.rotation = radian * 180 / Math.PI;

			var pinPosition: Point = seg.getPinPosition();
			var w: number = pinPosition.x - seg.x;
			var h: number = pinPosition.y - seg.y;

			seg.x = targetX - w;
			seg.y = targetY - h;

			targetX = seg.x;
			targetY = seg.y;
		}
	}

	private limitMoveRange(): void {
		if (this.targetPosition.x < 0)
			this.targetPosition.x = 0;
		else if (this.targetPosition.x > Laya.stage.width)
			this.targetPosition.x = Laya.stage.width;
		if (this.targetPosition.y < 0)
			this.targetPosition.y = 0;
		else if (this.targetPosition.y > Laya.stage.height)
			this.targetPosition.y = Laya.stage.height;
	}

	private checkEatFood(): void {
		var food: Sprite;
		for (var i: number = this.foods.length - 1; i >= 0; i--) {
			food = this.foods[i];
			if (food.hitTestPoint(this.targetPosition.x, this.targetPosition.y)) {
				this.addSegment();
				Laya.stage.removeChild(food);
				this.foods.splice(i, 1);
			}
		}
	}

	private produceFood(): void {
		// 最多五个食物同屏
		if (this.foods.length == 5)
			return;

		var food: Sprite = new Sprite();
		this.Main.box2D.addChild(food);
		this.foods.push(food);

		const foodSize: number = 40;
		food.size(foodSize, foodSize);
		food.graphics.drawRect(0, 0, foodSize, foodSize, "#00BFFF");

		food.x = Math.random() * Laya.stage.width;
		food.y = Math.random() * Laya.stage.height;
	}


	dispose(){
		Laya.timer.clear(this, this.animate);
		Laya.timer.clear(this, this.produceFood);
	}
}





class Segment extends Sprite {
	constructor(width: number, height: number) {
		super();
		this.size(width, height);
		this.init();
	}

	private init(): void {
		this.graphics.drawRect(-this.height / 2, -this.height / 2, this.width + this.height, this.height, "#FF7F50");
	}

	// 获取关节另一头位置
	getPinPosition(): Point {
		var radian: number = this.rotation * Math.PI / 180;
		var tx: number = this.x + Math.cos(radian) * this.width;
		var ty: number = this.y + Math.sin(radian) * this.width;

		return new Point(tx, ty);
	}
}
