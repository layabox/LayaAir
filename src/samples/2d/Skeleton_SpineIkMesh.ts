import { Laya } from "Laya";
import { Skeleton } from "laya/ani/bone/Skeleton";
import { Templet } from "laya/ani/bone/Templet";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Main } from "./../Main";

export class Skeleton_SpineIkMesh {

	private mStartX: number = 180;
	private mStartY: number = 340;
	private mActionIndex: number = 0;
	private mCurrIndex: number = 0;
	private mArmature: Skeleton;
	private mCurrSkinIndex: number = 0;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.width, Browser.height).then(() => {
			Laya.stage.bgColor = "#ffffff";
			Stat.show();

			Laya.loader.load("res/spine/spineRes3/raptor.sk").then((templet: Templet) => {
				//创建模式为1，可以启用换装
				this.mArmature = templet.buildArmature(1);
				this.mArmature.x = this.mStartX;
				this.mArmature.y = this.mStartY;
				this.mArmature.scale(0.3, 0.3);
				this.Main.box2D.addChild(this.mArmature);
				this.mArmature.on(Event.STOPPED, this, this.completeHandler);
				this.play();
			});
		});
	}

	private completeHandler(): void {
		this.play();
	}

	private play(): void {
		this.mCurrIndex++;
		if (this.mCurrIndex >= this.mArmature.getAnimNum()) {
			this.mCurrIndex = 0;
		}
		this.mArmature.play(this.mCurrIndex, false);
	}
	dispose(): void {
		if (this.mArmature == null)
			return;
		this.mArmature.stop();
		this.mArmature.off(Event.STOPPED, this, this.completeHandler);
	}
}


