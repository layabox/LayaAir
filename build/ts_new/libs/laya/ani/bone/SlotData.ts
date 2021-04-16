import { SkinSlotDisplayData } from "./SkinSlotDisplayData";
export class SlotData {
	name: string;
	displayArr: any[] = [];

	/**
	 * 通过附件名称获取位置
	 * @param name 
	 */
	getDisplayByName(name: string): number {
		var tDisplay: SkinSlotDisplayData;
		for (var i: number = 0, n: number = this.displayArr.length; i < n; i++) {
			tDisplay = this.displayArr[i];
			if (tDisplay.attachmentName == name) {
				return i;
			}
		}
		return -1;
	}
}


