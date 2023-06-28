import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

export class Interaction_Keyboard {
	private logger: Text;
	private keyDownList: any[];

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(()=>{
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
	
			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";
	
			this.setup();
		});

	}

	private setup(): void {
		this.listenKeyboard();
		this.createLogger();

		Laya.timer.frameLoop(1, this, this.keyboardInspector);
	}

	private listenKeyboard(): void {
		this.keyDownList = [];

		//添加键盘按下事件,一直按着某按键则会不断触发
		Laya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
		//添加键盘抬起事件
		Laya.stage.on(Event.KEY_UP, this, this.onKeyUp);
	}

	/**键盘按下处理*/
	private onKeyDown(e: any = null): void {
		this.keyDownList[e["keyCode"]] = true;
	}

	/**键盘抬起处理*/
	private onKeyUp(e: any = null): void {
		delete this.keyDownList[e["keyCode"]];
	}

	private keyboardInspector(e: any = null): void {
		var numKeyDown: number = this.keyDownList.length;

		var newText: string = '[ ';
		for (var i: number = 0; i < numKeyDown; i++) {
			if (this.keyDownList[i]) {
				newText += i + " ";
			}
		}
		newText += ']';

		this.logger.changeText(newText);
	}

	/**添加提示文本*/
	private createLogger(): void {
		this.logger = new Text();

		this.logger.size(Laya.stage.width, Laya.stage.height);
		this.logger.fontSize = 30;
		this.logger.font = "SimHei";
		this.logger.wordWrap = true;
		this.logger.color = "#FFFFFF";
		this.logger.align = 'center';
		this.logger.valign = 'middle';

		this.Main.box2D.addChild(this.logger);
	}
}

