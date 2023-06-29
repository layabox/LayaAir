import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Keyboard } from "laya/events/Keyboard";
import { TimeLine } from "laya/utils/TimeLine";
import { Main } from "./../Main";

export class Tween_TimeLine {
	private target: Sprite;
	private timeLine: TimeLine = new TimeLine();
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(550, 400).then(() => {

			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.setup();
		});
	}

	private setup(): void {
		this.createApe();
		this.createTimerLine();
		Laya.stage.on(Event.KEY_DOWN, this, this.keyDown);
	}
	private createApe(): void {
		this.target = new Sprite();
		this.target.loadImage("res/apes/monkey2.png");
		this.Main.box2D.addChild(this.target);
		this.target.pivot(55, 72);
		this.target.pos(100, 100);
	}

	private createTimerLine(): void {

		this.timeLine.addLabel("turnRight", 0).to(this.target, { 'x': 450, 'y': 100, 'scaleX': 0.5, 'scaleY': 0.5 }, 2000, null, 0).
			addLabel("turnDown", 0).to(this.target, { 'x': 450, 'y': 300, 'scaleX': 0.2, 'scaleY': 1, 'alpha': 1 }, 2000, null, 0).
			addLabel("turnLeft", 0).to(this.target, { 'x': 100, 'y': 300, 'scaleX': 1, 'scaleY': 0.2, 'alpha': 0.1 }, 2000, null, 0).
			addLabel("turnUp", 0).to(this.target, { 'x': 100, 'y': 100, 'scaleX': 1, 'scaleY': 1, 'alpha': 1 }, 2000, null, 0);
		this.timeLine.play(0, true);
		this.timeLine.on(Event.COMPLETE, this, this.onComplete);
		this.timeLine.on(Event.LABEL, this, this.onLabel);
	}
	private onComplete(): void {
		console.log("timeLine complete!!!!");
	}
	private onLabel(label: string): void {
		console.log("LabelName:" + label);
	}
	private keyDown(e: Event): void {
		switch (e.keyCode) {
			case Keyboard.LEFT:
				this.timeLine.play("turnLeft");
				break;
			case Keyboard.RIGHT:
				this.timeLine.play("turnRight");
				break;
			case Keyboard.UP:
				this.timeLine.play("turnUp");
				break;
			case Keyboard.DOWN:
				this.timeLine.play("turnDown");
				break;
			case Keyboard.P:
				this.timeLine.pause();
				break;
			case Keyboard.R:
				this.timeLine.resume();
				break;
		}
	}

	dispose(): void {
		Laya.stage.off(Event.KEY_DOWN, this, this.keyDown);
		if (this.timeLine) {
			this.timeLine.on(Event.COMPLETE, this, this.onComplete);
			this.timeLine.on(Event.LABEL, this, this.onLabel);
			this.timeLine.destroy();
			this.timeLine = null;
		}
	}
}

