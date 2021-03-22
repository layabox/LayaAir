import { Keyframe } from "./Keyframe";
/**
	 * <code>FloatKeyFrame</code> 类用于创建浮点关键帧实例。
	 */
export class FloatKeyframe extends Keyframe {
	/**内切线 */
	inTangent: number;
	/**外切线 */
	outTangent: number;
	/**帧数据 */
	value: number;

	/**
	 * 创建一个 <code>FloatKeyFrame</code> 实例。
	 */
	constructor() {
		super();
	}

	/**
	 * 克隆数据
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destKeyFrame: FloatKeyframe = (<FloatKeyframe>destObject);
		destKeyFrame.inTangent = this.inTangent;
		destKeyFrame.outTangent = this.outTangent;
		destKeyFrame.value = this.value;
	}

}


