import { Vector4 } from "../math/Vector4";
import { Keyframe, WeightedMode } from "./Keyframe";


/**
 * <code>Vector4Keyframe</code> 类用于创建三维向量关键帧实例。
 */
export class Vector4Keyframe extends Keyframe {
	/**内切线 */
	inTangent: Vector4 = new Vector4();
	/**外切线 */
	outTangent: Vector4 = new Vector4();
	/**帧数据 */
	value: Vector4 = new Vector4();
	/**内权重 */
	inWeight: Vector4 = new Vector4(Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight);
	/**外权重 */
	outWeight: Vector4 = new Vector4(Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight,Keyframe.defaultWeight);
	/**权重模式 */
	weightedMode: Vector4 = new Vector4(WeightedMode.None, WeightedMode.None, WeightedMode.None,WeightedMode.None);


	/**
	 * 创建一个 <code>Vector4Keyframe</code> 实例。
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
		var destKeyFarme: Vector4Keyframe = (<Vector4Keyframe>dest);
		this.inTangent.cloneTo(destKeyFarme.inTangent);
		this.outTangent.cloneTo(destKeyFarme.outTangent);
		this.value.cloneTo(destKeyFarme.value);
		this.inWeight.cloneTo(destKeyFarme.inWeight);
		this.outWeight.cloneTo(destKeyFarme.outWeight);
		this.weightedMode.cloneTo(destKeyFarme.weightedMode);
	}
}