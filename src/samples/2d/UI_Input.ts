import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { TextInput } from "laya/ui/TextInput";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class UI_Input {
	private SPACING: number = 100;
	private INPUT_WIDTH: number = 300;
	private INPUT_HEIGHT: number = 50;
	private Y_OFFSET: number = 50;
	private skins: any[];

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.skins = ["res/ui/input (1).png", "res/ui/input (2).png", "res/ui/input (3).png", "res/ui/input (4).png"];
			Laya.loader.load(this.skins, Handler.create(this, this.onLoadComplete));//加载资源。
		});

	}

	private onLoadComplete(e: any = null): void {
		for (var i: number = 0; i < this.skins.length; ++i) {
			var input: TextInput = this.createInput(this.skins[i]);
			input.prompt = 'Type:';
			input.x = (Laya.stage.width - input.width) / 2;
			input.y = i * this.SPACING + this.Y_OFFSET;
		}
	}

	private createInput(skin: string): TextInput {
		var ti: TextInput = new TextInput();

		ti.skin = skin;
		ti.size(300, 50);
		ti.sizeGrid = "0,40,0,40";
		ti.font = "Arial";
		ti.fontSize = 30;
		ti.bold = true;
		ti.color = "#606368";

		this.Main.box2D.addChild(ti);

		return ti;
	}
}

