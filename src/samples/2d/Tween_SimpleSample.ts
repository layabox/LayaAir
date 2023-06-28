import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Tween } from "laya/utils/Tween";
import { Main } from "./../Main";

export class Tween_SimpleSample {

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {

			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.setup();
		});
	}

	private setup(): void {
		var terminalX: number = 200;

		var characterA: Sprite = this.createCharacter("res/cartoonCharacters/1.png");
		characterA.pivot(46.5, 50);
		characterA.y = 100;

		var characterB: Sprite = this.createCharacter("res/cartoonCharacters/2.png");
		characterB.pivot(34, 50);
		characterB.y = 250;

		this.Main.box2D.graphics.drawLine(terminalX, 0, terminalX, Laya.stage.height, "#FFFFFF");

		// characterA使用Tween.to缓动
		Tween.to(characterA, { "x": terminalX }, 1000);
		// characterB使用Tween.from缓动
		characterB.x = terminalX;
		Tween.from(characterB, { "x": 0 }, 1000);
	}

	private createCharacter(skin: string): Sprite {
		var character: Sprite = new Sprite();
		character.loadImage(skin);
		this.Main.box2D.addChild(character);

		return character;
	}

	dispose(): void {
		this.Main.box2D.graphics.clear();
	}
}

