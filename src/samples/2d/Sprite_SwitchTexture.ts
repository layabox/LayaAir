import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class Sprite_SwitchTexture {
	private texture1: string = "res/apes/monkey2.png";
	private texture2: string = "res/apes/monkey3.png";
	private flag: boolean = false;

	private ape: Sprite;

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

			Laya.loader.load([this.texture1, this.texture2], Handler.create(this, this.onAssetsLoaded));
		});
	}

	private onAssetsLoaded(e: any = null): void {
		this.ape = new Sprite();
		this.Main.box2D.addChild(this.ape);
		this.ape.pivot(55, 72);
		this.ape.pos(Laya.stage.width / 2, Laya.stage.height / 2);

		// 显示默认纹理
		this.switchTexture();

		this.ape.on("click", this, this.switchTexture);
	}

	private switchTexture(e: any = null): void {
		var textureUrl: string = (this.flag = !this.flag) ? this.texture1 :
			this.texture2;

		// 更换纹理
		this.ape.graphics.clear();
		var texture: Texture = Laya.loader.getRes(textureUrl);
		this.ape.graphics.drawTexture(texture, 0, 0);

		// 设置交互区域
		this.ape.size(texture.width, texture.height);
	}
}

