import { BaseShape } from "././BaseShape";
import { BoundBox } from "../../../../math/BoundBox";
import { Rand } from "../../../../math/Rand";
import { Vector2 } from "../../../../math/Vector2";
import { Vector3 } from "../../../../math/Vector3";
/**
 * <code>ConeShape</code> 类用于创建锥形粒子形状。
 */
export declare class ConeShape extends BaseShape {
    /** @private */
    protected static _tempPositionPoint: Vector2;
    /** @private */
    protected static _tempDirectionPoint: Vector2;
    /**发射角度。*/
    angle: number;
    /**发射器半径。*/
    radius: number;
    /**椎体长度。*/
    length: number;
    /**发射类型,0为Base,1为BaseShell,2为Volume,3为VolumeShell。*/
    emitType: number;
    /**
     * 创建一个 <code>ConeShape</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    protected _getShapeBoundBox(boundBox: BoundBox): void;
    /**
     * @inheritDoc
     */
    protected _getSpeedBoundBox(boundBox: BoundBox): void;
    /**
     *  用于生成粒子初始位置和方向。
     * @param	position 粒子位置。
     * @param	direction 粒子方向。
     */
    generatePositionAndDirection(position: Vector3, direction: Vector3, rand?: Rand, randomSeeds?: Uint32Array): void;
    cloneTo(destObject: any): void;
}
