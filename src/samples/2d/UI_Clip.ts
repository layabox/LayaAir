import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Clip } from "laya/ui/Clip";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class UI_Clip {
	private buttonSkin: string = "res/ui/button-7.png";
	private clipSkin: string = "res/ui/num0-9.png";
	private bgSkin: string = "res/ui/coutDown.png";

	private counter: Clip;
	private currFrame: number;
	private controller: Button;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;
		Laya.init(800, 600).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			Laya.loader.load([this.buttonSkin, this.clipSkin, this.bgSkin], Handler.create(this, this.onSkinLoaded));
		});

	}

	private onSkinLoaded(e: any = null): void {
		this.showBg();
		this.createTimerAnimation();
		this.showTotalSeconds();
		this.createController();
	}

	private showBg(): void {
		var bg: Image = new Image(this.bgSkin);
		bg.size(224, 302);
		bg.pos(Laya.stage.width - bg.width >> 1, Laya.stage.height - bg.height >> 1);
		this.Main.box2D.addChild(bg);
	}

	private createTimerAnimation(): void {
		this.counter = new Clip(this.clipSkin, 10, 1);
		this.counter.autoPlay = true;
		this.counter.interval = 1000;

		this.counter.x = (Laya.stage.width - this.counter.width) / 2 - 35;
		this.counter.y = (Laya.stage.height - this.counter.height) / 2 - 40;

		this.Main.box2D.addChild(this.counter);
	}

	private showTotalSeconds(): void {
		var clip: Clip = new Clip(this.clipSkin, 10, 1);
		clip.index = clip.clipX - 1;
		clip.pos(this.counter.x + 60, this.counter.y);
		this.Main.box2D.addChild(clip);
	}

	private createController(): void {
		this.controller = new Button(this.buttonSkin, "暂停");
		this.controller.labelBold = true;
		this.controller.labelColors = "#FFFFFF,#FFFFFF,#FFFFFF,#FFFFFF";
		this.controller.size(84, 30);

		this.controller.on('click', this, this.onClipSwitchState);

		this.controller.x = (Laya.stage.width - this.controller.width) / 2;
		this.controller.y = (Laya.stage.height - this.controller.height) / 2 + 110;
		this.Main.box2D.addChild(this.controller);
	}

	private onClipSwitchState(e: any = null): void {
		if (this.counter.isPlaying) {
			this.counter.stop();
			this.currFrame = this.counter.index;
			this.controller.label = "播放";
		}
		else {
			this.counter.play();
			this.counter.index = this.currFrame;
			this.controller.label = "暂停";
		}
	}
}

