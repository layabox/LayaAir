import { Keyframe } from "./Keyframe";
import { Vector3 } from "../math/Vector3";
/**
 * <code>Vector3Keyframe</code> 类用于创建三维向量关键帧实例。
 */
export class Vector3Keyframe extends Keyframe {
    /**
     * 创建一个 <code>Vector3Keyframe</code> 实例。
     */
    constructor() {
        super();
        this.inTangent = new Vector3();
        this.outTangent = new Vector3();
        this.value = new Vector3();
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
