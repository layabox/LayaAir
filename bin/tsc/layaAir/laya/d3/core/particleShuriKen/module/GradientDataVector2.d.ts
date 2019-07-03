import { IClone } from "../../IClone";
import { Vector2 } from "../../../math/Vector2";
/**
 * <code>GradientDataVector2</code> 类用于创建二维向量渐变。
 */
export declare class GradientDataVector2 implements IClone {
    private _currentLength;
    /**二维向量渐变数量。*/
    readonly gradientCount: number;
    /**
     * 创建一个 <code>GradientDataVector2</code> 实例。
     */
    constructor();
    /**
     * 增加二维向量渐变。
     * @param	key 生命周期，范围为0到1。
     * @param	value 二维向量值。
     */
    add(key: number, value: Vector2): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
