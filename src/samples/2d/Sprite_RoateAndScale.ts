import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Sprite_RoateAndScale {
	private ape: Sprite;
	private scaleDelta: number = 0;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.createApe();
		});
	}

	private createApe(): void {
		this.ape = new Sprite();

		this.ape.loadImage("res/apes/monkey2.png");
		this.Main.box2D.addChild(this.ape);
		this.ape.pivot(55, 72);
		this.ape.x = Laya.stage.width / 2;
		this.ape.y = Laya.stage.height / 2;

		Laya.timer.frameLoop(1, this, this.animate);
	}

	private animate(e: Event = null): void {
		this.ape.rotation += 2;

		//心跳缩放
		this.scaleDelta += 0.02;
		var scaleValue: number = Math.sin(this.scaleDelta);
		this.ape.scale(scaleValue, scaleValue);
	}

	dispose(): void {
		Laya.timer.clear(this, this.animate);
	}
}

