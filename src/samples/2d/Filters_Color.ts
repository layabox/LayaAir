import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { ColorFilter } from "laya/filters/ColorFilter";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class Filters_Color {
	private ApePath: string = "res/apes/monkey2.png";

	private apeTexture: Texture;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			Laya.loader.load(this.ApePath, Handler.create(this, this.setup));
		});

	}

	private setup(e: any = null): void {
		this.normalizeApe();
		this.makeRedApe();
		this.grayingApe();
	}

	private normalizeApe(): void {
		var originalApe: Sprite = this.createApe();

		this.apeTexture = Laya.loader.getRes(this.ApePath);
		originalApe.x = (Laya.stage.width - this.apeTexture.width * 3) / 2;
		originalApe.y = (Laya.stage.height - this.apeTexture.height) / 2;
	}

	private makeRedApe(): void {
		//由 20 个项目（排列成 4 x 5 矩阵）组成的数组，红色
		var redMat: any[] =
			[1, 0, 0, 0, 0, //R
				0, 0, 0, 0, 0, //G
				0, 0, 0, 0, 0, //B
				0, 0, 0, 1, 0];

		//创建一个颜色滤镜对象,红色
		var redFilter: ColorFilter = new ColorFilter(redMat);

		// 赤化猩猩
		var redApe: Sprite = this.createApe();
		redApe.filters = [redFilter];

		var firstChild: Sprite = (<Sprite>this.Main.box2D.getChildAt(0));
		redApe.x = firstChild.x + this.apeTexture.width;
		redApe.y = firstChild.y;
	}

	private grayingApe(): void {
		//由 20 个项目（排列成 4 x 5 矩阵）组成的数组，灰图
		var grayscaleMat: any[] = [0.3086, 0.6094, 0.0820, 0, 0,
			0.3086, 0.6094, 0.0820, 0, 0,
			0.3086, 0.6094, 0.0820, 0, 0,
			0, 0, 0, 1, 0];

		//创建一个颜色滤镜对象，灰图
		var grayscaleFilter: ColorFilter = new ColorFilter(grayscaleMat);

		// 灰度猩猩
		var grayApe: Sprite = this.createApe();
		grayApe.filters = [grayscaleFilter];

		var secondChild: Sprite = (<Sprite>this.Main.box2D.getChildAt(1));
		grayApe.x = secondChild.x + this.apeTexture.width;
		grayApe.y = secondChild.y;
	}

	private createApe(): Sprite {
		var ape: Sprite = new Sprite();
		ape.loadImage("res/apes/monkey2.png");
		this.Main.box2D.addChild(ape);

		return ape;
	}
}

