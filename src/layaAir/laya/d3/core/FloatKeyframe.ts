import { Keyframe, WeightedMode } from "./Keyframe";
/**
 * @en The `FloatKeyframe` class is used to create floating-point keyframe instances.
 * @zh `FloatKeyframe` 类用于创建浮点关键帧实例。
 */
export class FloatKeyframe extends Keyframe {
    /**
     * @en The in-tangent of the keyframe.
     * @zh 关键帧的内切线。
     */
	inTangent: number;
    /**
     * @en The out-tangent of the keyframe.
     * @zh 关键帧的外切线。
     */
	outTangent: number;
    /**
     * @en The value of the keyframe.
     * @zh 关键帧的值。
     */
	value: number;
    /**
     * @en The in-weight of the keyframe. Default is Keyframe.defaultWeight.
     * @zh 关键帧的内权重。默认值为 Keyframe.defaultWeight。
     */
	inWeight: number = Keyframe.defaultWeight;
    /**
     * @en The out-weight of the keyframe. Default is Keyframe.defaultWeight.
     * @zh 关键帧的外权重。默认值为 Keyframe.defaultWeight。
     */
	outWeight: number = Keyframe.defaultWeight;
    /**
     * @en The weighted mode of the keyframe. Default is WeightedMode.None.
     * @zh 关键帧的权重模式。默认值为 WeightedMode.None。
     */
	weightedMode: number = WeightedMode.None;

     /**
      * @ignore
      * @en Creates an instance of `FloatKeyframe`.
      * @zh 创建一个 `FloatKeyframe` 的实例。
      */
	constructor() {
		super();
	}

	/**
	 * @inheritDoc
	 * @override
     * @en Clones the data to another object.
     * @param destObject The target object to clone to.
     * @zh 克隆数据到目标对象。
	 * @param destObject 拷贝数据结构
     */
	cloneTo(destObject: FloatKeyframe): void {
		super.cloneTo(destObject);
		destObject.inTangent = this.inTangent;
		destObject.outTangent = this.outTangent;
		destObject.value = this.value;
		destObject.inTangent = this.inTangent;
		destObject.outTangent = this.outTangent;
		destObject.value = this.value;
		destObject.inWeight = this.inWeight;
		destObject.outWeight = this.outWeight;
		destObject.weightedMode = this.weightedMode;
	}

    /**
     * @en Clones.
     * @zh 克隆
     */
	clone(): FloatKeyframe {
		let f = new FloatKeyframe();
		this.cloneTo(f);
		return f;
	}

}


