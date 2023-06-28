import { Laya } from "Laya";
import { Main } from "./../Main";
import { Stage } from "laya/display/Stage"
import { HSlider } from "laya/ui/HSlider"
import { VSlider } from "laya/ui/VSlider"
import { Handler } from "laya/utils/Handler"

export class UI_Slider {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;
		Laya.init(550, 400).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			var skins: any[] = [];
			skins.push("res/ui/hslider.png", "res/ui/hslider$bar.png");
			skins.push("res/ui/vslider.png", "res/ui/vslider$bar.png");
			Laya.loader.load(skins, Handler.create(this, this.onLoadComplete));
		});

	}

	private onLoadComplete(e: any = null): void {
		this.placeHSlider();
		this.placeVSlider();
	}

	private placeHSlider(): void {
		var hs: HSlider = new HSlider();
		hs.skin = "res/ui/hslider.png";

		hs.width = 300;
		hs.pos(50, 170);
		hs.min = 0;
		hs.max = 100;
		hs.value = 50;
		hs.tick = 1;

		hs.changeHandler = new Handler(this, this.onChange);
		this.Main.box2D.addChild(hs);
	}

	private placeVSlider(): void {
		var vs: VSlider = new VSlider();

		vs.skin = "res/ui/vslider.png";

		vs.height = 300;
		vs.pos(400, 50);
		vs.min = 0;
		vs.max = 100;
		vs.value = 50;
		vs.tick = 1;

		vs.changeHandler = new Handler(this, this.onChange);
		this.Main.box2D.addChild(vs);
	}

	private onChange(value: number): void {
		console.log("滑块的位置：" + value);
	}
}

