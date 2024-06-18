import { Keyframe, WeightedMode } from "./Keyframe";
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
	/**内权重 */
	inWeight: number = Keyframe.defaultWeight;
	/**外权重 */
	outWeight: number = Keyframe.defaultWeight;
	/**权重模式 */
	weightedMode: number = WeightedMode.None;

	/**
	 * 创建一个 <code>FloatKeyFrame</code> 实例。
	 */
	constructor() {
		super();
	}

	/**
	 * 克隆数据
	 * @param destObject 拷贝数据结构
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destKeyFrame: FloatKeyframe = (<FloatKeyframe>destObject);
		destKeyFrame.inTangent = this.inTangent;
		destKeyFrame.outTangent = this.outTangent;
		destKeyFrame.value = this.value;
		destKeyFrame.inTangent = this.inTangent;
		destKeyFrame.outTangent = this.outTangent;
		destKeyFrame.value = this.value;
		destKeyFrame.inWeight = this.inWeight;
		destKeyFrame.outWeight = this.outWeight;
		destKeyFrame.weightedMode = this.weightedMode;
	}

	/**
	 * 克隆
	 * @returns 
	 */
	clone(): FloatKeyframe {
		let f = new FloatKeyframe();
		this.cloneTo(f);
		return f;
	}

}


