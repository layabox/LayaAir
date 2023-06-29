import { Laya } from "Laya";
import { Shake } from "laya/device/Shake";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";
/**
 * ...
 * @author Survivor
 */
export class InputDevice_Shake {
	private picW: number = 824;
	private picH: number = 484;
	private console: Text;

	private shakeCount: number = 0;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(this.picW, Browser.height * this.picW / Browser.width).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;

			this.showShakePic();
			this.showConsoleText();
			this.startShake();
		});
	}

	private showShakePic(): void {
		var shakePic: Sprite = new Sprite();
		shakePic.loadImage("res/inputDevice/shake.png");
		this.Main.box2D.addChild(shakePic);
	}

	private showConsoleText(): void {
		this.console = new Text();
		this.Main.box2D.addChild(this.console);

		this.console.y = this.picH + 10;
		this.console.width = Laya.stage.width;
		this.console.height = Laya.stage.height - this.console.y;
		this.console.color = "#FFFFFF";
		this.console.fontSize = 50;
		this.console.align = "center";
		this.console.valign = 'middle';
		this.console.leading = 10;
	}

	private startShake(): void {
		Shake.instance.start(5, 500);
		Shake.instance.on(Event.CHANGE, this, this.onShake);

		this.console.text = '开始接收设备摇动\n';
	}

	private onShake(): void {
		this.shakeCount++;

		this.console.text += "设备摇晃了" + this.shakeCount + "次\n";

		if (this.shakeCount >= 3) {
			Shake.instance.stop();

			this.console.text += "停止接收设备摇动";
		}
	}
}

