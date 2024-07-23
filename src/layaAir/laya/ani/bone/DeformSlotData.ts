import { DeformSlotDisplayData } from "./DeformSlotDisplayData";
/**
 * @internal
 * @en Deformation slot data class
 * Used to store and manage deformation data for a single slot.
 * @zh 变形插槽数据类
 * 用于存储和管理单个插槽的变形数据
 */
export class DeformSlotData {

	/**
	 * @en Deformation slot display data list
	 * Contains deformation data for the slot in different display states.
	 * @zh 变形插槽显示数据列表
	 * 包含了插槽在不同显示状态下的变形数据
	 */
	deformSlotDisplayList: DeformSlotDisplayData[] = [];

	//TODO:coverage
	constructor() {

	}

}


