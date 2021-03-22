import { Keyframe } from "./Keyframe";
import { Quaternion } from "../math/Quaternion"
import { Vector4 } from "../math/Vector4"

/**
 * <code>QuaternionKeyframe</code> 类用于创建四元数关键帧实例。
 */
export class QuaternionKeyframe extends Keyframe {
	inTangent: Vector4 = new Vector4();
	outTangent: Vector4 = new Vector4();
	value: Quaternion = new Quaternion();

	/**
	 * 创建一个 <code>QuaternionKeyframe</code> 实例。
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
		var destKeyFarme: QuaternionKeyframe = (<QuaternionKeyframe>dest);
		this.inTangent.cloneTo(destKeyFarme.inTangent);
		this.outTangent.cloneTo(destKeyFarme.outTangent);
		this.value.cloneTo(destKeyFarme.value);
	}
}

