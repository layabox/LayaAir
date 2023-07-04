import { Laya } from "Laya";
import { Main } from "./../Main";
import { BitmapFont } from "laya/display/BitmapFont";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { Loader } from "laya/net/Loader";


export class Text_BitmapFont {
	private fontName: string = "diyFont";

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.loadFont();
		});

	}

	private loadFont(): void {
		Laya.loader.load("res/bitmapFont/test.fnt", Loader.FONT).then((res: BitmapFont) => {
			this.onFontLoaded(res);
		});
	}

	private onFontLoaded(bitmapFont: BitmapFont): void {
		bitmapFont.letterSpacing = 10;
		Text.registerBitmapFont(this.fontName, bitmapFont);
		this.createText(this.fontName);
	}

	private createText(font: string): void {
		var txt: Text = new Text();
		txt.width = 250;
		txt.wordWrap = true;
		txt.text = "Do one thing at a time, and do well.";
		txt.font = font;
		txt.leading = 5;
		txt.pos(Laya.stage.width - txt.width >> 1, Laya.stage.height - txt.height >> 1);
		this.Main.box2D.addChild(txt);
	}
}


