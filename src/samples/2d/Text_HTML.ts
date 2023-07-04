import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Main } from "../Main";
import { Text } from "laya/display/Text";

export class Text_HTML {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.setup();
		});
	}

	private setup(): void {
		this.createParagraph();	// 代码创建
	}
	private createParagraph(): void {
		var p: Text = new Text();
		this.Main.box2D.addChild(p);
		p.zOrder = 90000;
		p.font = "Impact";
		p.fontSize = 40;
		p.html = true;

		p.text = '<font color=#e3d26a>使用</font><br/>';
		p.text += '<font color=#409ed7><b>文本的</b>HTML</font><br/>';
		p.text += '<font color=#10d269><i>创建的</i></font><br/>';
		p.text += '<font color=#dfbfc9><u>HTML富文本</u></font>';
	}
}

