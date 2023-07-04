import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Dialog } from "laya/ui/Dialog";
import { Image } from "laya/ui/Image";
import { Handler } from "laya/utils/Handler";

export class UI_Dialog {
	private DIALOG_WIDTH: number = 220;
	private DIALOG_HEIGHT: number = 275;
	private CLOSE_BTN_WIDTH: number = 43;
	private CLOSE_BTN_PADDING: number = 5;

	private assets: any[];

	constructor() {
		Laya.init(800, 600).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.assets = ["res/ui/dialog (1).png", "res/ui/close.png"];
			Laya.loader.load(this.assets, Handler.create(this, this.onSkinLoadComplete));
		});

	}

	dialog: Dialog;
	private onSkinLoadComplete(e: any = null): void {
		this.dialog = new Dialog();

		var bg: Image = new Image(this.assets[0]);
		this.dialog.addChild(bg);

		var button: Button = new Button(this.assets[1]);
		button.name = Dialog.CLOSE;
		button.pos(this.DIALOG_WIDTH - this.CLOSE_BTN_WIDTH - this.CLOSE_BTN_PADDING, this.CLOSE_BTN_PADDING);
		this.dialog.addChild(button);

		this.dialog.dragArea = "0,0," + this.DIALOG_WIDTH + "," + this.DIALOG_HEIGHT;
		this.dialog.show();
	}

	dispose(): void {
		if (this.dialog) {
			this.dialog.close();
		}
	}
}

