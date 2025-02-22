import { Quaternion } from "../../maths/Quaternion";
import { Vector4 } from "../../maths/Vector4";
import { Keyframe } from "./Keyframe";

/**
 * <code>QuaternionKeyframe</code> 类用于创建四元数关键帧实例。
 */
export class QuaternionKeyframe extends Keyframe {
	/**内切线 */
	inTangent: Vector4 = new Vector4();
	/**外切线 */
	outTangent: Vector4 = new Vector4();
	/**帧数据 */
	value: Quaternion = new Quaternion();
	/**内权重 */
	inWeight: Vector4;
	/**外权重 */
	outWeight: Vector4;
	/**权重模式*/
	weightedMode: Vector4;

	/**
	 * 创建一个 <code>QuaternionKeyframe</code> 实例。
	 */
	constructor(weightMode: boolean = false) {
		super();
		if (weightMode) {
			this.inWeight = new Vector4();
			this.outWeight = new Vector4();
			this.weightedMode = new Vector4();
		}
	}

	/**
	 * 克隆。
	 * @param dest 克隆源。
	 * @override
	 */
	cloneTo(dest: any): void {
		super.cloneTo(dest);
		var destKeyFarme: QuaternionKeyframe = (<QuaternionKeyframe>dest);
		this.inTangent.cloneTo(destKeyFarme.inTangent);
		this.outTangent.cloneTo(destKeyFarme.outTangent);
		this.value.cloneTo(destKeyFarme.value);
		if (this.weightedMode) {
			this.inWeight.cloneTo(destKeyFarme.inWeight);
			this.outWeight.cloneTo(destKeyFarme.outWeight);
			this.weightedMode.cloneTo(destKeyFarme.weightedMode);
		}
	}
}

