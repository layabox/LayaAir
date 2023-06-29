import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { HitArea } from "laya/utils/HitArea";
import { Main } from "./../Main";

export class Sprite_Guide {
	private red: Sprite;
	private guideContainer: Sprite;
	private tipContainer: Sprite;

	private guideSteps: any[] =
		[{ 'x': 151, 'y': 575, 'radius': 150, 'tip': "res/guide/help6.png", 'tipx': 200, 'tipy': 250 },
		{ 'x': 883, 'y': 620, 'radius': 100, 'tip': "res/guide/help4.png", 'tipx': 730, 'tipy': 380 },
		{ 'x': 1128, 'y': 583, 'radius': 110, 'tip': "res/guide/help3.png", 'tipx': 900, 'tipy': 300 }];
	private guideStep: number = 0;
	private hitArea: HitArea;
	private interactionArea: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(1285, 727).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.screenMode = Stage.SCREEN_HORIZONTAL;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;

			//绘制一个蓝色方块，不被抠图
			var gameContainer: Sprite = new Sprite();
			gameContainer.loadImage("res/guide/crazy_snowball.png");
			this.Main.box2D.addChild(gameContainer);

			// 引导所在容器
			this.guideContainer = new Sprite();
			// 设置容器为画布缓存
			this.guideContainer.cacheAs = "bitmap";
			this.Main.box2D.addChild(this.guideContainer);
			gameContainer.on("click", this, this.nextStep);

			//绘制遮罩区，含透明度，可见游戏背景
			var maskArea: Sprite = new Sprite();
			maskArea.alpha = 0.5;
			maskArea.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
			this.guideContainer.addChild(maskArea);

			//绘制一个圆形区域，利用叠加模式，从遮罩区域抠出可交互区
			this.interactionArea = new Sprite();
			//设置叠加模式
			this.interactionArea.blendMode = "destination-out";
			this.guideContainer.addChild(this.interactionArea);

			this.hitArea = new HitArea();
			this.hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");

			this.guideContainer.hitArea = this.hitArea;
			this.guideContainer.mouseEnabled = true;

			this.tipContainer = new Sprite();
			this.Main.box2D.addChild(this.tipContainer);

			this.nextStep();
		});
	}

	private nextStep(): void {
		if (this.guideStep == this.guideSteps.length) {
			this.Main.box2D.removeChild(this.guideContainer);
			this.Main.box2D.removeChild(this.tipContainer);
			return;
		}
		else {
			var step: any = this.guideSteps[this.guideStep++];

			this.hitArea.unHit.clear();
			this.hitArea.unHit.drawCircle(step.x, step.y, step.radius, "#000000");

			this.interactionArea.graphics.clear();
			this.interactionArea.graphics.drawCircle(step.x, step.y, step.radius, "#000000");

			this.tipContainer.graphics.clear();
			this.tipContainer.loadImage(step.tip);
			this.tipContainer.pos(step.tipx, step.tipy);
		}
	}
}

