import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Main } from "./../Main";

export class SmartScale_Landscape {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(550, 400).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.screenMode = Stage.SCREEN_HORIZONTAL;

			Laya.stage.bgColor = "#232628";

			this.showText();
		});

	}

	private showText(): void {
		var text: Text = new Text();

		text.text = "Orientation-Landscape";
		text.color = "gray";
		text.font = "Impact";
		text.fontSize = 50;

		text.x = Laya.stage.width - text.width >> 1;
		text.y = Laya.stage.height - text.height >> 1;

		this.Main.box2D.addChild(text);
	}
}

