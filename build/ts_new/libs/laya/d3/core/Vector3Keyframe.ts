import { Keyframe } from "./Keyframe";
import { Vector3 } from "../math/Vector3"

/**
 * <code>Vector3Keyframe</code> 类用于创建三维向量关键帧实例。
 */
export class Vector3Keyframe extends Keyframe {
	inTangent: Vector3 = new Vector3();
	outTangent: Vector3 = new Vector3();
	value: Vector3 = new Vector3();

	/**
	 * 创建一个 <code>Vector3Keyframe</code> 实例。
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
		var destKeyFarme: Vector3Keyframe = (<Vector3Keyframe>dest);
		this.inTangent.cloneTo(destKeyFarme.inTangent);
		this.outTangent.cloneTo(destKeyFarme.outTangent);
		this.value.cloneTo(destKeyFarme.value);
	}
}

// native
/*if ((window as any).conch && (window as any).conchFloatArrayKeyframe) {
	//@ts-ignore
	Vector3Keyframe = (window as any).conchFloatArrayKeyframe;
}
if ((window as any).qq && (window as any).qq.webglPlus) {
	//@ts-ignore
	Vector3Keyframe = (window as any).qq.webglPlus.conchFloatArrayKeyframe;
}*/