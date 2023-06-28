import { Laya } from "Laya";
import { Animation } from "laya/display/Animation";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Tween } from "laya/utils/Tween";
import { Main } from "./../Main";

export class BlendMode_Lighter {
	// 一只凤凰的分辨率是550 * 400
	private phoenixWidth: number = 750;
	private phoenixHeight: number = 550;

	private bgColorTweener: Tween = new Tween();
	private gradientInterval: number = 2000;
	private bgColorChannels: any = { 'r': 99, 'g': 0, 'b': 0xFF };

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(this.phoenixWidth * 2, this.phoenixHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.setup();
		});

	}

	private setup(): void {
		this.createPhoenixes();

		// 动态背景渲染
		this.evalBgColor();
		Laya.timer.frameLoop(1, this, this.renderBg);
	}

	private createPhoenixes(): void {
		var scaleFactor: number = Math.min(
			Laya.stage.width / (this.phoenixWidth * 2),
			Laya.stage.height / this.phoenixHeight);

		// 加了混合模式的凤凰
		this.blendedPhoenix = this.createAnimation();
		this.blendedPhoenix.blendMode = "lighter";
		this.blendedPhoenix.scale(scaleFactor, scaleFactor);
		this.blendedPhoenix.y = (Laya.stage.height - this.phoenixHeight * scaleFactor) / 2;

		// 正常模式的凤凰
		this.normalPhoenix = this.createAnimation();
		this.normalPhoenix.scale(scaleFactor, scaleFactor);
		this.normalPhoenix.x = this.phoenixWidth * scaleFactor;
		this.normalPhoenix.y = (Laya.stage.height - this.phoenixHeight * scaleFactor) / 2;
	}

	normalPhoenix: Animation;
	blendedPhoenix: Animation;
	private createAnimation(): Animation {
		var frames: any[] = [];
		for (var i: number = 1; i <= 25; ++i) {
			frames.push("res/phoenix/phoenix" + this.preFixNumber(i, 4) + ".jpg");
		}

		var animation: Animation = new Animation();
		animation.loadImages(frames);
		this.Main.box2D.addChild(animation);

		var clips: any[] = animation.frames.concat();
		// 反转帧
		clips = clips.reverse();
		// 添加到已有帧末尾
		animation.frames = animation.frames.concat(clips);

		animation.play();

		return animation;
	}
	private preFixNumber(num: number, strLen: number): string {
		return ("0000000000" + num).slice(-strLen);
	}

	private evalBgColor(): void {
		var color: number = Math.random() * 0xFFFFFF;
		var channels: any[] = this.getColorChannals(color);
		this.bgColorTweener.to(this.bgColorChannels, { "r": channels[0], "g": channels[1], "b": channels[2] }, this.gradientInterval, null, Handler.create(this, this.onTweenComplete));
	}

	private getColorChannals(color: number): any[] {
		var result: any[] = [];
		result.push(color >> 16);
		result.push(color >> 8 & 0xFF);
		result.push(color & 0xFF);
		return result;
	}

	private onTweenComplete(): void {
		this.evalBgColor();
	}

	private renderBg(): void {
		this.Main.box2D.graphics.clear();
		this.Main.box2D.graphics.drawRect(
			this.blendedPhoenix.x, this.blendedPhoenix.y,
			this.phoenixWidth, this.phoenixHeight, this.getHexColorString());
	}

	private getHexColorString(): string {
		this.bgColorChannels.r = Math.floor(this.bgColorChannels.r);
		// 绿色通道使用0
		this.bgColorChannels.g = 0;
		//obj.g = Math.floor(obj.g);
		this.bgColorChannels.b = Math.floor(this.bgColorChannels.b);

		var r: string = this.bgColorChannels.r.toString(16);
		r = r.length == 2 ? r : "0" + r;
		var g: string = this.bgColorChannels.g.toString(16);
		g = g.length == 2 ? g : "0" + g;
		var b: string = this.bgColorChannels.b.toString(16);
		b = b.length == 2 ? b : "0" + b;
		return "#" + r + g + b;
	}

	dispose(): void {
		if (this.blendedPhoenix == null)
			return;
		if (this.normalPhoenix == null)
			return;
		this.bgColorTweener.clear();
		this.normalPhoenix.stop();
		this.blendedPhoenix.stop();
		Laya.timer.clear(this, this.renderBg);
		this.Main.box2D.graphics.clear();
	}
}

