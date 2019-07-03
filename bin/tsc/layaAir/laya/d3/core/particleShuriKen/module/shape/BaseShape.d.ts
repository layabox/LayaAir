import { IClone } from "../../../IClone";
import { Rand } from "../../../../math/Rand";
import { Vector3 } from "../../../../math/Vector3";
/**
 * <code>BaseShape</code> 类用于粒子形状。
 */
export declare class BaseShape implements IClone {
    /**是否启用。*/
    enable: boolean;
    /**随机方向。*/
    randomDirection: boolean;
    /**
     * 创建一个 <code>BaseShape</code> 实例。
     */
    constructor();
    /**
     * 用于生成粒子初始位置和方向。
     * @param	position 粒子位置。
     * @param	direction 粒子方向。
     */
    generatePositionAndDirection(position: Vector3, direction: Vector3, rand?: Rand, randomSeeds?: Uint32Array): void;
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
