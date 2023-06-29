import { Laya } from "Laya";
import { Main } from "./../Main";
import { Stage } from "laya/display/Stage"
import { Handler } from "laya/utils/Handler";
import { RadioGroup } from "laya/ui/RadioGroup";

export class UI_RadioGroup {
	private SPACING: number = 150;
	private X_OFFSET: number = 200;
	private Y_OFFSET: number = 80;

	private skins: any[];

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.skins = ["res/ui/radioButton (1).png", "res/ui/radioButton (2).png", "res/ui/radioButton (3).png"];
			Laya.loader.load(this.skins, Handler.create(this, this.initRadioGroups));
		});
	}

	private initRadioGroups(e: any = null): void {
		for (var i: number = 0; i < this.skins.length; ++i) {
			var rg: RadioGroup = this.createRadioGroup(this.skins[i]);
			rg.selectedIndex = i;
			rg.x = i * this.SPACING + this.X_OFFSET;
			rg.y = this.Y_OFFSET;
		}
	}

	private createRadioGroup(skin: string): RadioGroup {
		var rg: RadioGroup = new RadioGroup();
		rg.skin = skin;

		rg.space = 70;
		rg.direction = "v";

		rg.labels = "Item1, Item2, Item3";
		rg.labelColors = "#787878,#d3d3d3,#FFFFFF";
		rg.labelSize = 20;
		rg.labelBold = true;
		rg.labelPadding = "5,0,0,5";

		rg.selectHandler = new Handler(this, this.onSelectChange);
		this.Main.box2D.addChild(rg);

		return rg;
	}

	private onSelectChange(index: number): void {
		console.log("你选择了第 " + (index + 1) + " 项");
	}
}

