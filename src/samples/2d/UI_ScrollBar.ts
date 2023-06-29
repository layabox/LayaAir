import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { HScrollBar } from "laya/ui/HScrollBar";
import { VScrollBar } from "laya/ui/VScrollBar";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class UI_ScrollBar {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(550, 400).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			var skins: any[] = [];
			skins.push("res/ui/hscroll.png", "res/ui/hscroll$bar.png", "res/ui/hscroll$down.png", "res/ui/hscroll$up.png");
			skins.push("res/ui/vscroll.png", "res/ui/vscroll$bar.png", "res/ui/vscroll$down.png", "res/ui/vscroll$up.png");
			Laya.loader.load(skins, Handler.create(this, this.onSkinLoadComplete));
		});

	}

	private onSkinLoadComplete(e: any = null): void {
		this.placeHScroller();
		this.placeVScroller();
	}

	private placeHScroller(): void {
		var hs: HScrollBar = new HScrollBar();
		hs.skin = "res/ui/hscroll.png";
		hs.width = 300;
		hs.pos(50, 170);

		hs.min = 0;
		hs.max = 100;

		hs.changeHandler = new Handler(this, this.onChange);
		this.Main.box2D.addChild(hs);
	}

	private placeVScroller(): void {
		var vs: VScrollBar = new VScrollBar();
		vs.skin = "res/ui/vscroll.png";
		vs.height = 300;
		vs.pos(400, 50);

		vs.min = 0;
		vs.max = 100;

		vs.changeHandler = new Handler(this, this.onChange);
		this.Main.box2D.addChild(vs);
	}

	private onChange(value: number): void {
		console.log("滚动条的位置： value=" + value);
	}
}

