import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

/**
 * ...
 * @author Survivor
 */
export class PIXI_Example_04 {
	private starCount: number = 2500;
	private sx: number = 1.0 + (Math.random() / 20);
	private sy: number = 1.0 + (Math.random() / 20);
	private stars: any[] = [];
	private w: number = Browser.width;
	private h: number = Browser.height;
	private slideX: number = this.w / 2;
	private slideY: number = this.h / 2;

	private speedInfo: Text;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(this.w, this.h).then(() => {
			this.createText();
			this.start();
		});
	}

	private start(): void {
		for (var i: number = 0; i < this.starCount; i++) {
			var tempBall: Sprite = new Sprite();
			tempBall.loadImage("res/pixi/bubble_32x32.png");

			tempBall.x = (Math.random() * this.w) - this.slideX;
			tempBall.y = (Math.random() * this.h) - this.slideY;
			tempBall.pivot(16, 16);

			this.stars.push({ "sprite": tempBall, "x": tempBall.x, "y": tempBall.y });

			this.Main.box2D.addChild(tempBall);
		}

		Laya.stage.on('click', this, this.newWave);
		this.speedInfo.text = 'SX: ' + this.sx + '\nSY: ' + this.sy;

		this.resize();

		Laya.timer.frameLoop(1, this, this.update);
	}

	private createText(): void {
		this.speedInfo = new Text();
		this.speedInfo.color = "#FFFFFF";
		this.speedInfo.pos(this.w - 160, 20);
		this.speedInfo.zOrder = 1;
		this.Main.box2D.addChild(this.speedInfo);
	}

	private newWave(): void {
		this.sx = 1.0 + (Math.random() / 20);
		this.sy = 1.0 + (Math.random() / 20);
		this.speedInfo.text = 'SX: ' + this.sx + '\nSY: ' + this.sy;
	}

	private resize(): void {
		this.w = Laya.stage.width;
		this.h = Laya.stage.height;

		this.slideX = this.w / 2;
		this.slideY = this.h / 2;
	}

	private update(): void {
		for (var i: number = 0; i < this.starCount; i++) {
			this.stars[i].sprite.x = this.stars[i].x + this.slideX;
			this.stars[i].sprite.y = this.stars[i].y + this.slideY;
			this.stars[i].x = this.stars[i].x * this.sx;
			this.stars[i].y = this.stars[i].y * this.sy;

			if (this.stars[i].x > this.w) {
				this.stars[i].x = this.stars[i].x - this.w;
			}
			else if (this.stars[i].x < -this.w) {
				this.stars[i].x = this.stars[i].x + this.w;
			}

			if (this.stars[i].y > this.h) {
				this.stars[i].y = this.stars[i].y - this.h;
			}
			else if (this.stars[i].y < -this.h) {
				this.stars[i].y = this.stars[i].y + this.h;
			}
		}
	}

}


