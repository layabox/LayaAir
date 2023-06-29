import { Laya } from "Laya";
import { Input } from "laya/display/Input";
import { Stage } from "laya/display/Stage";
import { Main } from "./../Main";
/**
 * ...
 * @author Survivor
 */
export class Text_Prompt {

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(550, 400).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.createInput();
		});

	}

	private createInput(): void {
		var inputText: Input = new Input();

		inputText.size(350, 100);
		inputText.x = Laya.stage.width - inputText.width >> 1;
		inputText.y = Laya.stage.height - inputText.height >> 1;

		(inputText as any).inputElementXAdjuster = -1;
		(inputText as any).inputElementYAdjuster = 1;

		// 设置字体样式
		inputText.bold = true;
		inputText.bgColor = "#666666";
		inputText.color = "#ffffff";
		inputText.fontSize = 20;

		// 设置提示符
		inputText.prompt = "输入用户名";
		inputText.promptColor = "#000000";

		this.Main.box2D.addChild(inputText);
	}
}

