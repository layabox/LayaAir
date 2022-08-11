import { Vector2 } from "../math/Vector2";
import { Keyframe, WeightedMode } from "./Keyframe";


/**
 * <code>Vector2Keyframe</code> 类用于创建三维向量关键帧实例。
 */
export class Vector2Keyframe extends Keyframe {
	/**内切线 */
	inTangent: Vector2 = new Vector2();
	/**外切线 */
	outTangent: Vector2 = new Vector2();
	/**帧数据 */
	value: Vector2 = new Vector2();
	/**内权重 */
	inWeight: Vector2 = new Vector2(Keyframe.defaultWeight, Keyframe.defaultWeight);
	/**外权重 */
	outWeight: Vector2 = new Vector2(Keyframe.defaultWeight, Keyframe.defaultWeight);
	/**权重模式 */
	weightedMode: Vector2 = new Vector2(WeightedMode.None, WeightedMode.None);


	/**
	 * 创建一个 <code>Vector2Keyframe</code> 实例。
	 */
	constructor() {
		super();

	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 * @override
	 */
	cloneTo(dest: any): void {
		super.cloneTo(dest);
		var destKeyFarme: Vector2Keyframe = (<Vector2Keyframe>dest);
		this.inTangent.cloneTo(destKeyFarme.inTangent);
		this.outTangent.cloneTo(destKeyFarme.outTangent);
		this.value.cloneTo(destKeyFarme.value);
	}
}

// native
/*if ((window as any).conch && (window as any).conchFloatArrayKeyframe) {
	//@ts-ignore
	Vector2Keyframe = (window as any).conchFloatArrayKeyframe;
}
if ((window as any).qq && (window as any).qq.webglPlus) {
	//@ts-ignore
	Vector2Keyframe = (window as any).qq.webglPlus.conchFloatArrayKeyframe;
}*/