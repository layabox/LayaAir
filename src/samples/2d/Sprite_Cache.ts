import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Stat } from "laya/utils/Stat";
import { Main } from "./../Main";

export class Sprite_Cache {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			Stat.show();

			this.setup();
		});

	}

	private setup(): void {
		var textBox: Sprite = new Sprite();

		// 随机摆放文本
		var text: Text;
		for (var i: number = 0; i < 1000; i++) {
			text = new Text();
			text.fontSize = 20;
			text.text = (Math.random() * 100).toFixed(0);
			text.rotation = Math.random() * 360;
			text.color = "#CCCCCC";

			text.x = Math.random() * Laya.stage.width;
			text.y = Math.random() * Laya.stage.height;

			textBox.addChild(text);
		}

		//缓存为静态图像
		//			textBox.cacheAsBitmap = true;

		this.Main.box2D.addChild(textBox);
	}
}

