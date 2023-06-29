import { Laya } from "Laya";
import { Main } from "./../Main";
import { Animation } from "laya/display/Animation"
import { Stage } from "laya/display/Stage"
import { Rectangle } from "laya/maths/Rectangle"
import { Loader } from "laya/net/Loader"
import { Browser } from "laya/utils/Browser"
import { Handler } from "laya/utils/Handler"

export class Animation_Altas {
	private AniConfPath: string = "res/fighter/fighter.json";

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			Laya.loader.load(this.AniConfPath, Handler.create(this, this.createAnimation), null, Loader.ATLAS);
		});
	}

	private createAnimation(_e: any = null): void {
		var ani: Animation = new Animation();
		ani.loadAtlas(this.AniConfPath);			// 加载图集动画
		ani.interval = 30;					// 设置播放间隔（单位：毫秒）
		ani.index = 1;						// 当前播放索引
		ani.play();							// 播放图集动画

		// 获取动画的边界信息
		var bounds: Rectangle = ani.getGraphicBounds();
		ani.pivot(bounds.width / 2, bounds.height / 2);
		ani.pos(Laya.stage.width / 2, Laya.stage.height / 2);
		this.Main.box2D.addChild(ani);
	}

	private onMouseDown(ani: Animation): void {
		if (ani.index > ani.count) {
			ani.index = 0;
		} else {
			ani.index++;
		}
	}
}

