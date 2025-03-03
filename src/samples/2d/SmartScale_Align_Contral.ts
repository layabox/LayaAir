/**
description
 智能缩放与舞台居中对齐控制类，初始化舞台并设置水平垂直居中
 */
import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Main } from "../Main";

export class SmartScale_Align_Contral {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(100, 100).then(() => {
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;

			Laya.stage.bgColor = "#232628";
		});
	}
}

