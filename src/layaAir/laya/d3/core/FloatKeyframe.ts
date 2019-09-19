import { Keyframe } from "./Keyframe";
/**
	 * <code>FloatKeyFrame</code> 类用于创建浮点关键帧实例。
	 */
export class FloatKeyframe extends Keyframe {
	inTangent: number;
	outTangent: number;
	value: number;

	/**
	 * 创建一个 <code>FloatKeyFrame</code> 实例。
	 */
	constructor() {
		super();
	}

	/**
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

// native
if ((window as any).conch && (window as any).conchFloatKeyframe) {
	//@ts-ignore
	FloatKeyframe = (window as any).conchFloatKeyframe;
}
if ((window as any).qq && (window as any).qq.webglPlus) {
	//@ts-ignore
	FloatKeyframe = (window as any).qq.webglPlus.conchFloatKeyframe;
}



