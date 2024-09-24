import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";

/**
 * @en The `PixelLineData` class is used to represent line data.
 * @zh `PixelLineData` 类用于表示线数据。
 */
export class PixelLineData {
	/**
	 * @en The starting position of the line.
	 * @zh 线的起始位置。
	 */
	startPosition: Vector3 = new Vector3();

	/**
	 * @en The ending position of the line.
	 * @zh 线的结束位置。
	 */
	endPosition: Vector3 = new Vector3();

	/**
	 * @en The color at the start of the line.
	 * @zh 线的起始颜色。
	 */
	startColor: Color = new Color();

	/**
	 * @en The color at the end of the line.
	 * @zh 线的结束颜色。
	 */
	endColor: Color = new Color();

	/**
	 * @en Line start normal
	 * @zh 线开始法线
	 */
	startNormal:Vector3 = new Vector3();

	/**
	 * @en Line end normal
	 * @zh 线结束法线
	 */
	endNormal:Vector3 = new Vector3();

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: PixelLineData): void {
		this.startPosition.cloneTo(destObject.startPosition);
		this.endPosition.cloneTo(destObject.endPosition);
		this.startColor.cloneTo(destObject.startColor);
		this.endColor.cloneTo(destObject.endColor);
		this.startNormal.cloneTo(destObject.startPosition);
		this.endNormal.cloneTo(destObject.endPosition);
	}
}

