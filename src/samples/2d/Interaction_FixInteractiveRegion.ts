import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Interaction_FixInteractiveRegion {
	private logger: Text;

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

			this.setup();
		});
	}

	private setup(): void {
		this.buildWorld();
		this.createLogger();
	}

	private buildWorld(): void {
		this.createCoralRect();
		this.createDeepSkyblueRect();
		this.createDarkOrchidRect();

		// 设置舞台
		Laya.stage.name = "暗灰色舞台"
		Laya.stage.on(Event.MOUSE_DOWN, this, this.onDown);
	}

	private createCoralRect(): void {
		var coralRect: Sprite = new Sprite();
		coralRect.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height / 2, "#FF7F50");

		//设置名称
		coralRect.name = "珊瑚色容器";
		coralRect.size(Laya.stage.width, Laya.stage.height / 2);
		this.Main.box2D.addChild(coralRect);

		coralRect.on(Event.MOUSE_DOWN, this, this.onDown);
	}

	private createDeepSkyblueRect(): void {
		var deepSkyblueRect: Sprite = new Sprite();
		deepSkyblueRect.graphics.drawRect(0, 0, 100, 100, "#00BFFF");
		//设置名称
		deepSkyblueRect.name = "天蓝色矩形";
		//设置宽高（要接收鼠标事件必须设置宽高，否则不会被命中）  
		deepSkyblueRect.size(100, 100);
		deepSkyblueRect.pos(10, 10);
		this.Main.box2D.addChild(deepSkyblueRect);

		deepSkyblueRect.on(Event.MOUSE_DOWN, this, this.onDown);
	}

	private createDarkOrchidRect(): void {
		var darkOrchidRect: Sprite = new Sprite();
		darkOrchidRect.name = "暗紫色矩形容器";
		darkOrchidRect.graphics.drawRect(-100, -100, 200, 200, "#9932CC");

		darkOrchidRect.pos(Laya.stage.width / 2, Laya.stage.height / 2);
		this.Main.box2D.addChild(darkOrchidRect);

		// 为true时，碰撞区域会被修正为实际显示边界
		// mouseThrough命名真是具有强烈的误导性
		darkOrchidRect.mouseThrough = true;
		darkOrchidRect.on(Event.MOUSE_DOWN, this, this.onDown);
	}

	private createLogger(): void {
		this.logger = new Text();
		this.logger.size(Laya.stage.width, Laya.stage.height);
		this.logger.align = 'right';
		this.logger.fontSize = 20;
		this.logger.color = "#FFFFFF";
		this.Main.box2D.addChild(this.logger);
	}

	/**侦听处理方法*/
	private onDown(e: Event = null): void {
		this.logger.text += "点击 - " + e.target.name + "\n";
	}

	dispose(): void {
		Laya.stage.off(Event.MOUSE_DOWN, this, this.onDown);
	}
}

