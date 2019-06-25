import { Keyframe } from "././Keyframe";
import { Quaternion } from "../math/Quaternion";
import { Vector4 } from "../math/Vector4";
/**
 * <code>QuaternionKeyframe</code> 类用于创建四元数关键帧实例。
 */
export class QuaternionKeyframe extends Keyframe {
    /**
     * 创建一个 <code>QuaternionKeyframe</code> 实例。
     */
    constructor() {
        super();
        this.inTangent = new Vector4();
        this.outTangent = new Vector4();
        this.value = new Quaternion();
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    /*override*/ cloneTo(dest) {
        super.cloneTo(dest);
        var destKeyFarme = dest;
        this.inTangent.cloneTo(destKeyFarme.inTangent);
        this.outTangent.cloneTo(destKeyFarme.outTangent);
        this.value.cloneTo(destKeyFarme.value);
    }
}
