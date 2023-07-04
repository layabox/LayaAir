import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Text_WordWrap {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.createText();
		});

	}

	private createText(): void {
		var txt: Text = new Text();

		txt.text = "Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！";

		txt.width = 300;

		txt.fontSize = 40;
		txt.color = "#ffffff";

		//设置文本为多行文本
		txt.wordWrap = true;

		txt.x = Laya.stage.width - txt.textWidth >> 1;
		txt.y = Laya.stage.height - txt.textHeight >> 1;

		this.Main.box2D.addChild(txt);
	}
}

