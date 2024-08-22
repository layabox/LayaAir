import { Vector2 } from "../../maths/Vector2";
import { Keyframe, WeightedMode } from "./Keyframe";


/**
 * @en The `Vector2Keyframe` class is used to create instances of two-dimensional vector keyframes.
 * @zh `Vector2Keyframe` 类用于创建二维向量关键帧实例。
 */
export class Vector2Keyframe extends Keyframe {
     /**
      * @en In tangent.
      * @zh 内切线。
      */
     inTangent: Vector2 = new Vector2();
     /**
      * @en Out tangent.
      * @zh 外切线。
      */
     outTangent: Vector2 = new Vector2();
     /**
      * @en Frame data.
      * @zh 帧数据。
      */
     value: Vector2 = new Vector2();
     /**
      * @en In weight.
      * @zh 内权重。
      */
     inWeight: Vector2;
     /**
      * @en Out weight.
      * @zh 外权重。
      */
     outWeight: Vector2;
     /**
      * @en Weight mode.
      * @zh 权重模式。
      */
     weightedMode: Vector2;


     /**
      * @en Creates an instance of Vector2Keyframe.
      * @param weightMode Whether to use weight mode. Default is false.
      * @zh 创建 Vector2Keyframe 的实例。
      * @param weightMode 是否使用权重模式。默认为 false。
      */
     constructor(weightMode: boolean = false) {
          super();
          if (weightMode) {
               this.inWeight = new Vector2(Keyframe.defaultWeight, Keyframe.defaultWeight);
               this.outWeight = new Vector2(Keyframe.defaultWeight, Keyframe.defaultWeight);
               this.weightedMode = new Vector2(WeightedMode.None, WeightedMode.None);
          }
     }

     /**
     * @override
     * @en Clone
     * @param destObject The target object to clone to.
     * @zh 克隆
     * @param destObject 克隆源。
     */
     cloneTo(dest: any): void {
          super.cloneTo(dest);
          var destKeyFarme: Vector2Keyframe = (<Vector2Keyframe>dest);
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
