import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { SoundManager } from "laya/media/SoundManager";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class Sound_SimpleDemo {
	//声明一个信息文本
	private txtInfo: Text;
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.setup();
		});

	}

	private setup(): void {
		var gap: number = 10;

		//创建一个Sprite充当音效播放按钮
		var soundButton: Sprite = this.createButton("播放音效");
		soundButton.x = (Laya.stage.width - soundButton.width * 2 + gap) / 2;
		soundButton.y = (Laya.stage.height - soundButton.height) / 2;
		this.Main.box2D.addChild(soundButton);

		//创建一个Sprite充当音乐播放按钮
		var musicButton: Sprite = this.createButton("播放音乐");
		musicButton.x = soundButton.x + gap + soundButton.width;
		musicButton.y = soundButton.y;
		this.Main.box2D.addChild(musicButton);

		soundButton.on(Event.CLICK, this, this.onPlaySound);
		musicButton.on(Event.CLICK, this, this.onPlayMusic);
	}

	private createButton(label: string): Sprite {
		var w: number = 110;
		var h: number = 40;

		var button: Sprite = new Sprite();
		button.size(w, h);
		button.graphics.drawRect(0, 0, w, h, "#FF7F50");
		button.graphics.fillText(label, w / 2, 8, "25px SimHei", "#FFFFFF", "center");
		this.Main.box2D.addChild(button);
		return button;
	}

	private onPlayMusic(e: Event = null): void {
		console.log("播放音乐");
		//			SoundManager.stopAllSound();
		SoundManager.playMusic("res/sounds/bgm.mp3", 1, new Handler(this, this.onComplete));
	}

	private onPlaySound(e: Event = null): void {
		console.log("播放音效");
		//			SoundManager.stopMusic();
		SoundManager.playSound("res/sounds/btn.mp3", 1, new Handler(this, this.onComplete));
	}

	private onComplete(): void {
		console.log("播放完成");
	}

	dispose(): void {
		SoundManager.stopAllSound();
		SoundManager.stopMusic();
	}
}

