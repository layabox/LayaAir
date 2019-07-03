import { Keyframe } from "./Keyframe";
import { Quaternion } from "../math/Quaternion";
import { Vector4 } from "../math/Vector4";
/**
 * <code>QuaternionKeyframe</code> 类用于创建四元数关键帧实例。
 */
export declare class QuaternionKeyframe extends Keyframe {
    inTangent: Vector4;
    outTangent: Vector4;
    value: Quaternion;
    /**
     * 创建一个 <code>QuaternionKeyframe</code> 实例。
     */
    constructor();
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(dest: any): void;
}
