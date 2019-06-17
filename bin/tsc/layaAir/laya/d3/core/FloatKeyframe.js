import { Keyframe } from "././Keyframe";
/**
     * <code>FloatKeyFrame</code> 类用于创建浮点关键帧实例。
     */
export class FloatKeyframe extends Keyframe {
    /**
     * 创建一个 <code>FloatKeyFrame</code> 实例。
     */
    constructor() {
        super();
    }
    /**
     * @inheritDoc
     */
    /*override*/ cloneTo(destObject) {
        super.cloneTo(destObject);
        var destKeyFrame = destObject;
        destKeyFrame.inTangent = this.inTangent;
        destKeyFrame.outTangent = this.outTangent;
        destKeyFrame.value = this.value;
    }
}
