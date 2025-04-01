/**
description
 实现字母弹性动画效果的文字展示程序，逐个字母从不同起始位置弹性滑动到指定位置
 */
import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Browser } from "laya/utils/Browser";
import { Ease } from "laya/tween/Ease";
import { Tween } from "laya/tween/Tween";
import { Main } from "./../Main";

export class Tween_Letters {

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			//
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			//
			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.setup();
		});
	}

	private setup(): void {
		var w: number = 400;
		var offset: number = Laya.stage.width - w >> 1;
		var endY: number = Laya.stage.height / 2 - 50;
		var demoString: string = "LayaBox";

		for (var i: number = 0, len: number = demoString.length; i < len; ++i) {
			var letterText: Text = this.createLetter(demoString.charAt(i));
			letterText.x = w / len * i + offset;

			Tween.to(letterText, { "y": endY }, 1000, Ease.elasticOut, null, i * 1000);
		}
	}

	private createLetter(char: string): Text {
		var letter: Text = new Text();
		letter.text = char;
		letter.color = "#FFFFFF";
		letter.font = "Impact";
		letter.fontSize = 110;
		this.Main.box2D.addChild(letter);

		return letter;
	}
}

