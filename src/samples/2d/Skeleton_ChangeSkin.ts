import { Laya } from "Laya";
import { Skeleton } from "laya/ani/bone/Skeleton";
import { Templet } from "laya/ani/bone/Templet";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Main } from "./../Main";

export class Skeleton_ChangeSkin {

	private mStartX: number = 300;
	private mStartY: number = 350;
	private mActionIndex: number = 0;
	private mCurrIndex: number = 0;
	private mArmature: Skeleton;
	private mCurrSkinIndex: number = 0;
	private mSkinList: any[] = ["goblin", "goblingirl"];

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.width, Browser.height).then(() => {
			Laya.stage.bgColor = "#ffffff";
			Stat.show();

			Laya.loader.load("res/spine/spineRes2/goblins.sk").then((templet: Templet) => {
				//创建模式为1，可以启用换装
				this.mArmature = templet.buildArmature(1);
				this.mArmature.x = this.mStartX;
				this.mArmature.y = this.mStartY;
				this.mArmature.scale(0.8, 0.8);
				this.Main.box2D.addChild(this.mArmature);
				this.mArmature.on(Event.STOPPED, this, this.completeHandler);
				this.play();
				this.changeSkin();
				Laya.timer.loop(1000, this, this.changeSkin);
			});
		});
	}

	private changeSkin(): void {
		this.mCurrSkinIndex++;
		if (this.mCurrSkinIndex >= this.mSkinList.length) {
			this.mCurrSkinIndex = 0;
		}
		this.mArmature.showSkinByName(this.mSkinList[this.mCurrSkinIndex]);
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
		Laya.timer.clear(this, this.changeSkin);
		this.mArmature.off(Event.STOPPED, this, this.completeHandler);
	}
}

