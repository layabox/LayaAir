import { Vector3 } from "../../maths/Vector3";
import { Keyframe, WeightedMode } from "./Keyframe";

/**
 * @en The `Vector3Keyframe` class is used to create instances of three-dimensional vector keyframes.
 * @zh `Vector3Keyframe` 类用于创建三维向量关键帧实例。
 */
export class Vector3Keyframe extends Keyframe {
	/**
	 * @en In tangent.
	 * @zh 内切线。
	 */
	inTangent: Vector3 = new Vector3();
	/**
	 * @en Out tangent.
	 * @zh 外切线。
	 */
	outTangent: Vector3 = new Vector3();
	/**
	 * @en Frame data.
	 * @zh 帧数据。
	 */
	value: Vector3 = new Vector3();
	/**
	 * @en In weight.
	 * @zh 内权重。
	 */
	inWeight: Vector3;
	/**
	 * @en Out weight.
	 * @zh 外权重。
	 */
	outWeight: Vector3;
	/**
	 * @en Weight mode.
	 * @zh 权重模式。
	 */
	weightedMode: Vector3;


	/**
	 * @en Creates an instance of Vector3Keyframe.
	 * @param weightMode Whether to use weight mode. Default is false.
	 * @zh 创建一个Vector3Keyframe实例。
	 * @param weightMode 是否使用权重模式。默认为 false。
	 */
	constructor(weightMode: boolean = false) {
		super();
		if (weightMode) {
			this.inWeight = new Vector3(Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight);
			this.outWeight = new Vector3(Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight);
			this.weightedMode = new Vector3(WeightedMode.None, WeightedMode.None, WeightedMode.None);
		}

	}

	/**
	* @override
	* @en Clone
	* @param dest The target object to clone to.
	* @zh 克隆
	* @param dest 克隆源。
	*/
	cloneTo(dest: Vector3Keyframe): void {
		super.cloneTo(dest);
		this.inTangent.cloneTo(dest.inTangent);
		this.outTangent.cloneTo(dest.outTangent);
		this.value.cloneTo(dest.value);
		if (this.weightedMode) {
			this.inWeight.cloneTo(dest.inWeight);
			this.outWeight.cloneTo(dest.outWeight);
			this.weightedMode.cloneTo(dest.weightedMode);
		}

	}
}