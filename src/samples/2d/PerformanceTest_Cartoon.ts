import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Loader } from "laya/net/Loader";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Main } from "./../Main";
export class PerformanceTest_Cartoon {
	private colAmount: number = 100;
	private extraSpace: number = 50;
	private moveSpeed: number = 2;
	private rotateSpeed: number = 2;

	private characterGroup: any[];

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.width, Browser.height).then(() => {
			Laya.stage.bgColor = "#232628";
			Stat.show();
			Laya.loader.load("res/cartoonCharacters/cartoonCharactors.json", Handler.create(this, this.createCharacters), null, Loader.ATLAS);
		});
	}

	private createCharacters(e: any = null): void {
		this.characterGroup = [];

		for (var i: number = 0; i < this.colAmount; ++i) {
			var tx: number = (Laya.stage.width + this.extraSpace * 2) / this.colAmount * i - this.extraSpace;
			var tr: number = 360 / this.colAmount * i;
			var startY: number = (Laya.stage.height - 500) / 2;

			this.createCharacter("cartoonCharactors/1.png", 46, 50, tr).pos(tx, 50 + startY);
			this.createCharacter("cartoonCharactors/2.png", 34, 50, tr).pos(tx, 150 + startY);
			this.createCharacter("cartoonCharactors/3.png", 42, 50, tr).pos(tx, 250 + startY);
			this.createCharacter("cartoonCharactors/4.png", 48, 50, tr).pos(tx, 350 + startY);
			this.createCharacter("cartoonCharactors/5.png", 36, 50, tr).pos(tx, 450 + startY);
		}

		Laya.timer.frameLoop(1, this, this.animate);
	}

	private createCharacter(skin: string, pivotX: number, pivotY: number, rotation: number): Sprite {
		var charactor: Sprite = new Sprite();
		charactor.loadImage(skin);
		charactor.rotation = rotation;
		charactor.pivot(pivotX, pivotY);
		this.Main.box2D.addChild(charactor);
		this.characterGroup.push(charactor);

		return charactor;
	}

	private animate(): void {
		for (var i: number = this.characterGroup.length - 1; i >= 0; --i) {
			this.animateCharactor(this.characterGroup[i]);
		}
	}

	private animateCharactor(charactor: Sprite): void {
		charactor.x += this.moveSpeed;
		charactor.rotation += this.rotateSpeed;

		if (charactor.x > Laya.stage.width + this.extraSpace) {
			charactor.x = -this.extraSpace;
		}
	}

	dispose(): void {
		Laya.timer.clear(this, this.animate);
	}
}


