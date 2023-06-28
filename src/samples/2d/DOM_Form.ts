import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Render } from "laya/renders/Render";
import { Browser } from "laya/utils/Browser";
import { SpriteUtils } from "laya/utils/SpriteUtils";
import { Main } from "./../Main";

/**
 * ...
 * @author
 */
export class DOM_Form {
	private form: Sprite;
	private rowHeight: number = 30;
	private rowSpacing: number = 10;

	Main: typeof Main = null;
	emailInput: any;
	birthdayInput: any;
	passwordInput: any;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(600, 400).then(() => {
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.screenMode = Stage.SCREEN_HORIZONTAL;

			this.form = new Sprite();
			this.form.size(250, 120);
			this.form.pos((Laya.stage.width - this.form.width) / 2, (Laya.stage.height - this.form.height) / 2);
			this.Main.box2D.addChild(this.form);

			var rowHeightDelta = this.rowSpacing + this.rowHeight;

			// 显示左侧标签
			this.showLabel("邮箱", 0, rowHeightDelta * 0);
			this.showLabel("出生日期", 0, rowHeightDelta * 1);
			this.showLabel("密码", 0, rowHeightDelta * 2);

			// 显示右侧输入框
			this.emailInput = this.createInputElement();
			this.birthdayInput = this.createInputElement();
			this.passwordInput = this.createInputElement();

			this.birthdayInput.type = "date";
			this.passwordInput.type = "password";

			Laya.stage.on(Event.RESIZE, this, this.fitDOMElements, [this.emailInput, this.birthdayInput, this.passwordInput]);
		});
	}

	private showLabel(label: string, x: number, y: number): void {
		var t: Text = new Text();
		t.height = this.rowHeight;
		t.valign = "middle";
		t.fontSize = 15;
		t.font = "SimHei";
		t.text = label;
		t.pos(x, y);
		this.form.addChild(t);
	}

	private createInputElement(): any {
		var input: any = Browser.createElement("input");
		input.style.zIndex = Render.canvas.zIndex + 1;
		input.style.width = "100px";
		Browser.document.body.appendChild(input);
		return input;
	}

	private fitDOMElements(): void {
		var dom: any;
		for (var i = 0; i < arguments.length; i++) {
			dom = arguments[i];
			SpriteUtils.fitDOMElementInArea(dom, this.form, 100, i * (this.rowSpacing + this.rowHeight), 150, this.rowHeight);
		}
	}

	dispose(): void {
		Browser.document.body.removeChild(this.emailInput);
		Browser.document.body.removeChild(this.birthdayInput);
		Browser.document.body.removeChild(this.passwordInput);
		this.emailInput = null;
		this.birthdayInput = null;
		this.passwordInput = null;
	}
}


