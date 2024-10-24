import { Vector4 } from "../../maths/Vector4";
import { Keyframe, WeightedMode } from "./Keyframe";


/**
 * @en The `Vector4Keyframe` class is used to create instances of four-dimensional vector keyframes.
 * @zh `Vector4Keyframe` 类用于创建四维向量关键帧实例。
 */
export class Vector4Keyframe extends Keyframe {
    /**
     * @en In tangent.
     * @zh 内切线。
     */
	inTangent: Vector4 = new Vector4();
    /**
     * @en Out tangent.
     * @zh 外切线。
     */
	outTangent: Vector4 = new Vector4();
    /**
     * @en Frame data.
     * @zh 帧数据。
     */
	value: Vector4 = new Vector4();
    /**
     * @en In weight.
     * @zh 内权重。
     */
	inWeight: Vector4;
    /**
     * @en Out weight.
     * @zh 外权重。
     */
	outWeight: Vector4;
    /**
     * @en Out weight.
     * @zh 外权重。
     */
	weightedMode: Vector4;

    /**
     * @en Creates an instance of the `Vector4Keyframe` class.
     * @param weightMode Whether to use weight mode. Default is false.
     * @zh 创建 `Vector4Keyframe` 类的实例。
	 * @param weightMode 是否使用权重模式。默认为 false。
     */
	constructor(weightMode: boolean = false) {
		super();
		if (weightMode) {
			this.inWeight = new Vector4(Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight);
			this.outWeight = new Vector4(Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight);
			this.weightedMode = new Vector4(WeightedMode.None, WeightedMode.None, WeightedMode.None, WeightedMode.None);
		}
	}

     /**
     * @override
     * @en Clone
     * @param dest The target object to clone to.
     * @zh 克隆
     * @param dest 克隆源。
     */
	cloneTo(dest: Vector4Keyframe): void {
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