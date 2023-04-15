import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Tween } from "laya/utils/Tween";
import { WebGL } from "laya/webgl/WebGL";
import { Main } from "./../Main";

export class Interaction_Swipe {
	//swipe滚动范围
	private TrackLength: number = 200;
	//触发swipe的拖动距离
	private TOGGLE_DIST: number = this.TrackLength / 2;

	private buttonPosition: number;
	private beginPosition: number;
	private endPosition: number;

	private button: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		// 不支持WebGL时自动切换至Canvas
		Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
		//
		Laya.stage.alignV = Stage.ALIGN_MIDDLE;
		Laya.stage.alignH = Stage.ALIGN_CENTER;
		//
		Laya.stage.scaleMode = "showall";
		Laya.stage.bgColor = "#232628";


		this.setup();
	}

	private setup(): void {
		this.createSprtie();
		this.drawTrack();
	}

	private createSprtie(): void {
		const w: number = 50;
		const h: number = 30;

		this.button = new Sprite();
		this.button.graphics.drawRect(0, 0, w, h, "#FF7F50");
		this.button.anchorX = 0.5;
		this.button.anchorY = 0.5;
		//设置宽高（要接收鼠标事件必须设置宽高，否则不会被命中）  
		this.button.size(w, h);
		this.button.x = (Laya.stage.width - this.TrackLength) / 2;
		this.button.y = Laya.stage.height / 2;

		this.button.on(Event.MOUSE_DOWN, this, this.onMouseDown);

		this.Main.box2D.addChild(this.button);
		//左侧临界点设为圆形初始位置
		this.beginPosition = this.button.x;
		//右侧临界点设置
		this.endPosition = this.beginPosition + this.TrackLength;
	}

	private drawTrack(): void {
		var graph: Sprite = new Sprite();
		Laya.stage.graphics.drawLine(
			this.beginPosition, Laya.stage.height / 2,
			this.endPosition, Laya.stage.height / 2,
			"#FFFFFF", 20);
		this.Main.box2D.addChild(graph);
	}

	/**按下事件处理*/
	private onMouseDown(e: Event = null): void {
		//添加鼠标移到侦听
		Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
		this.buttonPosition = this.button.x;

		Laya.stage.on(Event.MOUSE_UP, this, this.onMouseUp);
		Laya.stage.on(Event.MOUSE_OUT, this, this.onMouseUp);
	}
	/**移到事件处理*/
	private onMouseMove(e: Event = null): void {
		this.button.x = Math.max(Math.min(Laya.stage.mouseX, this.endPosition), this.beginPosition);
	}

	/**抬起事件处理*/
	private onMouseUp(e: Event = null): void {
		Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
		Laya.stage.off(Event.MOUSE_UP, this, this.onMouseUp);
		Laya.stage.off(Event.MOUSE_OUT, this, this.onMouseUp);

		// 滑动到目的地
		var dist: number = Laya.stage.mouseX - this.buttonPosition;

		var targetX = this.beginPosition;
		if (dist > this.TOGGLE_DIST)
			targetX = this.endPosition;
		Tween.to(this.button, { x: targetX }, 100);
	}

	dispose(): void {
		if (this.button) {
			this.button.off(Event.MOUSE_DOWN, this, this.onMouseDown);
		}
		Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
		Laya.stage.off(Event.MOUSE_UP, this, this.onMouseUp);
		Laya.stage.off(Event.MOUSE_OUT, this, this.onMouseUp);
		Laya.stage.graphics.clear();
	}
}

