import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { ColorPicker } from "laya/ui/ColorPicker";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class UI_ColorPicker {
	private skin: string = "res/ui/colorPicker.png";

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			Laya.loader.load(this.skin, Handler.create(this, this.onColorPickerSkinLoaded));
		});

	}

	private onColorPickerSkinLoaded(e: any = null): void {
		var colorPicker: ColorPicker = new ColorPicker();
		colorPicker.selectedColor = "#ff0033";
		colorPicker.skin = this.skin;

		colorPicker.pos(100, 100);
		colorPicker.changeHandler = new Handler(this, this.onChangeColor, [colorPicker]);
		this.Main.box2D.addChild(colorPicker);

		this.onChangeColor(colorPicker);
	}

	private onChangeColor(colorPicker: ColorPicker, e: any = null): void {
		console.log(colorPicker.selectedColor);
	}
}

