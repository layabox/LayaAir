import { Laya } from "Laya";
import { EventData } from "laya/ani/bone/EventData";
import { Skeleton } from "laya/ani/bone/Skeleton";
import { Templet } from "laya/ani/bone/Templet";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Tween } from "laya/tween/Tween";
import { Main } from "./../Main";

export class Skeleton_SpineEvent {

	private mStartX: number = 300;
	private mStartY: number = 340;
	private mActionIndex: number = 0;
	private mCurrIndex: number = 0;
	private mArmature: Skeleton;
	private mCurrSkinIndex: number = 0;

	private mLabelSprite: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.width, Browser.height).then(() => {
			Laya.stage.bgColor = "#ffffff";
			Stat.show();
			this.mLabelSprite = new Sprite();

			Laya.loader.load("res/spine/spineRes6/alien.sk").then((templet: Templet) => {
				//创建模式为1，可以启用换装
				this.mArmature = templet.buildArmature(1);
				this.mArmature.x = this.mStartX;
				this.mArmature.y = this.mStartY;
				this.mArmature.scale(0.5, 0.5);
				this.Main.box2D.addChild(this.mArmature);
				this.mArmature.on(Event.LABEL, this, this.onEvent);
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

	private onEvent(e: any): void {
		var tEventData: EventData = (<EventData>e);

		this.Main.box2D.addChild(this.mLabelSprite);
		this.mLabelSprite.x = this.mStartX;
		this.mLabelSprite.y = this.mStartY;
		this.mLabelSprite.graphics.clear();
		this.mLabelSprite.graphics.fillText(tEventData.name, 0, 0, "20px Arial", "#ff0000", "center");
		Tween.to(this.mLabelSprite, { "y": this.mStartY - 200 }, 1000, null, Handler.create(this, this.playEnd))
	}

	private playEnd(): void {
		this.mLabelSprite.removeSelf();
	}

	dispose(): void {
		if (this.mArmature == null)
			return;
		Tween.clearAll(this.mLabelSprite);
		this.mArmature.stop();
		this.mArmature.off(Event.STOPPED, this, this.completeHandler);
	}
}


