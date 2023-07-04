import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { ComboBox } from "laya/ui/ComboBox";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class UI_ComboBox {
	private skin: string = "res/ui/combobox.png";

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			Laya.loader.load(this.skin, Handler.create(this, this.onLoadComplete));
		});

	}

	private onLoadComplete(e: any = null): void {
		var cb: ComboBox = this.createComboBox(this.skin);
		cb.autoSize = true;
		cb.pos((Laya.stage.width - cb.width) / 2, 100);
		cb.autoSize = false;
	}

	private createComboBox(skin: string): ComboBox {
		var comboBox: ComboBox = new ComboBox(skin, "item0,item1,item2,item3,item4,item5");
		comboBox.labelSize = 30;
		comboBox.itemSize = 25;
		comboBox.selectHandler = new Handler(this, this.onSelect, [comboBox]);
		this.Main.box2D.addChild(comboBox);

		return comboBox;
	}

	private onSelect(cb: ComboBox, e: any = null): void {
		console.log("选中了： " + cb.selectedLabel);
	}
}

