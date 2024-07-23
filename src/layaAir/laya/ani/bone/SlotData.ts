import { SkinSlotDisplayData } from "./SkinSlotDisplayData";
/**
 * Represents the data of a slot, which includes the slot's name and an array of display data.
 * @zh 表示插槽的数据，包括插槽名称和显示数据数组。
 */
export class SlotData {
	/**
	* @en The name of the slot.
	* @zh 插槽的名称。
	*/
	name: string;
	/**
	 * @en An array of display data that this slot contains.
	 * @zh 此插槽包含的显示数据数组。
	 */
	displayArr: any[] = [];

	/**
	 * @en Get the index of the display data by attachment name.
	 * @param name The name of the attachment to search for.
	 * @zh 通过附件名称获取显示数据的位置。
	 * @param name 附件名称。
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


