import { Keyframe } from "./Keyframe";
/**
     * <code>FloatKeyFrame</code> 类用于创建浮点关键帧实例。
     */
export declare class FloatKeyframe extends Keyframe {
    inTangent: number;
    outTangent: number;
    value: number;
    /**
     * 创建一个 <code>FloatKeyFrame</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    cloneTo(destObject: any): void;
}
