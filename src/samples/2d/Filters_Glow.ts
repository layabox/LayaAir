import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { GlowFilter } from "laya/filters/GlowFilter";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";
import { Stage } from "laya/display/Stage";

export class Filters_Glow {
	private apePath: string = "res/apes/monkey2.png";

	private ape: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			Laya.loader.load(this.apePath, Handler.create(this, this.setup));
		});

	}

	private setup(tex: Texture): void {
		this.createApe();
		this.applayFilter();
	}

	private createApe(): void {
		this.ape = new Sprite();
		this.ape.loadImage(this.apePath);

		var texture: Texture = Laya.loader.getRes(this.apePath);
		this.ape.x = (Laya.stage.width - texture.width) / 2;
		this.ape.y = (Laya.stage.height - texture.height) / 2;

		this.Main.box2D.addChild(this.ape);
	}

	private applayFilter(): void {
		//创建一个发光滤镜
		var glowFilter: GlowFilter = new GlowFilter("#ffff00", 10, 0, 0);
		//设置滤镜集合为发光滤镜
		this.ape.filters = [glowFilter];
	}
}

