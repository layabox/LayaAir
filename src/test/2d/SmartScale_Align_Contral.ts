import { Laya } from "./Laya";
import { Stage } from "../laya/display/Stage"

	export class SmartScale_Align_Contral
	{
		constructor(){
//			Laya.init(100, 100);
			Laya.stage.scaleMode = Stage.SCALE_NOSCALE;
			
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;

			Laya.stage.bgColor = "#232628";
		}
	}

