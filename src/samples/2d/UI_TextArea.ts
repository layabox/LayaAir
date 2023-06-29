import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { TextArea } from "laya/ui/TextArea";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class UI_TextArea {
	private skin: string = "res/ui/textarea.png";

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(550, 400).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			Laya.loader.load(this.skin, Handler.create(this, this.onLoadComplete));
		});

	}

	private onLoadComplete(e: any = null): void {
		var ta: TextArea = new TextArea("");
		ta.skin = this.skin;

		ta.font = "Arial";
		ta.fontSize = 18;
		ta.bold = true;

		ta.color = "#3d3d3d";

		ta.pos(100, 15);
		ta.size(375, 355);

		ta.padding = "70,8,8,8";

		var scaleFactor: number = Browser.pixelRatio;

		this.Main.box2D.addChild(ta);
	}
}

