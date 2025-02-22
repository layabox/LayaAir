import { Vector2 } from "../../maths/Vector2";
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
	inWeight: Vector2;
	/**外权重 */
	outWeight: Vector2;
	/**权重模式 */
	weightedMode: Vector2;


	/**
	 * 创建一个 <code>Vector2Keyframe</code> 实例。
	 */
	constructor(weightMode:boolean = false) {
		super();
		if(weightMode){
			this.inWeight = new Vector2(Keyframe.defaultWeight, Keyframe.defaultWeight);
			this.outWeight = new Vector2(Keyframe.defaultWeight, Keyframe.defaultWeight);
			this.weightedMode = new Vector2(WeightedMode.None, WeightedMode.None);
		}
	}

	/**
	 * 克隆。
	 * @param dest 克隆源。
	 * @override
	 */
	cloneTo(dest: any): void {
		super.cloneTo(dest);
		var destKeyFarme: Vector2Keyframe = (<Vector2Keyframe>dest);
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
