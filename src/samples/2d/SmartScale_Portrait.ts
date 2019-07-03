import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { WebGL } from "laya/webgl/WebGL";
import { Main } from "./../Main";

export class SmartScale_Portrait {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		// 不支持WebGL时自动切换至Canvas
		Laya.init(550, 400, WebGL);

		Laya.stage.alignV = Stage.ALIGN_MIDDLE;
		Laya.stage.alignH = Stage.ALIGN_CENTER;

		Laya.stage.scaleMode = "showall";
		Laya.stage.screenMode = Stage.SCREEN_VERTICAL;

		Laya.stage.bgColor = "#232628";

		this.showText();
	}

	private showText(): void {
		var text: Text = new Text();

		text.text = "Orientation-Portrait";
		text.color = "gray";
		text.font = "Impact";
		text.fontSize = 50;

		text.x = Laya.stage.width - text.width >> 1;
		text.y = Laya.stage.height - text.height >> 1;

		this.Main.box2D.addChild(text);
	}
}

