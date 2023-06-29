import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Sprite_NodeControl {
	private ape1: Sprite;
	private ape2: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			//
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			//
			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.createApes();
		});
	}

	private createApes(): void {
		//显示两只猩猩
		this.ape1 = new Sprite();
		this.ape2 = new Sprite();
		this.ape1.loadImage("res/apes/monkey2.png");
		this.ape2.loadImage("res/apes/monkey2.png");

		this.ape1.pivot(55, 72);
		this.ape2.pivot(55, 72);

		this.ape1.pos(Laya.stage.width / 2, Laya.stage.height / 2);
		this.ape2.pos(200, 0);

		//一只猩猩在舞台上，另一只被添加成第一只猩猩的子级
		this.Main.box2D.addChild(this.ape1);
		this.ape1.addChild(this.ape2);

		Laya.timer.frameLoop(1, this, this.animate);
	}

	private animate(e: Event = null): void {
		this.ape1.rotation += 2;
		this.ape2.rotation -= 4;
	}

	dispose(): void {
		Laya.timer.clear(this, this.animate);
	}
}


