import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Timer_CallLater {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			//
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			//
			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.demonstrate();
		});
	}

	private demonstrate(): void {
		for (var i: number = 0; i < 10; i++) {
			Laya.timer.callLater(this, this.onCallLater);
		}
	}

	private onCallLater(e: any = null): void {
		console.log("onCallLater triggered");

		var text: Text = new Text();
		text.font = "SimHei";
		text.fontSize = 30;
		text.color = "#FFFFFF";
		text.text = "打开控制台可见该函数仅触发了一次";
		text.size(Laya.stage.width, Laya.stage.height);
		text.wordWrap = true;
		text.valign = "middle";
		text.align = "center";
		this.Main.box2D.addChild(text);
	}
}

