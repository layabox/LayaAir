import { SkinSlotDisplayData } from "./SkinSlotDisplayData";
export class SlotData {
	name: string;
	displayArr: any[] = [];

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


