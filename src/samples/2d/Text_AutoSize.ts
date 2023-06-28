import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Main } from "./../Main";

export class Text_AutoSize {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(550, 400).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.setup();
		});

	}

	private setup(): void {
		// 该文本自动适应尺寸
		var autoSizeText: Text = this.createSampleText();
		autoSizeText.overflow = Text.VISIBLE;
		autoSizeText.y = 50;

		// 该文本被限制了宽度
		var widthLimitText: Text = this.createSampleText();
		widthLimitText.width = 100;
		widthLimitText.y = 180;

		//该文本被限制了高度 
		var heightLimitText: Text = this.createSampleText();
		heightLimitText.height = 20;
		heightLimitText.y = 320;
	}

	private createSampleText(): Text {
		var text: Text = new Text();
		text.overflow = Text.HIDDEN;

		text.color = "#FFFFFF";
		text.font = "Impact";
		text.fontSize = 20;
		text.borderColor = "#FFFF00";
		text.x = 80;

		this.Main.box2D.addChild(text);
		text.text = "A POWERFUL HTML5 ENGINE ON FLASH TECHNICAL\n" + "A POWERFUL HTML5 ENGINE ON FLASH TECHNICAL\n" + "A POWERFUL HTML5 ENGINE ON FLASH TECHNICAL";

		return text;
	}
}

