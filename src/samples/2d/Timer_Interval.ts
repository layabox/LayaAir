import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Timer_Interval {
	private rotateTimeBasedText: Text;
	private rotateFrameRateBasedText: Text;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {

			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.setup();
		});
	}

	private setup(): void {
		var vGap: number = 200;

		this.rotateTimeBasedText = this.createText("基于时间旋转", Laya.stage.width / 2, (Laya.stage.height - vGap) / 2);
		this.rotateFrameRateBasedText = this.createText("基于帧频旋转", this.rotateTimeBasedText.x, this.rotateTimeBasedText.y + vGap);

		Laya.timer.loop(200, this, this.animateTimeBased);
		Laya.timer.frameLoop(2, this, this.animateFrameRateBased);
	}

	private createText(text: string, x: number, y: number): Text {
		var t: Text = new Text();
		t.text = text;
		t.fontSize = 30;
		t.color = "white";
		t.bold = true;
		t.pivot(t.width / 2, t.height / 2);
		t.pos(x, y);
		this.Main.box2D.addChild(t);

		return t;
	}

	private animateTimeBased(): void {
		this.rotateTimeBasedText.rotation += 1;
	}

	private animateFrameRateBased(): void {
		this.rotateFrameRateBasedText.rotation += 1;
	}

	dispose(): void {
		Laya.timer.clear(this, this.animateTimeBased);
		Laya.timer.clear(this, this.animateFrameRateBased);
	}
}

