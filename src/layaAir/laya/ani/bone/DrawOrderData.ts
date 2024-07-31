/**
 * @internal
 * @en The `DrawOrderData` class is used internally to manage the draw order data which determines the rendering order of the elements in an animation frame.
 * @zh `DrawOrderData` 类用于内部管理绘制顺序数据，该数据确定动画帧中元素的渲染顺序。
 */
export class DrawOrderData {
	/**
	 * @en The time at which the draw order is defined.
	 * @zh 定义绘制顺序的时间点。
	 */
	time: number;
	/**
	 * @en A list of indices representing the draw order of the slots at the given time.
	 * @zh 代表给定时间点插槽绘制顺序的索引列表。
	 */
	drawOrder: number[] = [];

	//TODO:coverage
	constructor() {
	}
}

