import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
/**
 * <code>PixelLineData</code> 类用于表示线数据。
 */
export declare class PixelLineData {
    startPosition: Vector3;
    endPosition: Vector3;
    startColor: Color;
    endColor: Color;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: PixelLineData): void;
}
