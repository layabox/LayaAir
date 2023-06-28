import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Main } from "./../Main";

export class Text_Scroll {
	private txt: Text;
	private prevX: number = 0;
	private prevY: number = 0;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Stat.show();

			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.createText();
		});
	}

	private createText(): void {
		this.txt = new Text();
		this.txt.overflow = Text.SCROLL;
		this.txt.text =
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！";

		this.txt.size(200, 100);
		this.txt.x = Laya.stage.width - this.txt.width >> 1;
		this.txt.y = Laya.stage.height - this.txt.height >> 1;

		this.txt.borderColor = "#FFFF00";

		this.txt.fontSize = 20;
		this.txt.color = "#ffffff";

		this.Main.box2D.addChild(this.txt);

		this.txt.on(Event.MOUSE_DOWN, this, this.startScrollText);
	}

	/* 开始滚动文本 */
	private startScrollText(e: Event): void {
		this.prevX = this.txt.mouseX;
		this.prevY = this.txt.mouseY;

		Laya.stage.on(Event.MOUSE_MOVE, this, this.scrollText);
		Laya.stage.on(Event.MOUSE_UP, this, this.finishScrollText);
	}

	/* 停止滚动文本 */
	private finishScrollText(e: Event): void {
		Laya.stage.off(Event.MOUSE_MOVE, this, this.scrollText);
		Laya.stage.off(Event.MOUSE_UP, this, this.finishScrollText);
	}

	/* 鼠标滚动文本 */
	private scrollText(e: Event): void {
		var nowX: number = this.txt.mouseX;
		var nowY: number = this.txt.mouseY;

		this.txt.scrollX += this.prevX - nowX;
		this.txt.scrollY += this.prevY - nowY;

		this.prevX = nowX;
		this.prevY = nowY;
	}
}

