import { Vector3 } from "../../maths/Vector3";
import { Keyframe, WeightedMode } from "./Keyframe";

/**
 * <code>Vector3Keyframe</code> 类用于创建三维向量关键帧实例。
 */
export class Vector3Keyframe extends Keyframe {
	/**内切线 */
	inTangent: Vector3 = new Vector3();
	/**外切线 */
	outTangent: Vector3 = new Vector3();
	/**帧数据 */
	value: Vector3 = new Vector3();
	/**内权重 */
	inWeight: Vector3;
	/**外权重 */
	outWeight: Vector3;
	/**权重模式 */
	weightedMode: Vector3;


	/**
	 * 创建一个 <code>Vector3Keyframe</code> 实例。
	 */
	constructor(weightMode:boolean = false) {
		super();
		if(weightMode){
			this.inWeight = new Vector3(Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight);
			this.outWeight = new Vector3(Keyframe.defaultWeight, Keyframe.defaultWeight, Keyframe.defaultWeight);
			this.weightedMode = new Vector3(WeightedMode.None, WeightedMode.None, WeightedMode.None);
		}
		
	}

	/**
	 * 克隆。
	 * @param dest 克隆源。
	 * @override
	 */
	cloneTo(dest: any): void {
		super.cloneTo(dest);
		var destKeyFarme: Vector3Keyframe = (<Vector3Keyframe>dest);
		this.inTangent.cloneTo(destKeyFarme.inTangent);
		this.outTangent.cloneTo(destKeyFarme.outTangent);
		this.value.cloneTo(destKeyFarme.value);
		if(this.weightedMode){
			this.inWeight.cloneTo(destKeyFarme.inWeight);
			this.outWeight.cloneTo(destKeyFarme.outWeight);
			this.weightedMode.cloneTo(destKeyFarme.weightedMode);
		}
		
	}
}