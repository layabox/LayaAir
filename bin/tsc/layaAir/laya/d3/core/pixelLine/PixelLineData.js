import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
/**
 * <code>PixelLineData</code> 类用于表示线数据。
 */
export class PixelLineData {
    constructor() {
        this.startPosition = new Vector3();
        this.endPosition = new Vector3();
        this.startColor = new Color();
        this.endColor = new Color();
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        this.startPosition.cloneTo(destObject.startPosition);
        this.endPosition.cloneTo(destObject.endPosition);
        this.startColor.cloneTo(destObject.startColor);
        this.endColor.cloneTo(destObject.endColor);
    }
}
