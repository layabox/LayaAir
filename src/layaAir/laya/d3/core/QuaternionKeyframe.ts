import { Quaternion } from "../../maths/Quaternion";
import { Vector4 } from "../../maths/Vector4";
import { Keyframe } from "./Keyframe";

/**
 * @en The `QuaternionKeyframe` class is used to create quaternion keyframe instances.
 * @zh `QuaternionKeyframe` 类用于创建四元数关键帧实例。
 */
export class QuaternionKeyframe extends Keyframe {
    /**
     * @en In-tangent of the keyframe
     * @zh 内切线
     */
	inTangent: Vector4 = new Vector4();
    /**
     * @en Out-tangent of the keyframe
     * @zh 外切线
     */
	outTangent: Vector4 = new Vector4();
    /**
     * @en Frame data (quaternion value)
     * @zh 帧数据（四元数值）
     */
	value: Quaternion = new Quaternion();
    /**
     * @en In-weight of the keyframe
     * @zh 内权重
     */
	inWeight: Vector4;
    /**
     * @en Out-weight of the keyframe
     * @zh 外权重
     */
	outWeight: Vector4;
    /**
     * @en Weight mode of the keyframe
     * @zh 权重模式
     */
	weightedMode: Vector4;

    /**
     * @en Creates an instance of `QuaternionKeyframe`.
     * @param weightMode Whether to enable weight mode
     * @zh 创建一个 `QuaternionKeyframe` 的实例。
	 * @param weightMode 是否启用权重模式
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
	 * @override
     * @en Clone the QuaternionKeyframe.
     * @param dest The target object to clone to
     * @zh 克隆。
     * @param dest 克隆源。
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

