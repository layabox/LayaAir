import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class Sprite_MagnifyingGlass {
	private maskSp: Sprite;
	private bg2: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(1136, 640).then(() => {
			//
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			//
			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			Laya.loader.load("res/bg2.png", Handler.create(this, this.setup));
		});
	}

	private setup(_e: any = null): void {
		var bg: Sprite = new Sprite();
		bg.loadImage("res/bg2.png");
		this.Main.box2D.addChild(bg);

		this.bg2 = new Sprite();
		this.bg2.loadImage("res/bg2.png");
		this.Main.box2D.addChild(this.bg2);
		this.bg2.scale(3, 3);

		//创建mask
		this.maskSp = new Sprite();
		this.maskSp.loadImage("res/mask.png");
		this.maskSp.pivot(50, 50);

		//设置mask
		this.bg2.mask = this.maskSp;

		Laya.stage.on("mousemove", this, this.onMouseMove);
	}

	private onMouseMove(_e: any = null): void {
		this.bg2.x = -Laya.stage.mouseX * 2;
		this.bg2.y = -Laya.stage.mouseY * 2;

		this.maskSp.x = Laya.stage.mouseX;
		this.maskSp.y = Laya.stage.mouseY;
	}

	dispose(): void {
		Laya.stage.off("mousemove", this, this.onMouseMove);
	}
}

