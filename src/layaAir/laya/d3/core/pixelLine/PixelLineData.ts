import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";

/**
 * <code>PixelLineData</code> 类用于表示线数据。
 */
export class PixelLineData {
	/**线开始位置 */
	startPosition: Vector3 = new Vector3();
	/**线结束位置 */
	endPosition: Vector3 = new Vector3();
	/**线开始颜色 */
	startColor: Color = new Color();
	/**线结束颜色 */
	endColor: Color = new Color();
	/**线开始法线 */
	startNormal:Vector3 = new Vector3();
	/**线结束法线 */
	endNormal:Vector3 = new Vector3();

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
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

