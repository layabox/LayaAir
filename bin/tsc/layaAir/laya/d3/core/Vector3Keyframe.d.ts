import { Keyframe } from "././Keyframe";
import { Vector3 } from "../math/Vector3";
/**
 * <code>Vector3Keyframe</code> 类用于创建三维向量关键帧实例。
 */
export declare class Vector3Keyframe extends Keyframe {
    inTangent: Vector3;
    outTangent: Vector3;
    value: Vector3;
    /**
     * 创建一个 <code>Vector3Keyframe</code> 实例。
     */
    constructor();
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(dest: any): void;
}
